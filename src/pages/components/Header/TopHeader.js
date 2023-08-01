import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import cn from 'classnames';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Collapse } from 'reactstrap';

import Notification from '../Notification/Notification';
import LANG from '../../../language';

import { signOut } from '../../../library/redux/actions/auth';
import { confirmAlertMsg } from '../../../library/utils/confirmAlert';
import { fetchAllNotification } from '../../../library/redux/actions/notification';

const menu_info  = [
  {
    title: '',
    childs: [
      {
        title: LANG('COMP_HEADER_MENU_MYINFO'),
        iconClass: 'fa fa-user',
        url: '/account/myinfo',
      },
      {
        title: LANG('COMP_HEADER_MENU_TOMANAGER'),
        iconClass: 'fa fa-envelope-o',
        url: '/account/toadmin',
      },
      {
        title: LANG('COMP_HEADER_MENU_LOGOUT'),
        iconClass: 'fa fa-sign-out',
        url: '/logout',
      },
    ]
  }
];

class TopHeader extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isOpen: true,
      sNotifications: []
    };
  }

  handleLogoClick = () => {
    this.props.history.push('/');
  }

  handleSignOut = () => {
    this.props.signOut();
  }

  handleMenuClick = (url, e) => {
    const { location: { pathname } } = this.props;
    if (!url)
      return;
    if (url === '/logout') {
      let confirmParam = {
        className: 'signout-confirm',
        title: LANG('BASIC_ALERTMSG_TITLE'),
        detail: LANG('BASIC_ALERTMSG_LOGOUT'),
        confirmTitle: LANG('BASIC_ALERTMSG_YES'),
        noTitle: LANG('BASIC_ALERTMSG_NO'),
        confirmFunc: this.handleSignOut
      };
      confirmAlertMsg(confirmParam, pathname);      
    } else {
      this.props.history.push(url);
    }
  }
  
  renderMenuItem = (obj, index, level) => {
    const hasChilds = obj.childs && obj.childs.length > 0;
    const avatar = _.get(this.props.auth, 'user.avatar') || "/assets/images/header/avatar.png";
    return (
      <li key={index}>
        <div className={cn( hasChilds? "info-container" : "menu-record")} onClick={this.handleMenuClick.bind(this, obj.url)}>
          {hasChilds &&
            <img src={avatar} alt="avatar" className="icon-avatar"/>
          }
          {!hasChilds &&
            <i className={cn(obj.iconClass, "info-icon")} />
          }
          <span>{obj.title}</span>
          {obj.remainNumber &&
            <span className="remain-number">{obj.remainNumber}</span>
          }

        </div>
        {hasChilds &&
          <ul className="info-nav">
            <li className="info-menu-arrow">
              <span className="arrow"></span>
            </li>
            {
              _.map(obj.childs, (item, index2) => {
                return this.renderMenuItem(item, index2, level + 1);
              })
            }
          </ul>
        }
      </li>
    )
  }
  
  renderMenuInfo = () => {    
    let menu = menu_info;

    return (
      <div className="menu-container">
        <Collapse isOpen={this.state.isOpen} navbar className="menu1">
          <ul className="nav navbar-nav sf-menu">
          {
            _.map(menu, (item, index) => {
              return this.renderMenuItem(item, index, 0);
            })
          }
          </ul>
        </Collapse>
      </div>
    )
  }
  
  render() {
    const { auth: { isAuthenticated } } = this.props;

    let imgLogo="";
    let imgBanner="";
    let imgBar="";
    let imgFavourteFind="/assets/images/header/favourite-find.png";
    imgLogo="/assets/images/header/Logo.png";
    imgBanner="/assets/images/header/Banner.png";
    imgBar="/assets/images/header/Bar.png";
    
    return (
      <div className="top-header-container">
        <div className="top-header-logo">
          <img src={imgLogo} alt="Logo" onClick={this.handleLogoClick}/> 
        </div>
        <div className="top-header-banner">
          <img src={imgBanner} className="top-header-banner-img" alt="Banner" /> 
          <img src={imgBar} className="top-header-bar" alt="Bar" />
        </div>
        <div className="top-header-menu">
          {isAuthenticated && <div className ="icon-favourte-find">
            <img src={imgFavourteFind} className="top-header-favourteFind-img" alt="FavouriteFind" />
          </div>}
          {isAuthenticated && <Notification />}
          {isAuthenticated && <div className="icon-person">
            {this.renderMenuInfo()}
          </div>}
        </div>
      </div>
    )
  }
}

TopHeader.propTypes = {
  signOut: PropTypes.func.isRequired,
};

export default compose(
  withRouter,
  connect(
    state => ({
      auth: state.auth,
    }),
    {
      signOut,
      fetchAllNotification, 
    }
  )
)(TopHeader);