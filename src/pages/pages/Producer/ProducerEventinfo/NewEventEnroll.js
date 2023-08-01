import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes            from 'prop-types';

import APIForm, { 
    TYPE_TEXTAREA, 
    TYPE_EXTENDED_INPUT,
    TYPE_DATE,
    MODE_CREATE, 
    TYPE_PHOTO,
    TITLE_NORMAL,
    ERROR_BORDER}            from '../../../components/APIForm';
import _ from 'lodash';
import { Modal, ModalHeader, ModalBody } from '../../../components/Modal';
import { TYPE_RADIO, TYPE_CUSTOM } from '../../../components/ComponentArray';

import { compose } from 'redux';
import { connect } from 'react-redux';
import { pushNotification, NOTIFICATION_TYPE_SUCCESS } from '../../../../library/utils/notification';

class NewEventEnroll extends Component {
	constructor(props) {
		super(props)
		this.state = {
			sUserId: null,
			sModalIsShown: false,
			sBlogInfoColumns: [
					[
						{
							name: 'eventImg',
							type: TYPE_PHOTO,
							title: {
									string: '이미지 찾기'
							},
							rowSpan: 8
						},
						{
							name: 'eventName',
							type: TYPE_EXTENDED_INPUT,
							title: {
									type: TITLE_NORMAL,
									string: '이 벤 트 명',
							},
							valid: {
									required: {
											isRequired: true,
									},
							},
						},
					],
							
					[{
							name: 'eventType',
							type: TYPE_RADIO,

							title: {
									string: '이벤트 종류',
							},
							
							value: [
									{value: 'choose_event', title: '추첨 이벤트'},
									{value: 'present_event', title: '증정 이벤트'}
							],
							defaultValue: 'choose_event',
							valid: {
									required: {
											isRequired: true,
									},
							},
					}],

					[{
							name: 'startDate',
							type: TYPE_DATE,

							title: {
									string: '기 간(start)',
							},

					}],

					[{
							name: 'endDate',
							type: TYPE_DATE,

							title: {
									string: '기 간(end)',
							},

					}],

					[{
							name: 'announcementDate',
							type: TYPE_DATE,
							title: {
									string: '발 표 일',
							},

					}],

					[{
							name: 'condition',
							type: TYPE_CUSTOM,
							title: {
									string: '응 모 조 건'
							},
							customRender: this.renderEventCondition
					}],
					
					[{
							name: 'content',
							type: TYPE_TEXTAREA,

							title: {
									type: TITLE_NORMAL,
									string: '내 용',
							},
							valid: {
							required: {
									isRequired: false,
							},
							},
					}],
			],
			sConditionValue: [
				{
						title: '용량',
						titleInput: 'ml 이상',
						value: 'storage',
						id: 'storageId'
				},
				{
						title: '개수',
						titleInput: '병 이상',
						value: 'bottle',
						id: 'bottleId'
				},
				{
						title: '가격',
						titleInput: '원 이상',
						value: 'cost',
						id: 'costId'
				}
			],
			sIsVisibleInput: {
				0: true,
				1: true,
				2: true
			}
		};
		this.checked = {};
	}

	componentDidMount() {
		const userId = _.get( this.props, 'user._id' ) || '';
		this.setState({
			sUserId: userId,
		})
	}

	/**
	 * handle functinos
	 **/
	handleCreateEvent = () => {

	}

	/**
	 * process functions
	 **/
	handleClickCancel = (e) => {
			if (e) {
					e.preventDefault();
			}
			this.props.pHandleNewEventModalVisible();
	}

	handleSubmitBtn = () => {
			this.apiForm.handleSubmitForm();
			this.handleClickCancel();
	}
	
	handleConditionChecked = (aIndex, e) => {
		const { sIsVisibleInput } = this.state;
		const crrChecked = this.checked[aIndex] || false;
		this.checked[aIndex] = !crrChecked;
		sIsVisibleInput[aIndex] = !this.checked[aIndex];
		this.setState(sIsVisibleInput);
	}
	
	handleConditionInput = (parent, e) => {
		parent.handleElementOnChange(e.value);
	}


	/**
	 * other functions
	 **/



	/**
	 * render functions
	 **/

	renderEventCondition = (item, defaultData, mode, error, index, tabIndex, parent) => {
		const { sConditionValue, sIsVisibleInput } = this.state;
		return (
			<div>
				{_.map( sConditionValue, (condition, conditionIndex) => {
					return (
						<div className = "custom-condition-input-div" key = {conditionIndex}>
							<input 
								type = "checkbox"
								className = 'event-condition-input-checkbox'
								value = {`${condition.name}Value`}
								onChange = {this.handleConditionChecked.bind(this, conditionIndex)}/> {condition.title}
							<input 
								id = {condition.id}
								className = 'event-condition-input'
								name = {condition.name}
								readOnly = {sIsVisibleInput[conditionIndex]}
								onChange = {this.handleConditionInput.bind(this, parent)}
							/> {condition.titleInput} <br/>
						</div>
					);
				})}
			</div>
		);
	}

	render() {
		const {sBlogInfoColumns, sUserId} = this.state;
		const {pIsModalVisible} = this.props;
		return (
            <Modal
							toggle={this.handleClickCancel}
							isOpen={pIsModalVisible}
							className="container-page-producer-new-event"
            	>
							<ModalHeader className="modal-header" toggle={this.handleClickCancel}>
									<div className = "modal-title">{'이벤트 신규 등록'}</div>
							</ModalHeader>
							<ModalBody className="modal-body">
								<APIForm
										onRef={(ref) => {this.apiForm = ref}}
										pMode={{
										mode: MODE_CREATE,
										}}
										pFormInfo={sBlogInfoColumns}
										pAPIInfo={{
											create: {
												queries: [{
													method: 'post',
													url: '/event/create',
													data: ( formData ) => {
														formData.uid = sUserId || '';
														return formData;
													}
												}],
												callback: ( res, func ) => {
													pushNotification(NOTIFICATION_TYPE_SUCCESS, '이벤트를 저장했습니다');
													this.handleClickCancel();
												},
											},
										}}
										pThemeInfo={{
										error: {
												errorStyle: ERROR_BORDER,
												showAll: true,
												errColor: '#ff6400',
										}
										}}
								/>
								<div className = "new-event-button-group" >
										<button className = "simple-button" onClick = {this.handleSubmitBtn}>저장</button>
										<button className = "simple-button" onClick = {this.handleClickCancel}>취소</button>
								</div>
							</ModalBody>
					</Modal>
		);
	}
}

NewEventEnroll.propTypes = {
    pHandleNewEventModalVisible: PropTypes.func,
};

NewEventEnroll.defaultProps = {
    pHandleNewEventModalVisible: () => {},
};

export default compose(
	withRouter,
	connect(
		state => ({
			user: state.auth.user,
		}),
	)
)(NewEventEnroll);
