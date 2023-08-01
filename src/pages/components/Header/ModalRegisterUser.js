import React, { Component }     from 'react';

import { 
    Modal, 
    ModalHeader, 
    ModalBody }                 from '../../components/Modal';
    
import APIForm, { 
    MODE_CREATE, 
    TITLE_NORMAL,
    TYPE_BLANK, TYPE_DATE, TYPE_PASSWORD, TYPE_INPUT, TYPE_BUTTON, TYPE_BUTTON_RADIO, TYPE_NUMBER,
    ACTION_SUBMIT,  ACTION_CUSTOM,
    BUTTON_NORMAL,
    ERROR_DIV,
    }              from '../../components/APIForm';

import { MODAL_REGISTER_USER } from './HeaderBeer';
import { checkUserIDDuplication } from './check';

import LANG                     from '../../../language';

export class ModalRegisterUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sIsVisible: true,
        }
    }

    // handle function
    closeModalRegisterUser = (e) => {
        if ( e ) {
            e.preventDefault();
        }
        this.setState({ sIsVisible: false });
        this.props.handleModal(MODAL_REGISTER_USER, false);
    }

    checkUserIDDuplication = () => {
        if ( !this.userID ) {
            return;
        }
        checkUserIDDuplication( this.userID );
    }

    sendEmail = () => {
    }

    checkAuthNo = () => {
    }

    // render function
    render() {
        const { sIsVisible } = this.state;
        const that = this;
        return (
            <div className="container-modal-register-user">
                <Modal
                    isOpen={sIsVisible}
                    toggle={this.closeModalRegisterUser}
                    className="modal-register-user"
                >
                    <ModalHeader 
                        toggle={this.closeModalRegisterUser} 
                        className="modal-register-user-header"
                    />
                    <ModalBody className="modal-register-user-body">
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
                                        string: LANG('PAGE_AUTH_PERSONAL_INFO'),
                                    },
                                    colSpan: 4,
                                    type: TYPE_BLANK,
                                }],
                                [{
                                    name: 'userID',
                                    type: TYPE_INPUT,
                                    title: {
                                        string: LANG('PAGE_AUTH_USER_ID')
                                    },
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: '아이디를 입력하세요.',
                                        },
                                        checkValidation: ( input ) => {
                                            that.userID = input;
                                            const regExpId = /^[A-za-z0-9]{6,20}$/g;
                                            if ( !regExpId.test( input ) ) {
                                                return '아이디는 6자 이상 20자 미만만 가능합니다';
                                            }
                                            return null;
                                        }
                                    },
                                },{
                                    type: TYPE_BUTTON,
                                    action: {
                                        type: ACTION_CUSTOM,
                                        action: this.checkUserIDDuplication
                                    },
                                    kind: BUTTON_NORMAL,
                                    className: "gray-button",
                                    title: LANG('PAGE_AUTH_CHECK_DUPLICATION'),
                                }],
                                [{
                                    name: 'password',
                                    type: TYPE_PASSWORD,
                                    title: {
                                        string: LANG('PAGE_AUTH_PASSWORD')
                                    },
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: '비밀번호를 입력하세요.',
                                        },
                                        checkValidation: ( input ) => {
                                            that.password = input;
                                            const regExpPw = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{9,20}$/;
                                            if ( !regExpPw.test( input ) ) {
                                                return '영문, 숫자, 특수문자를 포함한 9자~20자 이하';
                                            }
                                            return null;
                                        }
                                    },
                                }],
                                [{
                                    name: 'passwordConfirm',
                                    type: TYPE_PASSWORD,
                                    title: {
                                        string: LANG('PAGE_AUTH_CONFIRM_PASSWORD')
                                    },
                                    valid: {
                                        checkValidation: ( input ) => {
                                            if( that.password !== input ) {
                                                return '비밀번호가 일치하지 않습니다.';
                                            }
                                            return null;
                                        }
                                    },
                                }],
                                [{
                                    name: 'realName',
                                    type: TYPE_INPUT,
                                    title: {
                                        string: LANG('PAGE_AUTH_REGISTER_NAME')
                                    },
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: '이름을 입력하세요.',
                                        },
                                        checkValidation: ( input ) => {
                                            const regExpName = /^[가-힣]{2,10}$/;
                                            if ( !regExpName.test( input ) ) {
                                                return '이름은 한글로만 2자~10자 이하로 입력하세요.';
                                            }
                                            return null;
                                        }
                                    },
                                }],
                                [{
                                    name: 'nickName',
                                    type: TYPE_INPUT,
                                    title: {
                                        string: LANG('BASIC_NICK_NAME')
                                    },
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: '닉네임을 재확인해주세요.',
                                        },
                                    },
                                }],
                                [{
                                    name: 'birthday',
                                    title: {
                                      string: LANG('BASIC_BIRTHDAY')
                                    },
                                    type: TYPE_DATE,
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: '생년월일을 입력하여 주세요.',
                                        },
                                    },
                                  }],
                                [{
                                    name: 'isFemale',
                                    type: TYPE_BUTTON_RADIO,
                                    title: {
                                        string: LANG('BASIC_SEX')
                                    },
                                    value: [
                                        {
                                            title: '남자',
                                            value: '남자',
                                        },
                                        {
                                            title: '여자',
                                            value: '여자',
                                        },
                                    ],
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: '성별을 선택하여 주세요.',
                                        },
                                    },
                                }],
                                [{
                                    name: 'phoneNumber',
                                    type: TYPE_NUMBER,
                                    title: {
                                        string: LANG('BASIC_PHONE_NUMBER')
                                    },
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: '휴대전화번호를 입력하세요.',
                                        },
                                        checkValidation: ( input ) => {
                                            const regExpPhone = /(01[016789])(\d{4}|\d{3})\d{4}$/g;
                                            if ( !regExpPhone.test( input ) ) {
                                                return '올바른 휴대폰번호가 아닙니다.';
                                            }
                                            return null;
                                        }
                                    },
                                }],
                                [{
                                    name: 'email',
                                    type: TYPE_INPUT,
                                    title: {
                                        string: LANG('PAGE_AUTH_EMAIL')
                                    },
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: '이메일을 재확인해주세요.',
                                        },
                                        checkValidation: ( input ) => {
                                            return null;
                                        }
                                    },
                                },{
                                    type: TYPE_BUTTON,
                                    action: {
                                        type: ACTION_CUSTOM,
                                        action: this.sendEmail
                                    },
                                    kind: BUTTON_NORMAL,
                                    className: "gray-button",
                                    title: LANG('PAGE_AUTH_SEND_AUTH_NO'),
                                }],
                                [{
                                    name: 'authNo',
                                    type: TYPE_INPUT,
                                    title: {
                                        string: LANG('PAGE_AUTH_AUTH_NO')
                                    },
                                },{
                                    type: TYPE_BUTTON,
                                    action: {
                                        type: ACTION_CUSTOM,
                                        action: this.checkAuthNo
                                    },
                                    kind: BUTTON_NORMAL,
                                    className: "gray-button",
                                    title: LANG('PAGE_AUTH_CONFIRM_AUTH_NO'),
                                }],
                                [{
                                    type: TYPE_BUTTON,
                                    action: {
                                        type: ACTION_SUBMIT,
                                    },
                                    colSpan: 3,
                                    kind: BUTTON_NORMAL,
                                    title: LANG('PAGE_AUTH_REGISTER'),
                                }],
                            ]}
                            pAPIInfo={{
                                create: {
                                    queries: [{
                                        method: 'post',
                                        url: '/auth/register/user',
                                        valid: ( formData, funcSetError ) => {
                                            if ( formData.password !== formData.passwordConfirm ) {
                                                funcSetError({
                                                    passwordConfirm: '비밀번호를 재확인해주세요.',
                                                });
                                                return false;
                                            } else {
                                                return true;
                                            }
                                        },
                                        data: ( formData ) => {
                                            formData.role = 'ROLE_USER';
                                            formData.isFemale = formData.isFemale === '여자';
                                            return formData;
                                        }
                                    }],
                                    callback: ( res, func, funcSetNotification ) => { 
                                        funcSetNotification( '회원가입이 완료되었습니다.' );
                                        that.closeModalRegisterUser();
                                    },
                                },
                            }}
                            pThemeInfo={{
                                error: {
                                    errorStyle: ERROR_DIV,
                                    showAll: true,
                                    errColor: '#ff0000',
                                }
                            }}
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

ModalRegisterUser.propTypes = {
};

ModalRegisterUser.defaultProps = {
};

export default ModalRegisterUser;
