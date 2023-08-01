import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cn from 'classnames';
import Validator from '../../components/Validator/Validator';
import { Form } from 'reactstrap';

import Textarea from '../Form/Textarea';
import {Button} from '../Button'

import { processSuccessResponse, processErrorResponse } from '../../../library/utils/notification';
import LANG from '../../../language';

import schema from './schema';
import { executeQuery } from '../../../library/utils/fetch';

class SingleMessage extends Component {
	componentDidMount() {
		this.mounted = true;
		window.setFocus('#single_message_textarea', 100);
		document.addEventListener('mousedown', this.handleClickOutside);
		document.addEventListener('keydown', this.handleKeyDown, false);
	}

	componentWillUnmount() {
		this.mounted = false;
		document.removeEventListener('mousedown', this.handleClickOutside);
		document.addEventListener('keydown', this.handleKeyDown, false);
	}

	setWrapperRef = (node) => {
		this.wrapperRef = node;
	}

	// handle
	handleClickOutside = (event) => {
		if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
			this.props.pHandleMessageClose(event);
		}
	}
	handleKeyDown = (e) => {
		const { validator: { values } } = this.props;
		if ( e.ctrlKey && (e.key === 'Enter')) {
			this.handleSubmitForm(values);
		}
		if ( e.key === 'Escape' ) {
			this.handleGoBack();
		}
	}
	
	handleTextareaChange = (e) => {
		const { validator: { onChangeHandler } } = this.props;
		onChangeHandler(e.target.name, e.target.value);
	}
	handleSubmitForm = (data) => {
		if (!this.mounted)
			return;
		const { validator: { onChangeHandler, validate } } = this.props;
		if (validate(schema).isValid) {
			const { pUser } = this.props;
			// Saga-createOneMessage
			executeQuery({
				method: 'post',
				url: '/social/messages/',
				data: {
					receivers: [pUser],
					title: LANG('COMP_SINGLEMESSAGE_NORMAL'),
					content: "<p>" + data.messageContent + "</p>",
				},
				success: (res) => {
					if(this.mounted) {
						onChangeHandler('messageContent', '');
					}					
					processSuccessResponse(LANG('COMP_SINGLEMESSAGE_SUCCESSFUL_SEND'));
				},
				fail: (err) => {
						processErrorResponse(err, this.props.history);
				}
			});
			this.props.pHandleMessageClose();
		}
	}
	handleGoBack = () => {
		if (!this.mounted)
			return;
		const { validator: { onChangeHandler } } = this.props;
		onChangeHandler('messageContent', '');
		this.props.pHandleMessageClose();
	}

	// render
	render() {
		const { pUser, pDirection, pOffset } = this.props;
		const { validator: { values, errors } } = this.props;
		const classDirection = `direction-${pDirection}`;
		return (
			<div
				className="single-message-container"
				style={{
					left: pOffset.left,
					top: pOffset.top,
				}}
			>
				<div
					className={cn("single-message-popup", classDirection, pUser.realName === LANG('COMP_SINGLEMESSAGE_ADMIN') ? "sinle-message-container-to-admin": "" )}
					ref={this.setWrapperRef}
				>
					<h6 className = "single-message-title">{pUser.realName}{LANG('COMP_SINGLEMESSAGE_TORECEIVER')}</h6>
					<Form ref={ref=>{this.form = ref}} onSubmit={this.handleSubmitForm}>
						<div className = "single-message-content">
							<Textarea
								id="single_message_textarea"
								name="messageContent"
								className="form-control"
								value={values.messageContent}
								onChange={this.handleTextareaChange}
								hasError={!!errors.messageContent}
								errorMessage={errors.messageContent}
							/>
						</div>
						<div className = "single-message-buttons">
							<Button
								onClick={this.handleSubmitForm.bind(null, values)}
								className="single-message-button-send"
								color="primary"
								title={LANG('COMP_SINGLEMESSAGE_SEND_MESSAGE')}
							>
								<i className="fa fa-paper-plane-o" />
							</Button>
							<Button
								onClick={this.handleGoBack}
								className="single-message-button-close"
								color="primary"
								title={LANG('COMP_SINGLEMESSAGE_CLOSE_MESSAGE')}
							>
								<i className="fa fa fa-times" />
							</Button>
						</div>
					</Form>
				</div>
			</div>
		);
	}
}

SingleMessage.propTypes = {
	validator: PropTypes.object.isRequired,
	pUser: PropTypes.object.isRequired,
	pHandleMessageClose: PropTypes.func.isRequired,
	pOffset: PropTypes.object,
	pDirection: PropTypes.string,
};

SingleMessage.defaultProps = {
	pOffset: {left: 0, top: 0},
	pDirection: 'br', // supports 4 direction: tl(top+left), tr(top+right), bl(bottom+left), br(bottom+right)
	pUser: null,
	pHandleMessageClose: () => {},
};

export default compose(
	Validator(schema),
	connect(
		state => ({
		}),
	)
)(SingleMessage);
