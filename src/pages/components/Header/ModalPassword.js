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
    MODAL_PASSWORD,
    MODAL_LOGIN } from './HeaderBeer';
import LANG from '../../../language';

export class ModalPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sIsVisible: true,
        }
    }

    // other function
    closeModalPassword = (e) => {
        if ( e ) {
            e.preventDefault();
        }
        this.setState({ sIsVisible: false });
        this.props.handleModal(MODAL_PASSWORD, false);
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
                    toggle={this.closeModalPassword}
                    className="modal-ID"
                >
                    <ModalHeader 
                        toggle={this.closeModalPassword} 
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
                                            errMsg: LANG( 'PAGE_AUTH_EMAIL' )
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
                                    title: LANG('PAGE_AUTH_RESET_PASSWORD'),
                                }],
                            ]}
                            pAPIInfo={{
                                create: {
                                    queries: [{
                                        method: 'post',
                                        url: '/auth/find-url',
                                }],
                                    callback: ( res, func ) => { 
                                        this.closeModalPassword();
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

ModalPassword.propTypes = {
};

ModalPassword.defaultProps = {
};

export default ModalPassword;
