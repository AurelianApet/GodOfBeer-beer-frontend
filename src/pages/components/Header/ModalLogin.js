import React, { Component }         from 'react';
import PropTypes                    from 'prop-types';
import { compose }                  from 'redux';
import { connect }                  from 'react-redux';
import { Redirect, withRouter }     from 'react-router-dom';
import _                            from 'lodash';

import { 
    Modal, 
    ModalHeader, 
    ModalBody, 
    ModalFooter }                   from '../../components/Modal';
    
import APIForm, { 
    MODE_CREATE, 
    TYPE_EXTENDED_INPUT, 
    EXTNEDED_PASSWORD, 
    ACTION_SUBMIT, 
    BUTTON_NORMAL, 
    TYPE_BUTTON, 
    ERROR_BORDER,}                  from '../../components/APIForm';

import LANG                         from '../../../language';
import { 
    MODAL_LOGIN,
    MODAL_ID,
    MODAL_PASSWORD, 
}                from './HeaderBeer';

import { signIn } from '../../../library/redux/actions/auth';
import { appConfig } from '../../../appConfig';
import { MODAL_REGISTER_MANAGER } from './Header';

export class ModalLogin extends Component {
    state = {
        redirectToReferrer: false,
        error: '',
        isLoading: false,
    }
    constructor(props) {
        super(props);
        this.state = {
            sIsVisible: true,
        }
    }

    // handle function
    closeModalLogin = (e) => {
        if ( e ) {
            e.preventDefault();
        }
        this.props.handleModal(MODAL_LOGIN, false);
    }

    showModalID = () => {
        this.props.handleModal(MODAL_ID, true);
    }

    showModalPassword = () => {
        this.props.handleModal(MODAL_PASSWORD, true);
    }

    showModalAgreement = () => {
        this.props.handleModal(MODAL_REGISTER_MANAGER, true);
    }

    // render function
    render() {
        const { pHandleLoginSuccessed } = this.props;
        const { sIsVisible, redirectToReferrer } = this.state;
        const { from } = this.props.location.state || { from: { pathname: appConfig.startPageURL } };
        if (redirectToReferrer) {
            return <Redirect to={from} />;
        }
        return (
            <div className="container-modal-login">
                <Modal
                    isOpen={sIsVisible}
                    toggle={this.closeModalLogin}
                    className="modal-login"
                >
                    <ModalHeader 
                        toggle={this.closeModalLogin} 
                        className="modal-login-header"
                    />
                    <ModalBody className="modal-login-body">
                        <div className="login-logo">
                            <img alt="" src="/assets/new_images/logo_header.png"/>
                        </div>
                        <APIForm
                            onRef={(ref) => {this.apiForm = ref}}
                            pMode={{
                                mode: MODE_CREATE,
                            }}
                            pFormInfo={[
                                [{
                                    name: 'userID',
                                    type: TYPE_EXTENDED_INPUT,
                                    placeholder: LANG('PAGE_AUTH_USER_ID'),
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: LANG( 'PAGE_AUTH_INPUT_USER_ID' )
                                        },
                                    },
                                }],
                                [{
                                    name: 'password',
                                    type: TYPE_EXTENDED_INPUT,
                                    placeholder: LANG('PAGE_AUTH_PASSWORD'),
                                    extendedSetting: {
                                        inputType: EXTNEDED_PASSWORD,
                                    },
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: LANG( 'PAGE_AUTH_INPUT_PASSWORD' )
                                        },
                                    },
                                }],
                                [{
                                    type: TYPE_BUTTON,
                                    action: {
                                        type: ACTION_SUBMIT,
                                    },
                                    kind: BUTTON_NORMAL,
                                    shortKeyInfo: {
                                        key: 'Enter'
                                    },
                                    className: 'login-button',
                                    title: LANG('PAGE_AUTH_LOGIN'),
                                }],
                            ]}
                            pAPIInfo={{
                                create: {
                                    queries: [{
                                        method: 'post',
                                        url: '/auth/login',
                                    }],
                                    callback: ( res, func ) => { 
                                        localStorage.setItem('token', res[0].token);
                                        this.props.signIn({
                                            isSuccessed: true,
                                            data: res[0],
                                        });
                                        const role = _.get( res, '[0].user.role' ) || '';
                                        pHandleLoginSuccessed( role === 'ROLE_SUB_ADMIN' ? 'ROLE_ADMIN' : role );
                                        this.closeModalLogin();
                                    },
                                    fail: ( err, func, funcPushNotification ) => {
                                        this.props.signIn({
                                            isSuccessed: false,
                                            data: err
                                        });
                                        func();
                                        const errMsgs = _.get( err, '[0].error' ) || {};
                                        _.map( errMsgs, ( msgItem, msgIndex ) => {
                                            funcPushNotification( msgItem );
                                        });
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
                    <ModalFooter className="modal-login-footer">
                        <div className="footer-button">
                            <span onClick={this.showModalID}>아이디찾기</span>
                            <span>|</span>
                            <span onClick={this.showModalPassword}>비밀번호찾기</span>
                            <span>|</span>
                            <span onClick={this.showModalAgreement}>회원가입</span>
                        </div>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

ModalLogin.propTypes = {
    pHandleLoginSuccessed: PropTypes.func,
};

ModalLogin.defaultProps = {
    pHandleLoginSuccessed: () => {},
};

export default compose(
    withRouter,
    connect(
        state => ({
            auth: state.auth
        }),
        {
            signIn
        }
    )
)(ModalLogin);
