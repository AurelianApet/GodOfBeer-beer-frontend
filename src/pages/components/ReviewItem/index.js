import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

import RateViewer from '../RateViewer';

class ReviewItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    const { pData } = this.props;
    const user = pData.uid || {}
    const userImg = user.image || '/assets/images/users/user-profile-not-found.jpeg'
    const userNickname = user.nickName || '';
    const createdAt = new Date( pData.createdAt || '' );
    return (
      <div className='container-component-review-item'>
        <div className='review-item-user-img'>
          <img src={userImg} alt=''/>
        </div>
        <div className='review-item-content'>
          <div className='review-item-user-info'>
            <div className='review-user-info-item'>
              <span>{userNickname}</span>
              <span>{moment( createdAt ).format( 'YYYY-MM-DD HH:mm:ss' )}</span>
            </div>
            <div className='review-user-info-item'>
              <RateViewer 
                value={Number( pData.marks ) || 0}
              />
              <div className='review-rate'>{pData.marks || 0}</div>
            </div>
          </div>
          <div className='review-item-detail'>
            <pre>{pData.content}</pre>
          </div>
        </div>
      </div>
    );
  }
}

ReviewItem.propTypes = {
  pData: PropTypes.object,
};

ReviewItem.defaultProps = {
  pData: {},
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(ReviewItem);