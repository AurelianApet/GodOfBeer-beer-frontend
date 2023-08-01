import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { executeQuery } from '../../../../library/utils/fetch';
import _ from 'lodash';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Loading from '../../../components/Loading';
import { maskNumber } from '../../../../library/utils/masks';

class Point extends Component {
	constructor(props) {
		super(props)
		this.state = {
			sData: {},
			sFetchStatus: false,
    };
	}


	/**
	 * handle functinos
	 **/

	componentDidMount = () => {
    this.getPointData(this.props);
  }

  componentWillReceiveProps = (newProps) => {
    this.getPointData(newProps)
  }

  getPointData = (aProps) => {
		const userId = _.get( aProps, 'user._id' ) || '';
		if (userId) {
			executeQuery({
				method: 'get',
				url: `/point/fetchlist?uid=${userId}`,
				success: (res) => {
					const result = _.get(res, 'point.[0]') || {};
					this.setState({ 
						sData: result, 
						sFetchStatus: true });
				},
				fail: (err, res) => {
	
				}
			})
		}
  }

  handlePointDetail = () => {
    const userId = _.get( this.props, 'user._id' ) || '';
    this.props.history.push(`/user/point/detail/${userId}`)
  }

	/**
	 * process functions
	 **/


	/**
	 * render functions
	 **/
	render() {
		const { sData, sFetchStatus } = this.state;
		if (sFetchStatus) {
			return (
				<div>
					<div className="container-page-user-point">
						<div className="container-page-main">
							<div className="point-content-title">맥주의 신 포인트</div>
							<div className="point-content-value" onClick={this.handlePointDetail}><span>{maskNumber(_.get(sData, 'remain') || 0)}P</span></div>
						</div>
					</div>
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

Point.propTypes = {
};

Point.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(Point);