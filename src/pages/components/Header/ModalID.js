import React, { Component } from 'react';

import { Modal, ModalHeader, ModalBody } from '../../components/Modal';
import APIForm, { 
	MODE_CREATE, 
	ACTION_SUBMIT, 
	BUTTON_NORMAL, 
	TYPE_BUTTON,
	TYPE_BLANK,
	TITLE_NORMAL,
	ERROR_BORDER, 
	TYPE_INPUT} from '../../components/APIForm';

import { 
	MODAL_ID,
	MODAL_LOGIN } from './HeaderBeer';
import LANG from '../../../language';

export class ModalID extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sIsVisible: true,
		}
	}

	// other function
	closeModalID = (e) => {
		if ( e ) {
			e.preventDefault();
		}
		this.setState({ sIsVisible: false });
		this.props.handleModal(MODAL_ID, false);
	}

	goToModalLogin = () => {
		this.setState({ sIsVisible: false });
		this.props.handleModal(MODAL_LOGIN, true);
	}

	// render function
	render() {
		const { sIsVisible } = this.state;
		return (
			<div className="container-modal-ID">
				<Modal
					isOpen={sIsVisible}
					toggle={this.closeModalID}
					className="modal-ID"
				>
					<ModalHeader 
						toggle={this.closeModalID} 
						className="modal-ID-header"
					>
						<div className="back-label" onClick={this.goToModalLogin}>
							<span style={{color: 'black', cursor: 'pointer'}}><i className="fa fa-mail-reply">&nbsp;{ LANG('PAGE_AUTH_LOGIN_BACK') }</i></span>
						</div>
					</ModalHeader>
					<ModalBody className="modal-ID-body">
						<div className="login-logo">
							<img alt="" src="/assets/images/header/logo_main1.png"/>
						</div>
						<APIForm
							onRef={(ref) => {this.apiForm = ref}}
							pMode={{
								mode: MODE_CREATE,
							}}
							pFormInfo={[
								[{
									name: 'blank',
									className: 'note-label',
									title: {
										type: TITLE_NORMAL,
										string: LANG('PAGE_AUTH_EMAIL_NOTE')
									},
									colSpan: 2,
									type: TYPE_BLANK,
								}],
								[{
									name: 'email',
									type: TYPE_INPUT,
									title: {
										type: TITLE_NORMAL,
										string: '이메일'
									},
									valid: {
										required: {
											isRequired: true,
											errMsg: LANG( 'PAGE_AUTH_AUTHENTICATION_NO' )
										},
									},
								}],
								[{
									type: TYPE_BUTTON,
									action: {
										type: ACTION_SUBMIT,
									},
									colSpan: 2,
									kind: BUTTON_NORMAL,
									className: "find-button",
									title: LANG('PAGE_AUTH_FIND_USER_ID'),
								}],
							]}
							pAPIInfo={{
								create: {
									queries: [{
										method: 'post',
										url: '/auth/find-id',
									}],
									callback: ( res, func ) => { 
										this.closeModalID();
									},
									fail: ( err, func, funcPushNotification ) => {
										
									}
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
					</ModalBody>
				</Modal>
			</div>
		);
	}
}

ModalID.propTypes = {
};

ModalID.defaultProps = {
};

export default ModalID;
