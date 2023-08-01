import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import cn from 'classnames';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Collapse } from 'reactstrap';

import { processSuccessResponse, pushNotification, NOTIFICATION_TYPE_WARNING } from '../../../library/utils/notification';
import { fetchAllNotification } from '../../../library/redux/actions/notification';
import LANG from '../../../language';
import { appConfig } from '../../../appConfig';
import { clearTableQuery } from '../Table';

class Notification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sIsLoading: false,
      isOpen: true,
      sNotifications: []
    };
  }
  
  componentDidMount() {
    let self = this;
    this.mounted = true;
    if (self.props.auth.isAuthenticated){
      self.processFetchAll();
    }
    this.interval = setInterval(() => {
      if (self.props.auth.isAuthenticated && this.mounted && !self.state.sIsLoading){
        self.processFetchAll();
      }
    }, appConfig.notificationRefreshTime);
  }

  componentWillUnmount() {
    this.mounted = false;
    clearInterval(this.interval);
  }

  componentWillReceiveProps(newProps) {
    if(!_.isEqual(newProps.auth.isAuthenticated, this.props.auth.isAuthenticated)) {
      if(!this.state.sIsLoading) {
        this.processFetchAll();
      }
    }
    this.processFetchResult(newProps);
  }
  
  handleMenuClick = (url, e) => {
    if (!url)
      return;
    this.props.history.push(url);
  }

  makeNewsMenu = (data) => {
    let menu = data;
    if (data !== '' && data.length !== 1){
      let totalCnt = 0;
      _.map(data, (item, index) => {
        totalCnt += item.count;
      })
      let tmpChilds = [];
      tmpChilds.push({
        title: totalCnt === 0 ? LANG('COMP_NOTIFICATION_NONEWS') : `${totalCnt}${LANG('COMP_NOTIFICATION_NEWS_LABEL')}`,
        headerStyle: '-1',
        footer: LANG('COMP_NOTIFICATION_SHOW_ALL'),
      });
      _.map(data, (item, index) => {
        if (item.count > 0) {
          tmpChilds.push({ 
            title: `${LANG('COMP_NOTIFICATION_NEW_LABEL')} ${item.title}`, 
            footer: `${item.count}`,
            url: item.url,
          });
        }
      })
      menu = [
        {
          newsNumber: totalCnt === 0 ? '' : totalCnt,
          childs: tmpChilds,
        }
      ]
    }
    
    return menu;
  }

  alertNotification = (data) => {
    const {sNotifications} = this.state;
    const newNotifications = data.notifications;
    if (sNotifications !== [] && sNotifications.length !== 0) {
      _.map(newNotifications, (item, index) => {
        if (item && sNotifications[index] && item.count > sNotifications[index].count){
          const count = item.count - sNotifications[index].count;
          // fix notification crash issue
          processSuccessResponse(`${count} ${LANG('COMP_NOTIFICATION_COUNT_LABEL')} ${item.title} ${LANG('COMP_NOTIFICATION_END_LABEL')}`);
        }
      });
    }    
  }

  processFetchResult = (res) => {
    if (this.mounted) {
      this.alertNotification(res);
      let filtered = res.notifications;
      delete filtered.COL_TIMETABLE;
      this.setState({
        sNotifications: filtered,
      });
    }
  }

  processFetchAll = () => {
    if (!this.mounted) {
      return;
    }
    this.setState({
      sIsLoading: true,
    });
    this.props.fetchAllNotification({
      success: (res) => {
        this.processFetchResult(res);
        if (this.mounted) {
          this.setState({ sIsLoading: false });
        }
      },
      fail: (res) => {
        if (this.mounted) {
          this.setState({ sIsLoading: false });
        }
      }
    });
  }

  renderMenuNewsItem = (obj, index, level) => {
    const hasChilds = obj.childs && obj.childs.length > 0;
    return (
      <li key={index}>
        <div className={cn( hasChilds? "info-container" : "menu-record", obj.headerStyle === '-1'? "news-header" : "")}>
          {hasChilds && 
            <img src="/assets/images/header/bell.png" alt="avatar" className="icon-bell" />
          }
          {hasChilds &&
            <div className="icon-bell-number">
              <div className="icon-bell-number-in">{obj.newsNumber}</div>
            </div>
          }
          {!hasChilds && obj.header && <i className={cn("fa", obj.header)} />}
          <div className="news-span" onClick={this.handleMenuClick.bind(this, obj.url)}>
            {obj.title}
          </div>
          {obj.footer === LANG('COMP_NOTIFICATION_SHOW_ALL') && <a className="view-all" href={obj.url}>{obj.footer}</a>}
          {obj.footer !== LANG('COMP_NOTIFICATION_SHOW_ALL') && <span className="news-footer">{obj.footer}</span>}

        </div>
        {hasChilds &&
          <ul className="info-nav-news">
            <li className="info-menu-arrow">
              <span className="arrow"></span>
            </li>
            {
              _.map(obj.childs, (item, index2) => {
                if(item.footer !== '0개'){
                  return this.renderMenuNewsItem(item, index2, level + 1);
                }
              })
            }
          </ul>
        }
      </li>
    )
  }

  renderMenuNews = () => {    
    const { sNotifications } = this.state;
    let menu = this.makeNewsMenu(sNotifications);

    return (
      <div className="menu-container">
        <Collapse isOpen={this.state.isOpen} navbar className="menu1">
          <ul className="nav navbar-nav sf-menu">
          {
            _.map(menu, (item, index) => {
              return this.renderMenuNewsItem(item, index, 0);
            })
          }
          </ul>
        </Collapse>
      </div>
    )
  }

  render() {
    return (
      <div className="container-bell">
        {this.renderMenuNews()}
      </div>
    )
  }
}

Notification.propTypes = {
  fetchAllNotification: PropTypes.func.isRequired,
  auth: PropTypes.object,
  notifications: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

Notification.defaultProps = {
  auth: {},
  notifications: [],
}

export default compose(
  withRouter,
  connect(
    state => ({
      auth: state.auth,
      notifications: state.notification.notifications
    }),
    {
      fetchAllNotification,
    }
  )
)(Notification);