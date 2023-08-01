import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

class NoticeItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sIsColapsed: true,
    }
  }

  handleToggleColapsed = () => {
    this.setState(prev => ({ sIsColapsed: !prev.sIsColapsed }));
  }

  handleEdit = ( e ) => {
    if ( e ) {
      e.stopPropagation();
    }
    const { pHandleEdit, pData } = this.props;
    pHandleEdit( pData );
  }

  handleDelete = ( e ) => {
    if ( e ) {
      e.stopPropagation();
    }
    const { pHandleDelete, pData } = this.props;
    pHandleDelete( pData );
  }

  render() {
    const { pData } = this.props;
    const { sIsColapsed } = this.state;
    const createdAt = new Date( pData.createdAt || '');
    return (
      <div className='container-component-notice-item' onClick={this.handleToggleColapsed}>
        <div className='notice-header'>
          <div className='notice-title'>
            <i className={cn('fa fa-chevron-right', sIsColapsed? '' : 'notice-uncolapsed-icon')} />
            <span>[공지]</span>
            <span className='notice-name'>{pData.title || ''}</span>
          </div>
          <div className='notice-createdAt'>{moment( createdAt ).format( 'YYYY-MM-DD HH:mm:ss' )}</div>
        </div>
        {!sIsColapsed &&
          <div className='notice-content-container'>
            <div className='notice-content'>
              <pre>{pData.content || ''}</pre>
            </div>
            <div className='notice-operation-buttons'>
              <i className='fa fa-edit' onClick={this.handleEdit}/>
              <i className='fa fa-trash' onClick={this.handleDelete}/>
            </div>
          </div>
        }
      </div>
    );
  }
}

NoticeItem.propTypes = {
  pData: PropTypes.object,
  pHandleEdit: PropTypes.func,
  pHandleDelete: PropTypes.func,
};

NoticeItem.defaultProps = {
  pData: {},
  pHandleEdit: () => {},
  pHandleDelete: () => {},
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(NoticeItem);