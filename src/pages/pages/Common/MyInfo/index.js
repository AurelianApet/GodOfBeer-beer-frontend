import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';

import APIForm, {
    MODE_CREATE, MODE_UPDATE, MODE_READ,
    TYPE_DATE, TYPE_INPUT, TYPE_BUTTON, TYPE_NUMBER, TYPE_PASSWORD, TYPE_TEXTAREA, TYPE_CUSTOM,
    SHORTKEY_CTRL_ALT,
    ACTION_SUBMIT, ACTION_CUSTOM,
    BUTTON_NORMAL,
    ERROR_BORDER, ERROR_DIV,
} from '../../../components/APIForm';
import FileUploadPublic from '../../../components/FileUploadPublic';

import {sendAuthNo, sendPhoneNumber, checkNickNameDuplication} from '../../../components/Header/check'
import {signOut} from '../../../../library/redux/actions/auth';
import {loginWithToken} from '../../../../library/redux/actions/auth';
import {executeQuery} from '../../../../library/utils/fetch';
import {
    pushNotification,
    NOTIFICATION_TYPE_SUCCESS,
    NOTIFICATION_TYPE_ERROR
} from '../../../../library/utils/notification';
import {confirmAlertMsg} from '../../../../library/utils/confirmAlert';
import LANG from '../../../../language';
import BeerTable, {MODE_DATA} from "../../../components/BeerTable";
import InsertUserModal from "../../Admin/ServerAdminManager/InsertUserModal";
import md5 from "md5";


const CREATE_COLUMNS = [
    {
        name: 'userID',
        title: '관리자 아이디',
    },
    {
        name: 'realName',
        title: '관리자이름',
    },
    {
        name: 'password',
        title: '암호',
    },
];

const UPDATE_COLUMNS = [
    {
        name: 'userID',
        title: '관리자 아이디',
    },
    {
        name: 'realName',
        title: '관리자이름',
    },
    {
        name: 'oldPassword',
        title: '이전 암호',
    },
    {
        name: 'newPassword',
        title: '새 암호',
    },
];


class MyInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sInfoTableMode: MODE_READ,
            sModalMode: MODE_READ,
            sIsShowUpdateModal: false,
            sIsShowChangePasswordModal: false,
            sUpdateId: '',
            sUserRole: 'ROLE_USER',
            sUserImage: '',
            sUserImageFromFileUpload: '',
            sIsMobileDimension: props.isMobileDimension,
            sData: [],
            sModalShow: false,
            sEditData: {},
            sDataMode: 0,
        };
        this.columns = [
            {
                name: 'userID',
                title: 'ID',
            },
            {
                name: 'realName',
                title: '사용자이름',
            },
            {
                customRender: this.renderEditTable
            }
        ]
        this.changedPhoneNumber = false;
        this.detailInfo = {};
        this.nickNameVerified = true;
    }

    componentDidMount = () => {
        const user = _.get(this.props, 'user.role') || '';
        if (user !== '') {
            this.setState({sUserRole: user})
        }
        this.getServerAdminData();
    };

    componentWillReceiveProps = (newProps) => {
        const user = _.get(newProps, 'user.role') || '';
        if (user !== '') {
            this.setState({sUserRole: user})
        }
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
        });
        this.getServerAdminData();
    };

    getServerAdminData = () => {
        executeQuery({
            method: 'get',
            url: `/user/fetchlist?role=ROLE_SUB_ADMIN`,
            success: (res) => {
                const result = _.get(res, 'users') || [];
                this.setState({sData: result})
            },
            fail: (err, res) => {
            }
        })
    };

    handleInsertUser = () => {
        const {sData} = this.state;
        if (sData.length < 2) {
            this.setState({
                sModalShow: true,
                sDataMode: 0,
                sEditData: {}
            })
        }
        else {
            const errMsg = '서브관리자는 2명이상 추가할수 없습니다.';
            pushNotification(NOTIFICATION_TYPE_ERROR, errMsg);
        }
    };

    handleCloseInsertModal = () => {
        this.setState({sModalShow: false})
    };

    handleInsertUserButton = () => {
        const {sDataMode, sEditData} = this.state;
        if (sDataMode === 0) {
            executeQuery({
                method: 'post',
                url: '/user/subadmin/create',
                data: {
                    ...this.insertUserModal.userData,
                    password: md5(this.insertUserModal.userData.password),
                },
                success: (res) => {
                    pushNotification(NOTIFICATION_TYPE_SUCCESS, '추가 성공');
                    this.getServerAdminData();
                    this.beerTable.refresh();
                    this.setState({sModalShow: false});
                },
                fail: (err, res) => {
                    const errMsg = _.get(err, 'data.error') || '추가 실패';
                    pushNotification(NOTIFICATION_TYPE_ERROR, errMsg);
                }
            })
        } else {
            executeQuery({
                method: 'put',
                url: `/user/resetPassword/${sEditData._id}`,
                data: {
                    oldPassword: md5(this.insertUserModal.userData.oldPassword),
                    newPassword: md5(this.insertUserModal.userData.newPassword),
                },
                success: (res) => {
                    pushNotification(NOTIFICATION_TYPE_SUCCESS, '수정 성공');
                    this.beerTable.refresh();
                    this.getServerAdminData();
                    this.setState({sModalShow: false});
                },
                fail: (err, res) => {
                    pushNotification(NOTIFICATION_TYPE_ERROR, '수정 실패');
                }
            })
        }
    };

    handleEditUser = (aData) => {
        this.setState({
            sModalShow: true,
            sEditData: aData,
            sDataMode: 1
        })
    };

    handleRemoveUser = (aData) => {
        executeQuery({
            method: 'delete',
            url: `user/${aData._id}`,
            success: (res) => {
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '삭제 성공');
                this.getServerAdminData();
                this.beerTable.refresh();
            },
            fail: (err) => {
                const errMsg = _.get(err, 'data.error') || '삭제 실패';
                pushNotification(NOTIFICATION_TYPE_ERROR, errMsg);
            }
        })
    };

    handleFormatUserData = () => {
        const {sData} = this.state;
        executeQuery({
            method: 'put',
            url: `/user/resetdefaultpassword/${sData._id}`,
            success: (res) => {
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '성공');
            },
            fail: (res) => {
                pushNotification(NOTIFICATION_TYPE_ERROR, '실패');
            }
        })
    };

    renderEditTable = (value, dataItem, columnItem) => {
        return (
            <div className="server-admin-edit-content">
                <i className='fa fa-edit' onClick={this.handleEditUser.bind(this, dataItem)}/>
                <i className='fa fa-trash' onClick={this.handleRemoveUser.bind(this, dataItem)}/>
            </div>
        )
    };

    getCheckedAuth = (aValue) => {
        this.checkedAuthed = aValue;
    };

    sendPhoneNumber = () => {
        if (!this.phoneNumberValid) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '올바른 휴대폰번호가 아닙니다.');
            return;
        }
        if (!this.phoneNumber) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '휴대폰번호를 입력하십시오.');
            return;
        }
        sendPhoneNumber(this.phoneNumber, this.getPhoneId);
    };

    getPhoneId = (aId) => {
        this.verifiedPhoneId = aId;
    };

    checkPhoneNumberAuthNo = () => {
        if (!this.verifiedPhoneId) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '먼저 휴대폰번호를 발송하세요.');
            return;
        }
        const data = {
            vId: this.verifiedPhoneId,
            verifyCode: this.phoneNumberAuthNo || '',
        };
        sendAuthNo(data, this.getCheckedAuth);
    };

    checkAddress = () => {
        window.onSearchAddressClick('apiForm-input-address', '', '', this.getAddressData);
    };

    getAddressData = (aData) => {
        this.address = aData || {};
    };

    sendNickName = () => {
        if (this.nickNameVerified) {
            return;
        }
        checkNickNameDuplication(this.newNickName, this.getCheckedNickName)
    };

    getCheckedNickName = (aState) => {
        this.nickNameVerified = aState;
        this.nickName = this.newNickName;
    };

    handleChangeMode = (aMode) => {
        this.setState({
            sInfoTableMode: aMode,
        });
    };

    handleSaveAPIForm = () => {
        const {sUserRole} = this.state;
        if (!this.nickNameVerified) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '닉네임중복확인을 해주십시오.');
            return;
        }
        const isValid = sUserRole !== 'ROLE_USER' || !this.changedPhoneNumber || !!this.checkedAuthed;
        if (isValid) {
            this.mainApiForm.handleSubmitForm();
        } else if (this.changedPhoneNumber && !this.checkedAuthed) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '핸드폰번호인증을 해주세요.');
        }
    };

    handleCancelAPIForm = () => {
        this.handleChangeMode(MODE_READ);
    };

    handleCreateNewBrewery = () => {
        this.setState({
            sIsShowUpdateModal: true,
            sModalMode: MODE_CREATE,
        })
    };

    handleGetPhoto = (aFiles) => {
        const url = _.get(aFiles, '[0].url') || '';
        this.setState({
            sUserImageFromFileUpload: url,
            sUserImage: url,
        })
    };

    handleDeleteMe = () => {
        let confirmParam = {
            className: 'signout-confirm',
            title: '삭제',
            detail: '본인에 관한 모든 데이터가 삭제됩니다. 탈퇴하겠습니까?',
            confirmTitle: '확인',
            noTitle: '취소',
            confirmFunc: this.proccessDeleteMe
        };
        confirmAlertMsg(confirmParam, '')

    };

    proccessDeleteMe = () => {
        const userId = _.get(this.props, 'user._id') || '';
        executeQuery({
            method: 'delete',
            url: `/user/${userId}`,
            success: (res) => {
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '성공적으로 탈퇴되었습니다.');
                localStorage.setItem('token', null);
                this.props.signOut();
                this.props.handleLogOut();
            },
            fail: (err, res) => {
                const errMsg = _.get(err, 'data.error') || '탈퇴에 실패하였습니다. 관리자에게 문의하세요.';
                pushNotification(NOTIFICATION_TYPE_ERROR, errMsg);
            }
        })
    };

    renderUploadForm = () => {
        return (
            <FileUploadPublic
                title='대표이미지등록'
                pMaxFileCount={1}
                pIsCustomCallback={true}
                pFileFilter={/^(image\/bmp|image\/gif|image\/jpg|image\/jpeg|image\/png)$/i}
                pButtonCustomRender={this.renderUserImage}
                pHandleUploadDone={this.handleGetPhoto}
            />
        )
    };

    renderUserImage = (funcHandleClick) => {
        const {sUserImage, sInfoTableMode, sUserImageFromFileUpload} = this.state;
        const emptyFunc = (() => {
        });
        return (
            <img
                src={sUserImage || sUserImageFromFileUpload || '/assets/images/producer/user-profile-not-found.jpeg'}
                onClick={sInfoTableMode === MODE_READ ? emptyFunc : funcHandleClick}
                onError={(e) => {
                    e.target.src = '/assets/images/producer/user-profile-not-found.jpeg'
                }}
                alt=''
            />
        );
    };

    renderInfoAPIForm = () => {
        const {sInfoTableMode, sUserRole, sUserImage, sUserImageFromFileUpload, sIsMobileDimension} = this.state;
        const userId = this.props.user ? this.props.user._id : '';

        this.userFormInfo = [
            [
                {
                    name: 'userID',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '아이디'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'email',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '이메일'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'realName',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '이름'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'nickName',
                    type: TYPE_INPUT,
                    title: {
                        string: '닉네임'
                    },
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '닉네임을 입력하세요.',
                        },
                        checkValidation: (input) => {
                            this.nickNameVerified = input === this.nickName;
                            this.newNickName = input;
                            return null;
                        }
                    },
                },
                {
                    name: 'apiform-additional-button',
                    type: TYPE_BUTTON,
                    action: {
                        type: ACTION_CUSTOM,
                        action: this.sendNickName
                    },
                    kind: BUTTON_NORMAL,
                    className: "gray-button",
                    title: '중복확인',
                },
            ],
            [
                {
                    name: 'phoneNumber',
                    type: TYPE_NUMBER,
                    title: {
                        string: '핸드폰번호'
                    },
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '휴대전화번호를 입력하세요.',
                        },
                        checkValidation: (input) => {
                            const regExpPhone = /(01[016789])(\d{4}|\d{3})\d{4}$/g;
                            this.phoneNumber = input;
                            this.changedPhoneNumber = input !== this.defaultPhoneNumber;
                            if (!regExpPhone.test(input)) {
                                this.phoneNumberValid = false;
                            } else {
                                this.phoneNumberValid = true;
                            }
                            return this.phoneNumberValid ? null : '올바른 번호가 아닙니다.';
                        }
                    },
                },
                {
                    name: 'apiform-additional-button',
                    type: TYPE_BUTTON,
                    action: {
                        type: ACTION_CUSTOM,
                        action: this.sendPhoneNumber
                    },
                    kind: BUTTON_NORMAL,
                    className: "gray-button",
                    title: LANG('PAGE_AUTH_SEND_PHONENUMBER'),
                },
            ],
            [{
                name: 'authNo',
                type: TYPE_INPUT,
                title: {
                    string: LANG('PAGE_AUTH_AUTH_NO')
                },
                valid: {
                    checkValidation: (input) => {
                        this.phoneNumberAuthNo = input;
                        return null;
                    }
                },
            }, {
                name: 'apiform-additional-button',
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.checkPhoneNumberAuthNo
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: LANG('PAGE_AUTH_CONFIRM_AUTH_NO'),
            }],
            [
                {
                    name: 'birthday',
                    type: TYPE_DATE,
                    colSpan: 2,
                    title: {
                        string: '생년월일'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'isFemale',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '성별'
                    },
                    disabled: true,
                },
            ],
        ];

        this.providerFormInfo = [
            [
                {
                    name: 'userID',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '아이디'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'email',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '이메일'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'storeName',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '회사명'
                    },
                },
            ],
            [
                {
                    name: 'businessNumber',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '사업자번호'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'callNumber',
                    type: TYPE_NUMBER,
                    colSpan: 2,
                    title: {
                        string: '전화번호'
                    },
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '전화번호를 입력하세요.',
                        },
                        checkValidation: (input) => {
                            return null;
                        }
                    },
                },
            ],
            [{
                name: 'address',
                type: TYPE_INPUT,
                disabled: true,
                title: {
                    string: '주소',
                },
                data: (value) => {
                    if (!value) {
                        return '';
                    }
                    this.address = value;
                    if (typeof value === 'string') {
                        return value;
                    }
                    return `${value.zonecode || ''} ${value.roadAddress || ''} ${value.buildingName || ''}`;
                }
            }, {
                name: 'apiform-additional-button',
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
                colSpan: 2,
                title: {
                    string: '상세주소',
                },
            }],
            [
                {
                    name: 'realName',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '담당자'
                    },
                },
            ],
            [
                {
                    name: 'phoneNumber',
                    type: TYPE_NUMBER,
                    colSpan: 2,
                    title: {
                        string: '핸드폰번호'
                    },
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '핸드폰번호를 입력하세요.',
                        },
                        checkValidation: (input) => {
                            return null;
                        }
                    },
                },
            ],
            [
                {
                    name: 'companyType',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '공급자형태'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'content',
                    type: TYPE_TEXTAREA,
                    colSpan: 2,
                    title: {
                        string: '소개'
                    },
                }
            ]
        ];

        this.sellerFormInfo = [
            [
                {
                    name: 'userID',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '아이디'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'email',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '이메일'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'storeName',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '매장명'
                    },
                },
            ],
            [
                {
                    name: 'businessNumber',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '사업자번호'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'callNumber',
                    type: TYPE_NUMBER,
                    colSpan: 2,
                    title: {
                        string: '전화번호'
                    },
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '전화번호를 입력하세요.',
                        },
                        checkValidation: (input) => {
                            return null;
                        }
                    },
                },
            ],
            [{
                name: 'address',
                type: TYPE_INPUT,
                disabled: true,
                title: {
                    string: '주소',
                },
                data: (value) => {
                    if (!value) {
                        return '';
                    }
                    this.address = value;
                    if (typeof value === 'string') {
                        return value;
                    }
                    return `${value.zonecode || ''} ${value.roadAddress || ''} ${value.buildingName || ''}`;
                }
            }, {
                name: 'apiform-additional-button',
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
                colSpan: 2,
                title: {
                    string: '상세주소',
                },
            }],
            [
                {
                    name: 'representer',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '대표자'
                    },
                },
            ],
            [
                {
                    name: 'realName',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '담당자'
                    },
                },
            ],
            [
                {
                    name: 'phoneNumber',
                    type: TYPE_NUMBER,
                    colSpan: 2,
                    title: {
                        string: '핸드폰번호'
                    },
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '핸드폰번호를 입력하세요.',
                        },
                        checkValidation: (input) => {
                            return null;
                        }
                    },
                },
            ],
        ];

        this.providerMobileFormInfo = [
            [
                {
                    type: TYPE_CUSTOM,
                    rowSpan: 3,
                    className: "seller-file-upload",
                    customRender: this.renderUploadForm
                },
                {
                    name: 'userID',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '아이디'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'email',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '이메일'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'storeName',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '회사명'
                    },
                },
            ],
            [
                {
                    name: 'businessNumber',
                    type: TYPE_INPUT,
                    colSpan: 3,
                    title: {
                        string: '사업자번호'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'callNumber',
                    type: TYPE_NUMBER,
                    colSpan: 3,
                    title: {
                        string: '전화번호'
                    },
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '전화번호를 입력하세요.',
                        },
                        checkValidation: (input) => {
                            return null;
                        }
                    },
                },
            ],
            [{
                name: 'address',
                type: TYPE_INPUT,
                disabled: true,
                title: {
                    string: '주소',
                },
                data: (value) => {
                    if (!value) {
                        return '';
                    }
                    this.address = value;
                    if (typeof value === 'string') {
                        return value;
                    }
                    return `${value.zonecode || ''} ${value.roadAddress || ''} ${value.buildingName || ''}`;
                }
            }, {
                name: 'apiform-additional-button',
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
                colSpan: 3,
                title: {
                    string: '상세주소',
                },
            }],
            [
                {
                    name: 'realName',
                    type: TYPE_INPUT,
                    colSpan: 3,
                    title: {
                        string: '담당자'
                    },
                },
            ],
            [
                {
                    name: 'phoneNumber',
                    type: TYPE_NUMBER,
                    colSpan: 3,
                    title: {
                        string: '핸드폰번호'
                    },
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '핸드폰번호를 입력하세요.',
                        },
                        checkValidation: (input) => {
                            return null;
                        }
                    },
                },
            ],
            [
                {
                    name: 'companyType',
                    type: TYPE_INPUT,
                    colSpan: 3,
                    title: {
                        string: '공급자형태'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'content',
                    type: TYPE_TEXTAREA,
                    colSpan: 3,
                    title: {
                        string: '소개'
                    },
                }
            ]
        ];

        this.sellerMobileFormInfo = [
            [
                {
                    type: TYPE_CUSTOM,
                    rowSpan: 3,
                    className: "seller-file-upload",
                    customRender: this.renderUploadForm
                },
                {
                    name: 'userID',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '아이디'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'email',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '이메일'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'businessNumber',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '사업자번호'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'storeName',
                    type: TYPE_INPUT,
                    title: {
                        string: '매장명'
                    },
                    colSpan: 3,
                },
            ],
            [
                {
                    name: 'callNumber',
                    type: TYPE_NUMBER,
                    title: {
                        string: '전화번호'
                    },
                    colSpan: 3,
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '전화번호를 입력하세요.',
                        },
                        checkValidation: (input) => {
                            return null;
                        }
                    },
                },
            ],
            [{
                name: 'address',
                type: TYPE_INPUT,
                disabled: true,
                colSpan: 2,
                title: {
                    string: '주소',
                },
                data: (value) => {
                    if (!value) {
                        return '';
                    }
                    this.address = value;
                    if (typeof value === 'string') {
                        return value;
                    }
                    return `${value.zonecode || ''} ${value.roadAddress || ''} ${value.buildingName || ''}`;
                }
            }, {
                name: 'apiform-additional-button',
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
                colSpan: 3,
            }],
            [
                {
                    name: 'representer',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '대표자'
                    },
                },
            ],
            [
                {
                    name: 'realName',
                    type: TYPE_INPUT,
                    title: {
                        string: '담당자'
                    },
                    colSpan: 3,
                },
            ],

            [
                {
                    name: 'phoneNumber',
                    type: TYPE_NUMBER,
                    title: {
                        string: '핸드폰번호'
                    },
                    colSpan: 3,
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '핸드폰번호를 입력하세요.',
                        },
                        checkValidation: (input) => {
                            return null;
                        }
                    },
                },
            ],
        ];

        this.userMobileFormInfo = [
            [
                {
                    type: TYPE_CUSTOM,
                    rowSpan: 5,
                    customRender: this.renderUploadForm,
                    className: "file-upload-image"
                },
                {
                    name: 'userID',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '아이디'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'email',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '이메일'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'realName',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '이름'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'birthday',
                    type: TYPE_DATE,
                    colSpan: 2,
                    title: {
                        string: '생년월일'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'isFemale',
                    type: TYPE_INPUT,
                    colSpan: 2,
                    title: {
                        string: '성별'
                    },
                    disabled: true,
                },
            ],
            [
                {
                    name: 'nickName',
                    type: TYPE_INPUT,
                    title: {
                        string: '닉네임'
                    },
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '닉네임을 입력하세요.',
                        },
                        checkValidation: (input) => {
                            this.nickNameVerified = input === this.nickName;
                            this.newNickName = input;
                            return null;
                        }
                    },
                    colSpan: 2,
                },
                {
                    name: 'apiform-additional-button',
                    type: TYPE_BUTTON,
                    action: {
                        type: ACTION_CUSTOM,
                        action: this.sendNickName
                    },
                    kind: BUTTON_NORMAL,
                    className: "gray-button",
                    title: '중복확인',
                },
            ],
            [
                {
                    name: 'phoneNumber',
                    type: TYPE_NUMBER,
                    colSpan: 2,
                    title: {
                        string: '핸드폰번호'
                    },
                    valid: {
                        required: {
                            isRequired: true,
                            errMsg: '휴대전화번호를 입력하세요.',
                        },
                        checkValidation: (input) => {
                            const regExpPhone = /(01[016789])(\d{4}|\d{3})\d{4}$/g;
                            this.phoneNumber = input;
                            this.changedPhoneNumber = input !== this.defaultPhoneNumber;
                            if (!regExpPhone.test(input)) {
                                this.phoneNumberValid = false;
                            } else {
                                this.phoneNumberValid = true;
                            }
                            return this.phoneNumberValid ? null : '올바른 번호가 아닙니다.';
                        }
                    },
                },
                {
                    name: 'apiform-additional-button',
                    type: TYPE_BUTTON,
                    action: {
                        type: ACTION_CUSTOM,
                        action: this.sendPhoneNumber
                    },
                    kind: BUTTON_NORMAL,
                    className: "gray-button",
                    title: LANG('PAGE_AUTH_SEND_PHONENUMBER'),
                },
            ],
            [{
                name: 'authNo',
                type: TYPE_INPUT,
                colSpan: 2,
                title: {
                    string: LANG('PAGE_AUTH_AUTH_NO')
                },
                valid: {
                    checkValidation: (input) => {
                        this.phoneNumberAuthNo = input;
                        return null;
                    }
                },
            }, {
                name: 'apiform-additional-button',
                type: TYPE_BUTTON,
                action: {
                    type: ACTION_CUSTOM,
                    action: this.checkPhoneNumberAuthNo
                },
                kind: BUTTON_NORMAL,
                className: "gray-button",
                title: LANG('PAGE_AUTH_CONFIRM_AUTH_NO'),
            }],
        ];

        if (userId) {
            return (
                <div className={sIsMobileDimension ? "mobile-apiform-container" : "apiform-container"}>
                    <APIForm
                        onRef={(ref) => {
                            this.mainApiForm = ref
                        }}
                        pMode={{
                            mode: sInfoTableMode,
                        }}
                        pFormInfo={
                            !sIsMobileDimension ?
                                (sUserRole === 'ROLE_USER' ?
                                    this.userFormInfo : sUserRole === 'ROLE_PROVIDER' ?
                                        this.providerFormInfo : sUserRole === 'ROLE_SELLER' ?
                                            this.sellerFormInfo : [])
                                :
                                (sUserRole === 'ROLE_USER' ?
                                    this.userMobileFormInfo : sUserRole === 'ROLE_PROVIDER' ?
                                        this.providerMobileFormInfo : sUserRole === 'ROLE_SELLER' ?
                                            this.sellerMobileFormInfo : [])
                        }
                        pAPIInfo={{
                            select: {
                                queries: [{
                                    method: 'get',
                                    url: `/user/fetchone?id=${userId}`,
                                }],
                                callback: (res, funcSetValues) => {
                                    let result = _.get(res, '[0].user') || {};
                                    if (sUserRole === 'ROLE_USER') {
                                        result.isFemale = result.isFemale ? '여자' : '남자';
                                        this.defaultPhoneNumber = result.phoneNumber || '';
                                        this.nickName = result.nickName;
                                    }
                                    this.setState({
                                        sUserImage: result.image || '',
                                    });
                                    funcSetValues(result);
                                },
                            },
                            update: {
                                queries: [{
                                    method: 'put',
                                    url: `/user/updateone/${userId}`,
                                    data: (formData) => {
                                        formData.role = sUserRole;
                                        formData.image = sUserImageFromFileUpload || sUserImage;
                                        formData.address = this.address;
                                        return formData;
                                    }
                                }],
                                callback: (res) => {
                                    this.handleChangeMode(MODE_READ);
                                    this.props.loginWithToken({
                                        success: (res) => {
                                        },
                                        fail: (res) => {
                                        }
                                    });
                                }
                            },
                        }}
                        pThemeInfo={{
                            error: {
                                errorStyle: ERROR_BORDER,
                                showAll: false,
                                errColor: '#ff0000',
                            }
                        }}
                    />
                </div>
            )

        }
        return null;
    };

    render() {
        const {sInfoTableMode, sIsMobileDimension, sUserRole} = this.state;
        const {sData, sModalShow, sEditData, sDataMode} = this.state;
        const {user} = this.props;
        const userId = _.get(this.props, 'user._id') || '';
        const that = this;
        return (
            <div className='container-page-myinfo'>
                <div className='myinfo-container'>
                    {
                        sUserRole && sUserRole !== 'ROLE_ADMIN' && sUserRole !== 'ROLE_PUB_MANAGER' &&
                        <div className='myinfo-main-info-table'>
                            <div className='info-table'>
                                {!sIsMobileDimension && sUserRole !== 'ROLE_ADMIN' &&
                                <FileUploadPublic
                                    title='대표이미지등록'
                                    pMaxFileCount={1}
                                    pIsCustomCallback={true}
                                    pFileFilter={/^(image\/bmp|image\/gif|image\/jpg|image\/jpeg|image\/png)$/i}
                                    pButtonCustomRender={this.renderUserImage}
                                    pHandleUploadDone={this.handleGetPhoto}
                                />
                                }
                                {this.renderInfoAPIForm()}
                            </div>
                            <div className='info-table-operation-buttons'>
                                {sInfoTableMode === MODE_READ &&
                                <div className='info-table-update'
                                     onClick={this.handleChangeMode.bind(this, MODE_UPDATE)}>수정</div>
                                }
                                {sInfoTableMode === MODE_UPDATE &&
                                <div className='info-table-update' onClick={this.handleSaveAPIForm}>저장</div>
                                }
                                {sInfoTableMode === MODE_UPDATE &&
                                <div className='info-table-update' onClick={this.handleCancelAPIForm}>취소</div>
                                }
                                <div className='info-table-update' onClick={this.handleDeleteMe}>회원탈퇴</div>
                            </div>
                        </div>
                    }

                    <div className='defail-info-container'>
                        <div className='detail-name'>비밀번호 변경</div>
                        <APIForm
                            onRef={(ref) => {
                                this.passwordApiForm = ref
                            }}
                            pMode={{
                                mode: MODE_CREATE,
                            }}
                            pFormInfo={[
                                [{
                                    name: 'oldPassword',
                                    type: TYPE_PASSWORD,
                                    placeholder: '현재 비밀번호',
                                }],
                                [{
                                    name: 'newPassword',
                                    type: TYPE_PASSWORD,
                                    placeholder: '변경할 비밀번호',
                                    valid: {
                                        required: {
                                            isRequired: true,
                                            errMsg: '비밀번호를 입력하세요.',
                                        },
                                        checkValidation: (input) => {
                                            that.password = input;
                                            if (sUserRole !== 'ROLE_ADMIN') {
                                                const regExpPw = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{9,20}$/;
                                                if (!regExpPw.test(input)) {
                                                    return '영문, 숫자, 특수문자를 포함한 9자~20자 이하';
                                                }
                                                return null;
                                            }
                                        }
                                    },
                                }],
                                [{
                                    name: 'passwordConfirm',
                                    type: TYPE_PASSWORD,
                                    placeholder: '비밀번호 확인',
                                    valid: {
                                        checkValidation: (input) => {
                                            if (that.password !== input) {
                                                return '비밀번호가 일치하지 않습니다.';
                                            }
                                            return null;
                                        }
                                    },
                                }],
                                [{
                                    type: TYPE_BUTTON,
                                    action: {
                                        type: ACTION_SUBMIT,
                                        errDisabled: true,
                                    },
                                    kind: BUTTON_NORMAL,
                                    shortKeyInfo: {
                                        shortKey: SHORTKEY_CTRL_ALT,
                                        key: 'Enter'
                                    },
                                    title: '저장',
                                    className: 'submit-button-change-password',
                                }],
                            ]}
                            pAPIInfo={{
                                create: {
                                    queries: [{
                                        method: 'put',
                                        url: `/user/resetpassword/${userId}`,
                                    }],
                                    callback: (res) => {
                                        pushNotification(NOTIFICATION_TYPE_SUCCESS, '비밀번호 변경이 성공하었습니다.');
                                    }
                                },
                            }}
                            pThemeInfo={{
                                error: {
                                    errorStyle: ERROR_DIV,
                                    showAll: false,
                                    errColor: '#ff0000',
                                }
                            }}
                        />
                    </div>
                </div>

                {
                    user && user.role === 'ROLE_ADMIN' &&
                    <div className="server-admin-manager-container">
                        <div className="page-title">
                            <label>서브관리자</label>
                            <div className="right-button-content">
                                <button className="control-button" onClick={this.handleInsertUser}>추가</button>
                            </div>
                        </div>
                        <div className="server-admin-show">
                            {
                                <BeerTable
                                    onRef={(ref) => {
                                        this.beerTable = ref
                                    }}
                                    mode={MODE_DATA}
                                    pColumns={this.columns}
                                    pData={sData}
                                />
                            }
                            {
                                sModalShow &&
                                <InsertUserModal
                                    onRef={(ref) => {
                                        this.insertUserModal = ref
                                    }}
                                    handleCloseModal={this.handleCloseInsertModal}
                                    handleInsertUserButton={this.handleInsertUserButton}
                                    userData={sEditData}
                                    mode={sDataMode}
                                    columns={sDataMode === 0 ? CREATE_COLUMNS : UPDATE_COLUMNS}
                                />
                            }
                        </div>
                    </div>
                }
            </div>
        );
    }
}

MyInfo.propTypes = {
    handleLogOut: PropTypes.func,
};

MyInfo.defaultProps = {
    handleLogOut: () => {
    },
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
        {
            loginWithToken,
            signOut,
        }
    )
)(MyInfo);
