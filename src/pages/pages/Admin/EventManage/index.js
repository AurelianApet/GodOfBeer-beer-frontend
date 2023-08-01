import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

import SearchInputer from '../../../components/SearchInputer';
import { executeQuery } from '../../../../library/utils/fetch';

class EventManage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sEventData: [],
      sEventOriginData: [],
    }
  }

  componentDidMount = () => {
    this.getEventData();
  }

  getEventData = () => {
    executeQuery({
      method: 'get',
      url: '/event/fetchall',
      success: ( res ) => {
        const result = res.event || [];
        this.setState({
          sEventData: result,
          sEventOriginData: result,
        })
      },
      fail: ( err, res ) => {

      }
    })
  }

  handleSearchWordInputed = ( aData ) => {
    this.setState({
      sEventData: aData,
    });
  }

  renderEventItem = ( aEventItem, aEventIndex ) => {
    const startDate = new Date( aEventItem.startDate || '' );
    const endDate = new Date( aEventItem.endDate || '' );
    return (
      <div key={aEventIndex} className='event-item'>
        <div className='event-item-content'>
          <div className='event-item-content-container'>
            <div className='event-item-title'>{aEventItem.eventName || ''}</div>
            <div className='event-item-period'>{`${moment( startDate ).format( 'YYYY-MM-DD HH:mm:ss' )} ~ ${moment( endDate ).format( 'YYYY-MM-DD HH:mm:ss' )}`}</div>
            <div className='event-item-other'>{`[전국 매장] / [매장 이벤트]`}</div>
          </div>
        </div>
        <div className='event-item-operation-buttons'>
          <div className='event-item-button event-item-accept-button'>응모하기</div>
          <div className='event-item-button event-item-detail-button'>상세보기</div>
        </div>
      </div>
    );
  }

  render() {
    const { sEventData, sEventOriginData } = this.state;
    return (
      <div className='container-page-event-manage'>
        <div className='event-manage-search-inputer'>
          <SearchInputer
            pData={sEventOriginData}
            pHandleSearch={this.handleSearchWordInputed}
          />
        </div>
        <div className='event-manage-content'>
          {_.map( sEventData, ( eventItem, eventIndex ) => {
            return this.renderEventItem( eventItem, eventIndex );
          })}
        </div>
      </div>
    );
  }
}

EventManage.propTypes = {
};

EventManage.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(EventManage);