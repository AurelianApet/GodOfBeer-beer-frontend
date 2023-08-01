import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import BeerTable,
{
    MODE_DATA,
} from '../../../components/BeerTable';
import InsertUserModal from './InsertUserModal';
import {executeQuery} from '../../../../library/utils/fetch';
import {
    pushNotification,
    NOTIFICATION_TYPE_SUCCESS,
    NOTIFICATION_TYPE_ERROR
} from '../../../../library/utils/notification';
import md5 from 'md5';

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

class ServerAdminManager extends Component {

    constructor(props) {
        super(props);
        this.state = {
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
    }

    componentDidMount = () => {
        this.getServerAdminData();
    };

    componentWillReceiveProps = (newProps) => {
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

    render() {
        const {sData, sModalShow, sEditData, sDataMode} = this.state;
        return (
            <div>
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
            </div>
        );
    }
}

ServerAdminManager.propTypes = {};

ServerAdminManager.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(ServerAdminManager);