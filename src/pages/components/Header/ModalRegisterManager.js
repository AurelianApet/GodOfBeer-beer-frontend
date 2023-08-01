import React, { Component }     from 'react';

import {
    Modal,
    ModalHeader,
    ModalBody }                 from '../../components/Modal';

import APIForm, {
    MODE_CREATE,
    TITLE_NORMAL,
    TYPE_BLANK, TYPE_DATE, TYPE_PASSWORD, TYPE_INPUT, TYPE_BUTTON, TYPE_BUTTON_RADIO, TYPE_NUMBER,
    ACTION_CUSTOM,
    BUTTON_NORMAL,
    ERROR_DIV,
}              from '../../components/APIForm';

import { MODAL_REGISTER_MANAGER } from './HeaderBeer';
import { checkUserIDDuplication, checkBusinessNumberDuplication, checkNickNameDuplication, sendPhoneNumber, sendAuthNo, sendEmailAuth } from './check';

import LANG                     from '../../../language';
import { pushNotification, NOTIFICATION_TYPE_ERROR } from '../../../library/utils/notification';
import { executeQuery } from '../../../library/utils/fetch';
import _ from 'lodash';

const TYPE_LICENSE = 'license';
const TYPE_PRIVACY = 'privacy';

export class ModalRegisterManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sIsVisible: true,
            sIsAgreed: '',
            sManagerType: 'ROLE_PROVIDER',
            sLicense: {},
            sPrivacy: {},
        };
        this.agreedLisence = {};
    }

    componentDidMount () {
        this.getLicenseInfo();
    }

    getLicenseInfo = () => {
        executeQuery({
            method: 'get',
            url: '/license/fetchall',
            success: ( res ) => {
                const result = _.get(res, 'docs') || [];
                _.map( result, item => {
                    if (item.type === TYPE_LICENSE) {
                        this.setState({
                            sLicense: item,
                        })
                    } else if (item.type === TYPE_PRIVACY) {
                        this.setState({
                            sPrivacy: item,
                        })
                    }
                })
            },
            fail: ( err ) => {
                const errResult = _.get(err, 'data.error');
                if (errResult) {
                    pushNotification(NOTIFICATION_TYPE_ERROR, errResult);
                }
            }
        })
    };

    // handle function

    handleClickAgreementCheckbox = ( e ) => {
        const { name, checked } = e.target;
        _.set(this.agreedLisence, `${name}`, checked);
    };

    handleAgreeLisence = () => {
        _.map(this.agreedLisence, (item, index) => {
            if (item) {
                this.setState({
                    sIsAgreed: index,
                })
            }
        })
    };

    closeModalRegisterManager = (e) => {
        if ( e ) {
            e.preventDefault();
        }
        this.setState({ sIsVisible: false });
        this.props.handleModal(MODAL_REGISTER_MANAGER, false);
    };

    handleModalRegister = () => {
        const { sManagerType } = this.state;

        if ( sManagerType === 'ROLE_USER' && !this.checkedPhoneAuthed ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '먼저 폰인증을 해주세요.' );
            return;
        }
        if ( !this.checkedAuthed ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '먼저 인증을 해주세요.' );
            return;
        }
        if ( sManagerType === 'ROLE_USER' && !this.checkedNickName ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '먼저 닉네임중복확인을 해주세요.' );
            return;
        }
        if ( sManagerType !== 'ROLE_USER' && !this.checkedBusinessNumber ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '먼저 사업자번호중복확인을 해주세요.' );
            return;
        }
        this.apiForm.handleSubmitForm();
    };

    checkUserIDDuplication = () => {
        if ( !this.userID ) {
            return;
        }
        checkUserIDDuplication( this.userID );
    };

    sendEmail = () => {
        sendEmailAuth( this.email, this.getVerifyId );
    };

    getVerifyId = ( aId ) => {
        this.verifyId = aId;
    };

    getVerifyPhoneId = ( aId ) => {
        this.verifyPhoneId = aId;
    };

    sendPhoneNumber = () => {
        if ( !this.phoneNumberValid ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '올바른 휴대폰번호가 아닙니다.' );
            return;
        }
        if ( !this.phoneNumber ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '휴대폰번호를 입력하십시오.' );
            return;
        }
        sendPhoneNumber( this.phoneNumber, this.getVerifyPhoneId );
    };

    getCheckedAuth = ( aValue ) => {
        this.checkedAuthed = aValue;
    };

    getCheckedPhoneAuth = ( aValue ) => {
        this.checkedPhoneAuthed = aValue;
    };

    checkAuthNo = () => {
        if ( !this.verifyId ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '먼저 번호를 발송하세요.' );
            return;
        }
        const data = {
            vId: this.verifyId,
            verifyCode: this.authNo || '',
        };
        sendAuthNo( data, this.getCheckedAuth );
    };

    checkPhoneAuthNo = () => {
        if ( !this.verifyPhoneId ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '먼저 번호를 발송하세요.' );
            return;
        }
        const data = {
            vId: this.verifyPhoneId,
            verifyCode: this.authPhoneNo || '',
        };
        sendAuthNo( data, this.getCheckedPhoneAuth );
    };

    checkAddress = () => {
        window.onSearchAddressClick( 'apiForm-input-address', '', '', this.getAddressData );
    };

    getCheckedNickName = ( aState ) => {
        this.checkedNickName = aState;
    };

    getCheckedBusinessNumber = ( aState ) => {
        this.checkedBusinessNumber = aState;
    };

    checkBusinessNumber = () => {
        checkBusinessNumberDuplication( this.businessNumber, this.getCheckedBusinessNumber );
    };

    checkNickNameIDDuplication = () => {
        checkNickNameDuplication( this.nickName, this.getCheckedNickName );
    };

    getAddressData = ( aData ) => {
        this.address = aData || {};
    };

    getLicenceContent = ( aContent ) => {
        return aContent.replace(/\n/g, "<br>");
    };

    // render function
    renderRegisterContent = () => {
        const { sManagerType } = this.state;
        const that = this;
        const providerColumns = [
            [{
                name: 'role',
                type: TYPE_BUTTON_RADIO,
                value: [
                    {
                        title: '일반 사용자',
                        value: 'ROLE_USER'
                    },
                    {
                        title: '양조장(수입사)',
                        value: 'ROLE_PROVIDER',
                    },
                    {
                        title: '펍(매장)',
                        value: 'ROLE_SELLER',
                    },
                    // {
                    //     title: '매장관리자',
                    //     value: 'ROLE_PUB_MANAGER',
                    // },
                ],
                defaultValue: 'ROLE_USER',
                valid: {
                    checkValidation: ( input ) => {
                        this.setState({
                            sManagerType: input,
                        });
                        return null;
                    }
                },
                style: {
                    checked: {
                        backgroundColor: '#ffc107',
                        color: '#000000',
                    },
                    unchecked: {
                        backgroundColor: '#dddddd',
                        color: '#000000',
                    }
                },
                colSpan: 4,
            }],
            [{
                name: 'blank',
                className: 'note_agreement',
                title: {
                    type: TITLE_NORMAL,
                    string: '양조장(수입사)',
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
                        errMsg: '아이디를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        this.userID = input;
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
                        errMsg: '비밀번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        this.password = input;
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
                        if( this.password !== input ) {
                            return '비밀번호를 재확인해주세요.';
                        }
                        return null;
                    }
                },
            }],
            [{
                name: 'realName',
                type: TYPE_INPUT,
                title: {
                    string: '담당자'
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '담당자이름을 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        const regExpName = /^[가-힣]{2,10}$/;
                        if ( !regExpName.test( input ) ) {
                            return '이름은 한글로만 2자~10자 이하로 입력해주세요.';
                        }
                        return null;
                    }
                },
            }],
            [{
                name: 'phoneNumber',
                type: TYPE_NUMBER,
                title: {
                    string: '담당자 핸드폰번호'
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '핸드폰번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        const regExpPhone = /(01[016789])(\d{4}|\d{3})\d{4}$/g;
                        this.phoneNumber = input;
                        if ( !regExpPhone.test( input ) ) {
                            this.phoneNumberValid = false;
                        } else {
                            this.phoneNumberValid = true;
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
                        this.email = input;
                        const regExpEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                        if ( !regExpEmail.test( input ) ) {
                            return '올바른 이메일 주소가 아닙니다.';
                        }
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
                valid: {
                    checkValidation: ( input ) => {
                        this.authNo = input;
                        // this.checkedAuthed = false;
                        return null;
                    }
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
                name: 'companyType',
                type: TYPE_BUTTON_RADIO,
                title: {
                    string: '공급사형태',
                },
                value: [
                    {
                        title: '양조장',
                        value: 'brewery',
                    },
                    {
                        title: '수입사',
                        value: 'importer',
                    },
                ],
                defaultValue: 'brewery',
            }],
            [{
                name: 'address',
                type: TYPE_INPUT,
                disabled: true,
                data: ( input ) => {
                    return `${input.zonecode || ''} ${input.roadAddress || ''} ${input.buildingName || ''}`;
                },
                title: {
                    string: '주소',
                },
            },{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.checkAddress
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: '주소검색',
            }],
            [{
                name: 'addressDetail',
                type: TYPE_INPUT,
                title: {
                    string: '상세주소',
                },
            }],
            [{
                name: 'businessNumber',
                type: TYPE_INPUT,
                title: {
                    string: '사업자번호',
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '사업자번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        this.businessNumber = input;
                        return null;
                    }
                },
            },{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.checkBusinessNumber
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: '중복확인',
            }],
            [{
                name: 'storeName',
                type: TYPE_INPUT,
                title: {
                    string: '회사명',
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '회사명을 입력해주세요.',
                    },
                },
            }],
            [{
                name: 'callNumber',
                type: TYPE_INPUT,
                title: {
                    string: '전화번호',
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '전화번호를 입력해주세요.',
                    },
                },
            }],
            [{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.handleModalRegister
                },
                kind: BUTTON_NORMAL,
                title: LANG('PAGE_AUTH_REGISTER'),
            }],
        ];
        const sellerColumns = [
            [{
                name: 'role',
                type: TYPE_BUTTON_RADIO,
                value: [
                    {
                        title: '일반 사용자',
                        value: 'ROLE_USER'
                    },
                    {
                        title: '양조장(수입사)',
                        value: 'ROLE_PROVIDER',
                    },
                    {
                        title: '펍(매장)',
                        value: 'ROLE_SELLER',
                    },
                    // {
                    //     title: '매장관리자',
                    //     value: 'ROLE_PUB_MANAGER',
                    // },
                ],
                defaultValue: 'ROLE_USER',
                valid: {
                    checkValidation: ( input ) => {
                        this.setState({
                            sManagerType: input,
                        });
                        return null;
                    }
                },
                style: {
                    checked: {
                        backgroundColor: '#ffc107',
                        color: '#000000',
                    },
                    unchecked: {
                        backgroundColor: '#dddddd',
                        color: '#000000',
                    }
                },
                colSpan: 4,
            }],
            [{
                name: 'blank',
                className: 'note_agreement',
                title: {
                    type: TITLE_NORMAL,
                    string: '펍(매장)',
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
                        errMsg: '아이디를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        this.userID = input;
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
                        errMsg: '비밀번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        this.password = input;
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
                        if( this.password !== input ) {
                            return '비밀번호를 재확인해주세요.';
                        }
                        return null;
                    }
                },
            }],
            [{
                name: 'representer',
                type: TYPE_INPUT,
                title: {
                    string: '대표자',
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '담당자이름을 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        const regExpName = /^[가-힣]{2,10}$/;
                        if ( !regExpName.test( input ) ) {
                            return '이름은 한글로만 2자~10자 이하로 입력해주세요.';
                        }
                        return null;
                    }
                },
            }],
            [{
                name: 'realName',
                type: TYPE_INPUT,
                title: {
                    string: '담당자'
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '담당자이름을 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        const regExpName = /^[가-힣]{2,10}$/;
                        if ( !regExpName.test( input ) ) {
                            return '이름은 한글로만 2자~10자 이하로 입력해주세요.';
                        }
                        return null;
                    }
                },
            }],
            [{
                name: 'phoneNumber',
                type: TYPE_NUMBER,
                title: {
                    string: '담당자 핸드폰번호',
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '휴대전화번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        const regExpPhone = /(01[016789])(\d{4}|\d{3})\d{4}$/g;
                        this.phoneNumber = input;
                        if ( !regExpPhone.test( input ) ) {
                            this.phoneNumberValid = false;
                        } else {
                            this.phoneNumberValid = true;
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
                        this.email = input;
                        const regExpEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                        if ( !regExpEmail.test( input ) ) {
                            return '올바른 이메일 주소가 아닙니다.';
                        }
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
                valid: {
                    checkValidation: ( input ) => {
                        this.authNo = input;
                        // this.checkedAuthed = false;
                        return null;
                    }
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
                name: 'address',
                type: TYPE_INPUT,
                disabled: true,
                data: ( input ) => {
                    return `${input.zonecode || ''} ${input.roadAddress || ''} ${input.buildingName || ''}`;
                },
                title: {
                    string: '매장주소',
                },
            },{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.checkAddress
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: '주소검색',
            }],
            [{
                name: 'addressDetail',
                type: TYPE_INPUT,
                title: {
                    string: '상세주소',
                },
            }],
            [{
                name: 'businessNumber',
                type: TYPE_INPUT,
                title: {
                    string: '사업자번호',
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '사업자번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        this.businessNumber = input;
                        return null;
                    }
                },
            },{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.checkBusinessNumber
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: '중복확인',
            }],
            [{
                name: 'storeName',
                type: TYPE_INPUT,
                title: {
                    string: '매장명',
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '매장이름을 입력해주세요.',
                    },
                },
            }],
            [{
                name: 'callNumber',
                type: TYPE_INPUT,
                title: {
                    string: '전화번호',
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '전화번호를 입력해주세요.',
                    },
                },
            }],
            [{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.handleModalRegister
                },
                kind: BUTTON_NORMAL,
                title: LANG('PAGE_AUTH_REGISTER'),
            }],
        ];
        const userColumns = [
            [{
                name: 'role',
                type: TYPE_BUTTON_RADIO,
                value: [
                    {
                        title: '일반 사용자',
                        value: 'ROLE_USER'
                    },
                    {
                        title: '양조장(수입사)',
                        value: 'ROLE_PROVIDER',
                    },
                    {
                        title: '펍(매장)',
                        value: 'ROLE_SELLER',
                    },
                    // {
                    //     title: '매장관리자',
                    //     value: 'ROLE_PUB_MANAGER',
                    // },
                ],
                defaultValue: 'ROLE_USER',
                valid: {
                    checkValidation: ( input ) => {
                        this.setState({
                            sManagerType: input,
                        });
                        return null;
                    }
                },
                style: {
                    checked: {
                        backgroundColor: '#ffc107',
                        color: '#000000',
                    },
                    unchecked: {
                        backgroundColor: '#dddddd',
                        color: '#000000',
                    }
                },
                colSpan: 4,
            }],
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
                        errMsg: '아이디를 입력해주세요.',
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
                        errMsg: '비밀번호를 입력해주세요.',
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
                            return '비밀번호를 재확인해주세요.';
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
                            return '이름은 한글로만 2자~10자 이하로 입력해주세요.';
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
                    checkValidation: ( input ) => {
                        this.nickName = input;
                        return null;
                    }
                },
            },{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.checkNickNameIDDuplication
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: LANG('PAGE_AUTH_CHECK_DUPLICATION'),
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
                    checkValidation: ( input ) => {
                        const nowYear = new Date().getFullYear();
                        const year = Number( input.split( '-' )[0] ) || nowYear;
                        const resultMsg = ( nowYear - year ) >= 19? null : '20세미만은 가입 불가입니다.';
                        return resultMsg;
                    }
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
                    string: '핸드폰번호'
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '핸드폰번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        const regExpPhone = /(01[016789])(\d{4}|\d{3})\d{4}$/g;
                        this.phoneNumber = input;
                        if ( !regExpPhone.test( input ) ) {
                            this.phoneNumberValid = false;
                        } else {
                            this.phoneNumberValid = true;
                        }
                        return null;
                    }
                },
            },{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.sendPhoneNumber
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: LANG('PAGE_AUTH_SEND_PHONENUMBER'),
            }],
            [{
                name: 'authNo',
                type: TYPE_INPUT,
                title: {
                    string: LANG('PAGE_AUTH_AUTH_NO')
                },
                valid: {
                    checkValidation: ( input ) => {
                        this.authPhoneNo = input;
                        // this.checkedAuthed = false;
                        return null;
                    }
                },
            },{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.checkPhoneAuthNo
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: LANG('PAGE_AUTH_CONFIRM_AUTH_NO'),
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
                        this.email = input;
                        const regExpEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                        if ( !regExpEmail.test( input ) ) {
                            return '올바른 이메일 주소가 아닙니다.';
                        }
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
                name: 'authNoEmail',
                type: TYPE_INPUT,
                title: {
                    string: LANG('PAGE_AUTH_AUTH_NO')
                },
                valid: {
                    checkValidation: ( input ) => {
                        this.authNo = input;
                        // this.checkedAuthed = false;
                        return null;
                    }
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
                    type: ACTION_CUSTOM,
                    action: this.handleModalRegister
                },
                colSpan: 3,
                kind: BUTTON_NORMAL,
                title: LANG('PAGE_AUTH_REGISTER'),
            }],
        ];
        const pubManagerColumns = [
            [{
                name: 'role',
                type: TYPE_BUTTON_RADIO,
                value: [
                    {
                        title: '일반 사용자',
                        value: 'ROLE_USER'
                    },
                    {
                        title: '양조장(수입사)',
                        value: 'ROLE_PROVIDER',
                    },
                    {
                        title: '펍(매장)',
                        value: 'ROLE_SELLER',
                    },
                    // {
                    //     title: '매장관리자',
                    //     value: 'ROLE_PUB_MANAGER',
                    // },
                ],
                defaultValue: 'ROLE_USER',
                valid: {
                    checkValidation: ( input ) => {
                        this.setState({
                            sManagerType: input,
                        });
                        return null;
                    }
                },
                style: {
                    checked: {
                        backgroundColor: '#ffc107',
                        color: '#000000',
                    },
                    unchecked: {
                        backgroundColor: '#dddddd',
                        color: '#000000',
                    }
                },
                colSpan: 4,
            }],
            [{
                name: 'blank',
                className: 'note_agreement',
                title: {
                    type: TITLE_NORMAL,
                    string: '매장관리자',
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
                        errMsg: '아이디를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        this.userID = input;
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
                        errMsg: '비밀번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        this.password = input;
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
                        if( this.password !== input ) {
                            return '비밀번호를 재확인해주세요.';
                        }
                        return null;
                    }
                },
            }],
            [{
                name: 'realName',
                type: TYPE_INPUT,
                title: {
                    string: '담당자'
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '담당자이름을 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        const regExpName = /^[가-힣]{2,10}$/;
                        if ( !regExpName.test( input ) ) {
                            return '이름은 한글로만 2자~10자 이하로 입력해주세요.';
                        }
                        return null;
                    }
                },
            }],
            [{
                name: 'storeName',
                type: TYPE_INPUT,
                title: {
                    string: '매장명'
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '매장이름을 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        return null;
                    }
                },
            }],
            [{
                name: 'pubManagerType',
                type: TYPE_INPUT,
                title: {
                    string: '관리대상'
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '관리대상을 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        return null;
                    }
                },
            }],
            [{
                name: 'phoneNumber',
                type: TYPE_NUMBER,
                title: {
                    string: '핸드폰번호'
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '핸드폰번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        const regExpPhone = /(01[016789])(\d{4}|\d{3})\d{4}$/g;
                        this.phoneNumber = input;
                        if ( !regExpPhone.test( input ) ) {
                            this.phoneNumberValid = false;
                        } else {
                            this.phoneNumberValid = true;
                        }
                        return null;
                    }
                },
            }],
            [{
                name: 'businessNumber',
                type: TYPE_INPUT,
                title: {
                    string: '사업자번호',
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '사업자번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
                        this.businessNumber = input;
                        return null;
                    }
                },
            },{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.checkBusinessNumber
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: '중복확인',
            }],
            [{
                name: 'callNumber',
                type: TYPE_NUMBER,
                title: {
                    string: '전화번호'
                },
                valid: {
                    required: {
                        isRequired: true,
                        errMsg: '전화번호를 입력해주세요.',
                    },
                    checkValidation: ( input ) => {
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
                        this.email = input;
                        const regExpEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                        if ( !regExpEmail.test( input ) ) {
                            return '올바른 이메일 주소가 아닙니다.';
                        }
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
                valid: {
                    checkValidation: ( input ) => {
                        this.authNo = input;
                        // this.checkedAuthed = false;
                        return null;
                    }
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
                name: 'address',
                type: TYPE_INPUT,
                disabled: true,
                data: ( input ) => {
                    return `${input.zonecode || ''} ${input.roadAddress || ''} ${input.buildingName || ''}`;
                },
                title: {
                    string: '주소',
                },
            },{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.checkAddress
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: '주소검색',
            }],
            [{
                name: 'addressDetail',
                type: TYPE_INPUT,
                title: {
                    string: '상세주소',
                },
            }],
            [{
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.handleModalRegister
                },
                kind: BUTTON_NORMAL,
                title: LANG('PAGE_AUTH_REGISTER'),
            }],
        ];
        return (
            <APIForm
                onRef={(ref) => {this.apiForm = ref; this.checkedAuthed = false;}}
                pMode={{
                    mode: MODE_CREATE,
                }}
                pFormInfo={sManagerType === 'ROLE_PROVIDER'? providerColumns : sManagerType === 'ROLE_USER' ? userColumns: sManagerType === 'ROLE_SELLER' ? sellerColumns : pubManagerColumns}
                pAPIInfo={{
                    create: {
                        queries: [{
                            method: 'post',
                            url: '/auth/register/user',
                            data: ( formData ) => {
                                formData.isFemale = formData.isFemale === '여자';
                                formData.address = this.address;
                                return formData;
                            }
                        }],
                        callback: ( res, func, funcSetNotification ) => {
                            funcSetNotification( '회원가입이 완료되었습니다.' );
                            this.closeModalRegisterManager();
                        },
                        fail: ( err, func, funcPushNotification ) => {
                            this.checkedAuthed = false;
                            funcPushNotification(_.get(err[0], 'error'));
                        }
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
        )
    };

    renderAgreeLicenseModal = () => {
        const { sLicense } = this.state;
        return (
            <div className='agreeFormContainer'>
                <div>
                    <div key='agreeForm' id="agreeForm">
                        <p style={{textAlign: 'left'}}>약관 동의</p>

                        <div style={{width: '100%', border: '1px solid #ccc', height: 350, overflow: 'auto', textAlign: 'left', padding: 10}}>
                            {/* <pre>{sLicense.content || ''}</pre> */}
                            <div
                                style={{overflowWrap: 'break-word'}}
                                dangerouslySetInnerHTML={{ __html: this.getLicenceContent(sLicense.content || '')}}
                            />
                        </div>

                        <div className="checks etrans" style={{textAlign: 'left', fontSize: 12}}>
                            <input key={TYPE_LICENSE} type="checkbox" name={TYPE_LICENSE} id="pri_chk_use_license" onClick={this.handleClickAgreementCheckbox} />
                            <label htmlFor="pri_chk_use_license">이용약관에 동의합니다.(필수)</label>
                        </div>
                        <div className='button-container'>
                            <button id="agreeBtn" className="memberBtn" style={{width: 260}} onClick={this.handleAgreeLisence}>확인</button>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

    renderAgreePrivacyModal = () => {
        const { sPrivacy } = this.state;
        return (
            <div className='agreeFormContainer'>
                <div>
                    <div key='agreeForm' id="agreeForm">
                        <p style={{textAlign: 'left'}}>개인정보 수집 및 이용동의</p>

                        <div style={{width: '100%', border: '1px solid #ccc', height: 350, overflow: 'auto', textAlign: 'left', padding: 10}}>
                            {/* <pre>{sPrivacy.content || ''}</pre> */}
                            <div
                                style={{overflowWrap: 'break-word'}}
                                dangerouslySetInnerHTML={{ __html: this.getLicenceContent(sPrivacy.content || '')}}
                            />
                        </div>

                        <div className="checks etrans" style={{textAlign: 'left', fontSize: 12}}>
                            <input key={TYPE_PRIVACY} type="checkbox" name={TYPE_PRIVACY} id="pri_chk_use_privacy" onClick={this.handleClickAgreementCheckbox} />
                            <label htmlFor="pri_chk_use_privacy" style={{width:'max-content'}}>개인정보 수집 및 이용동의에 동의합니다.(필수)</label>
                        </div>
                        <div className='button-container'>
                            <button id="agreeBtn" className="memberBtn" style={{width: 260}} onClick={this.handleAgreeLisence}>확인</button>
                        </div>
                    </div>
                </div>
            </div>

        );
    };

    render() {
        const { sIsVisible, sIsAgreed } = this.state;

        return (
            <div className="container-modal-register-user">
                <Modal
                    isOpen={sIsVisible}
                    toggle={this.closeModalRegisterManager}
                    className="modal-register-manager"
                >
                    <ModalHeader
                        toggle={this.closeModalRegisterManager}
                        className="modal-register-user-header"
                    />
                    <ModalBody className="modal-register-user-body">
                        <div className="login-logo">
                            <img alt="" src="/assets/new_images/logo_header.png"/>
                        </div>
                        {sIsAgreed === TYPE_PRIVACY ?
                            this.renderRegisterContent()
                            :
                            sIsAgreed === TYPE_LICENSE ?
                                this.renderAgreePrivacyModal()
                                :
                                this.renderAgreeLicenseModal()
                        }
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

ModalRegisterManager.propTypes = {
};

ModalRegisterManager.defaultProps = {
};

export default ModalRegisterManager;
