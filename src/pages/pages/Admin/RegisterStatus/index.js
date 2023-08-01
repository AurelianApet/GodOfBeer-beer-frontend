import React, {Component} from 'react';
import _ from 'lodash';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import BeerTable, {MODE_DATA, TYPE_NO, TYPE_DATETIME, TYPE_DETAIL} from '../../../components/BeerTable';

import {executeQuery} from '../../../../library/utils/fetch';
import {pushNotification, NOTIFICATION_TYPE_ERROR} from '../../../../library/utils/notification';
import UserDetailModal from '../UserDetailModal';
import Loading from '../../../components/Loading';

const TABLE_TITLE = {
    ROLE_USER: '사용자',
    ROLE_PROVIDER: '공급자',
    ROLE_SELLER: '판매자',
};

class RegisterStatus extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sUsers: {},
            sEnableItem: null,
            sIsShowEnableModal: false,
            sRole: null,
            sFetchStatus: false
        };
        this.beerTable = {};
        this.refuseReason = '';
    }

    componentDidMount = () => {
        this.getUsers();
    }

    getUsers = () => {
        executeQuery({
            method: 'get',
            url: 'user/fetchall',
            success: (res) => {
                const result = res.users || [];
                const groupedUsers = _.groupBy(result, 'role') || {};
                this.setState({
                    sFetchStatus: true,
                    sUsers: groupedUsers,
                })
            },
            fail: (err, res) => {
            }
        });
    };

    handleClickStatusTable = (aRole, value, dataItem, columnItem) => {
        let url = '';
        if (aRole === 'ROLE_PROVIDER') {
            url = '/admin/provider/providerdetail/';
        } else if (aRole === 'ROLE_SELLER') {
            url = '/admin/seller/sellerdetail/';
        }
        if (url) {
            url = url + dataItem._id;
            this.props.history.push(url);
        }

    };

    handleCloseEnableModal = () => {
        this.setState({
            sEnableItem: null,
            sIsShowEnableModal: false,
        })
    };

    handleClickEnableUserButton = (aState) => {
        const {sEnableItem} = this.state;
        if (!aState && !this.userDetailModal.refuseReason) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '차단사유를 입력하세요.');
            return;
        }
        executeQuery({
            method: 'put',
            url: `user/enable/${sEnableItem._id}`,
            data: {
                enabled: aState ? 'APPROVAL' : 'CANCEL',
                cancelReason: this.refuseReason,
            },
            success: (res) => {
                this.setState({
                    sEnableItem: null,
                    sRole: null,
                    sIsShowEnableModal: false,
                });
                this.beerTable[sEnableItem.role].refresh();
            },
            fail: (err, res) => {

            }
        })
    };

    renderEnabled = (value, dataItem, columnItem) => {
        let resultStr = '';
        if (value === 'APPROVAL') {
            resultStr = '가입완료';
        } else if (value === 'WAIT') {
            resultStr = '대기상태';
        } else if (value === 'CANCEL') {
            resultStr = '차단';
        }
        return (
            <span>{resultStr}</span>
        );
    };

    renderCurrentStatus = () => {
        const {sUsers} = this.state;
        const provider = sUsers.ROLE_PROVIDER || [];
        const seller = sUsers.ROLE_SELLER || [];
        const user = sUsers.ROLE_USER || [];
        return (
            <div className='register-current-status'>
                <div className='register-current-status-title'>시스템 등록 현황</div>
                <div className='register-current-status-content'>
                    <div className='register-current-provider-status'>
                        <div className='register-current-status-image'>
                            <img src='/assets/images/admin/delivery-truck.png' alt=''/>
                        </div>
                        <div className='register-current-status-value'>
                            <div className='register-current-status-value-name'>공급자</div>
                            <div className='register-current-status-value-content'>{provider.length}</div>
                        </div>
                    </div>
                    <div className='register-current-seller-status'>
                        <div className='register-current-status-image'>
                            <img src='/assets/images/admin/beer-tap.png' alt=''/>
                        </div>
                        <div className='register-current-status-value'>
                            <div className='register-current-status-value-name'>판매자</div>
                            <div className='register-current-status-value-content'>{seller.length}</div>
                        </div>
                    </div>
                    <div className='register-current-user-status'>
                        <div className='register-current-status-image'>
                            <img src='/assets/images/admin/glass.png' alt=''/>
                        </div>
                        <div className='register-current-status-value'>
                            <div className='register-current-status-value-name'>사용자</div>
                            <div className='register-current-status-value-content'>{user.length}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    renderCurrentStatusTable = (aRole) => {
        const {sUsers} = this.state;
        const targetUsers = sUsers[aRole] || [];
        return (
            <div className='register-current-status-table'>
                <div className='register-current-status-table-header'>
                    <div className='table-title'>{`회원가입 현황 ( ${TABLE_TITLE[aRole]} )`}</div>
                </div>
                <BeerTable
                    onRef={(ref) => {
                        this.beerTable[aRole] = ref
                    }}
                    mode={MODE_DATA}
                    pColumns={[
                        {
                            type: TYPE_NO,
                            title: 'NO.'
                        },
                        {
                            name: 'realName',
                            title: '이름',
                        },
                        {
                            name: 'userID',
                            title: 'ID',
                        },
                        {
                            name: 'storeName',
                            title: '업체명',
                        },
                        {
                            name: 'createdAt',
                            title: '가입일시',
                            type: TYPE_DATETIME,
                        },
                        {
                            name: 'enabled',
                            title: '가입상태',
                            customRender: this.renderEnabled
                        },
                        {
                            name: '',
                            title: '상세보기',
                            type: TYPE_DETAIL,
                            clickFunc: this.handleClickStatusTable.bind(this, aRole)
                        }
                    ]}
                    pData={targetUsers}
                />
            </div>
        );
    };

    renderEnableModal = () => {
        const {sRole, sEnableItem} = this.state;
        const sellerColumns = [
            {
                name: 'realName',
                title: '이름',
            },
            {
                name: 'storeName',
                title: '업체명',
            },
            {
                name: 'businessNumber',
                title: '사업자등록번호',
            },
            {
                name: 'phoneNumber',
                title: '핸드폰 번호',
            },
            {
                name: '',
                title: '요청내용',
            },
        ];
        const providerColumns = [
            {
                name: 'realName',
                title: '이름',
            },
            {
                name: 'storeName',
                title: '업체명',
            },
            {
                name: 'businessNumber',
                title: '사업자등록번호',
            },
            {
                name: 'phoneNumber',
                title: '핸드폰 번호',
            },
            {
                name: 'companyType',
                title: '공급자 유형',
                data: (data) => {
                    return data.companyType === 'brewery' ? '양조장' : '수입사';
                },
            },
            {
                name: '',
                title: '요청내용',
            },
        ];
        return (
            <UserDetailModal
                onRef={(ref) => {
                    this.userDetailModal = ref
                }}
                columns={sRole === 'ROLE_SELLER' ? sellerColumns : providerColumns}
                userData={sEnableItem}
                handleCloseModal={this.handleCloseEnableModal}
                handleClickEnableUserButton={this.handleClickEnableUserButton}
            />
        )
    };

    render() {
        const {sIsShowEnableModal, sFetchStatus} = this.state;
        if (sFetchStatus) {
            return (
                <div className='container-page-register-status'>
                    {this.renderCurrentStatus()}
                    {this.renderCurrentStatusTable('ROLE_PROVIDER')}
                    {this.renderCurrentStatusTable('ROLE_SELLER')}
                    {sIsShowEnableModal && this.renderEnableModal()}
                </div>
            );
        } else {
            return (
                <div className="loading-wrapper">
                    <Loading/>
                </div>
            )
        }

    }
}

RegisterStatus.propTypes = {};

RegisterStatus.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(RegisterStatus);