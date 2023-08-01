import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import { executeQuery } from '../../../../library/utils/fetch';
import BeerItem from '../../../components/BeerItem';
import RateViewer from '../../../components/RateViewer';
import Loading from '../../../components/Loading';
import { pushNotification, NOTIFICATION_TYPE_SUCCESS } from '../../../../library/utils/notification';
import { confirmAlertMsg } from '../../../../library/utils/confirmAlert';
import LANG  from '../../../../language';

class UserReview extends Component {
	constructor(props) {
		super(props)
		this.state = {
      sReviewData: [],
      sFetchStatus: false,
			sIsMobileDimension: props.isMobileDimension,
    };
	}

	componentDidMount() {
    this.getReviewData();
  }

  componentWillReceiveProps = ( newProps ) => {
		this.setState({
			sIsMobileDimension: newProps.isMobileDimension,
		})
	}
  
  getReviewData = () => {
    const uid = _.get( this.props, 'user._id' ) || '';
    if ( uid ) {
      executeQuery({
        method: 'get',
        url: `/review/fetchlist?uid=${uid}`,
        success: (res) => {
          const result = _.get(res, 'review');
          this.setState({ 
            sFetchStatus: true,
            sReviewData: result 
          })
        },
        fail: (err) => {
  
        }
      });
    } else {
      setTimeout(() => {
        this.getReviewData();
      }, 100)
    }
  }

  handleDeleteReview = ( aIndex ) => {
    const { location: { pathname } } = this.props;
		let confirmParam = {
			title: LANG('BASIC_DELETE'),
			detail: LANG('BASIC_ALERTMSG_DELETE_REVIEW'),
			confirmTitle: LANG('BASIC_ALERTMSG_YES'),
			noTitle: LANG('BASIC_ALERTMSG_NO'),
			confirmFunc: this.proccessDeleteReview.bind( this, aIndex ),
		};
		confirmAlertMsg(confirmParam, pathname);
  }

  proccessDeleteReview = ( aIndex ) => {
    const { sReviewData } = this.state;
    const id = _.get( sReviewData, `[${aIndex}]._id` ) || '';
    const beerId = _.get( sReviewData, `[${aIndex}].beerId._id` ) || '';
    if ( id && beerId ) {
      executeQuery({
        method: 'delete',
        url: `/review/${id}`,
        data: {
          beerId: beerId,
        },
        success: ( res ) => {
          pushNotification( NOTIFICATION_TYPE_SUCCESS, '성공적으로 삭제되었습니다.' );
          this.getReviewData();
        },
        fail: ( err, res ) => {}
      });
    }
  }

	render() {
    const { sReviewData, sFetchStatus, sIsMobileDimension } = this.state;
    if (sFetchStatus) {
      return (
        <div className='container-page-user-review'>
          {_.map( sReviewData, ( reviewItem, index ) => {
            return (
              <div className='user-review-item' key={reviewItem._id}>
                <BeerItem
                  pData={reviewItem.beerId || {}}
                  isMobileDimension={sIsMobileDimension}
                />
                <div className='user-review-rate'>
                  <RateViewer
                    value={Number( reviewItem.marks )}
                  />
                </div>
                <div className='user-review-detail'>{reviewItem.content}</div>
                <div className='delete-review-button' onClick={this.handleDeleteReview.bind( this, index )}>삭제</div>
              </div>
            )
          })}
        </div> 
      );
    } else {
      return (
        <div className="loading-wrapper"> 
          <Loading />
        </div>
      )
    }
	}
}

UserReview.propTypes = {
};

UserReview.defaultProps = {
};

export default compose(
	withRouter,
	connect(
	  state => ({
		user: state.auth.user,
	  }),
	)
)(UserReview);