import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import LANG   																				from '../../../../language';
import { confirmAlertMsg } 														from '../../../../library/utils/confirmAlert';
import NewEventEnroll																	from './NewEventEnroll';
import { executeQuery } 															from '../../../../library/utils/fetch';
import BeerTable, { TYPE_NO, TYPE_IMG } 							from '../../../components/BeerTable';
import EventDetail																		from './EventDetail';

class ProducerEventinfo extends Component {
	constructor(props) {
		super(props)
		this.state = {
			sIsModalVisible: false,
			sDetailShow: false,
			sDataItem: null,
			sColumns : [
				{
					type: TYPE_NO,
					title: 'No'
				},
				{
					name: 'createdAt',
					title: '등록일'
				},
				{
					name: 'eventImg',
					title: '이벤트 이미지',
					type: TYPE_IMG
				},
				{
					name: 'eventName',
					title: '이벤트명',
					className: 'click-event-detail',
					clickFunc: this.handleClickEventDetail
				},
				{
					name: 'eventDate',
					title: '응모기간',
					customRender: this.renderEventDate
				},
				{
					name: 'announcementDate',
					title: '발표일'
				},
				{
					name: 'condition',
					title: '응모현황'
				},
				{
					name: 'content',
					title: '처리상태'
				}
			]
		};
	}

	componentDidMount() {
	}

	/**
	 * handle functinos
	 **/
	handleClickEventDetail = (value, dataItem, columnItem) => {
		this.setState({ sDataItem: dataItem, sDetailShow: true });
	}


	handelNewEventEnroll = () => {
		this.setState(prev => ({ sIsModalVisible: !prev.sIsModalVisible }));
		this.beerTable.refresh();
	}

	handleDeleteEvent = () => {
		const { location: { pathname } } = this.props;
		let confirmParam = {
			title: LANG('BASIC_DELETE'),
			detail: LANG('BASIC_ALERTMSG_DELETE_EVENT'),
			confirmTitle: LANG('BASIC_ALERTMSG_YES'),
			noTitle: LANG('BASIC_ALERTMSG_NO'),
			confirmFunc: this.processDeleteEvent,
		};
		confirmAlertMsg(confirmParam, pathname);
  }
  
  processDeleteEvent = () => {
		const selectedEvent = this.beerTable.getCheckedItems();
		let ids = [];
		_.map( selectedEvent, ( eventItem, eventIndex ) => {
			ids.push( eventItem._id );
		});
		if ( ids.length > 0 ) {
			executeQuery({
				method: 'post',
				url: '/event/multidel',
				data: {
					ids,
				},
				success: ( res ) => {
					this.beerTable.refresh();
				},
				fail: ( err, res ) => {

				}
			})
		}
	}
	/**
	 * process functions
	 **/



	/**
	 * other functions
	 **/



	/**
	 * render functions
	 **/

	renderEventDate = (value, dataItem, columnItem) => {
		return (
			<div>
				<div>{`${dataItem.startDate}-${dataItem.endDate}`}</div>
			</div>
		)
	} 

	render() {
		const { sIsModalVisible, sColumns, sDataItem, sDetailShow } = this.state;
		const userId = _.get( this.props, 'user._id' ) || '';
		return (
			<div className="container-page-producer-eventinfo">
				{
					sDetailShow &&
					<EventDetail
						pDataItems = {sDataItem}
					/>
				}
				{
					!sDetailShow && 
					<div className="commonBorder border-style">
					<div className = "overflow">
						<div className="panel-heading div-heading flex-heading">
							<div id="header-title1"><p>이벤트 관리</p></div>
							
							<div className="margin-bottom">
								<button className="create-event" onClick={this.handelNewEventEnroll}>추가</button>
								<button className="create-event" onClick={this.handleDeleteEvent}>삭제</button>
							</div>
						</div>
						<div>
							<BeerTable
									onRef={( ref ) => {this.beerTable = ref}}
									pColumns = {sColumns}
									operation={{
										multiCheck: true,
									}}
									getDataFunc={( res ) => { return res.event || [] }}

									url={`/event/fetchlist?uid=${userId}`}
								/>
						</div>
					</div>
					</div>


				}
				
				{
					<NewEventEnroll
						pHandleNewEventModalVisible = { this.handelNewEventEnroll }
						pIsModalVisible = { sIsModalVisible }
					/>
				}

			</div>
		);
	}
}

ProducerEventinfo.propTypes = {
};

ProducerEventinfo.defaultProps = {
};

export default compose(
	withRouter,
	connect(
	  state => ({
		user: state.auth.user,
	  }),
	)
)(ProducerEventinfo);