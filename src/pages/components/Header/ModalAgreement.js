import React, { Component }     from 'react';

import { 
    Modal, 
    ModalHeader, 
    ModalBody }                 from '../../components/Modal';
    
import APIForm, { 
    MODE_CREATE, 
    TITLE_NORMAL,
    TYPE_BLANK,
    ACTION_CUSTOM,
    BUTTON_NORMAL, 
    TYPE_BUTTON, 
    ERROR_BORDER }              from '../../components/APIForm';

import { 
    MODAL_AGREEMENT } from './HeaderBeer';
import LANG                     from '../../../language';

export class ModalAgreement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sIsVisible: true,
        }
    }

    // handle function
    closeModalAgreement = (e) => {
        e.preventDefault();
        this.setState({ sIsVisible: false });
        this.props.handleModal(MODAL_AGREEMENT, false);
    }

    handleModalRegister = () => {
        this.props.handleModal(this.props.pModalType, true);
    }

    // render function
    render() {
        const { sIsVisible } = this.state;
        return (
            <div className="container-modal-agree">
                <Modal
                    isOpen={sIsVisible}
                    toggle={this.closeModalAgreement}
                    className="modal-agree"
                >
                    <ModalHeader 
                        toggle={this.closeModalAgreement} 
                        className="modal-agree-header"
                    />
                    <ModalBody className="modal-agree-body">
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
                                    className: 'note_agreement',
                                    title: {
                                        type: TITLE_NORMAL,
                                        string: LANG('PAGE_AUTH_AGREEMENT')
                                    },
                                    colSpan: 4,
                                    type: TYPE_BLANK,
                                }],
                                [{
                                    name: 'blank',
                                    className: 'note_first',
                                    title: {
                                        type: TITLE_NORMAL,
                                        string: LANG('PAGE_AUTH_FIRST_AIM')
                                    },
                                    colSpan: 4,
                                    type: TYPE_BLANK,
                                }],
                                [{
                                    name: 'blank',
                                    className: 'note_agreement',
                                    title: {
                                        type: TITLE_NORMAL,
                                        string: LANG('PAGE_AUTH_AGREE_CLAUSE')
                                    },
                                    colSpan: 4,
                                    type: TYPE_BLANK,
                                }],
                                [{
                                    type: TYPE_BUTTON,
                                    action: {
                                        type: ACTION_CUSTOM,
                                        action: this.handleModalRegister
                                    },
                                    kind: BUTTON_NORMAL,
                                    title: LANG('PAGE_AUTH_CONFIRM'),
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
                                    },
                                    fail: ( err, func, funcPushNotification ) => {
                                        this.props.signIn({
                                        isSuccessed: false,
                                        data: err
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
                </Modal>
            </div>
        );
    }
}

ModalAgreement.propTypes = {
};

ModalAgreement.defaultProps = {
};

export default ModalAgreement;
