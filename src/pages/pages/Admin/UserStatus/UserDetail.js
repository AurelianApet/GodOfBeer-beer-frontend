import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {executeQuery} from '../../../../library/utils/fetch';
import BeerTable, {MODE_DATA, TYPE_DATETIME} from '../../../components/BeerTable';
import Loading from '../../../components/Loading';
import UserDetailModal from '../UserDetailModal';
import {
    pushNotification,
    NOTIFICATION_TYPE_ERROR,
    NOTIFICATION_TYPE_SUCCESS
} from '../../../../library/utils/notification';

class UserDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sData: [],
            sFetchStatus: false,
            sIsUserDiableModal: false,
        };
        this.columns = [
            {
                name: 'userID',
                title: 'ID',
            },
            {
                name: 'email',
                title: '등록 이메일',
            },
            {
                name: 'phoneNumber',
                title: '전화번호'
            },
            {
                name: 'nickName',
                title: '닉네임',
            },
            {
                name: 'realName',
                title: '담당자',
            },
            {
                name: 'createdAt',
                title: '회원 가입일',
                type: TYPE_DATETIME
            },
        ];
        this.modalColumns = [
            {
                name: 'userID',
                title: 'ID',
            },
            {
                name: 'email',
                title: '등록 이메일',
            },
            {
                name: 'phoneNumber',
                title: '전화번호'
            },
            {
                name: 'nickName',
                title: '닉네임',
            },
            {
                name: 'realName',
                title: '담당자',
            },
        ]
    }

    componentDidMount = () => {
        this.getUserDetail();
    };

    getUserDetail = () => {
        const userId = _.get(this.props, 'match.params.id') || '';
        executeQuery({
            method: 'get',
            url: `user/fetchone?id=${userId}`,
            success: (res) => {
                const user = _.get(res, 'user');
                this.setState({
                    sFetchStatus: true,
                    sData: [user] || []
                })
            },
            fail: (err) => {

            }
        })
    };


    handleUserDisable = () => {
        this.setState({sIsUserDiableModal: true})
    };

    handleCloseEnableModal = () => {
        this.setState({sIsUserDiableModal: false})
    };

    handleClickEnableUserButton = () => {
        const {sData} = this.state;
        if (!this.userDetailModal.refuseReason) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '차단사유를 입력하세요.');
            return;
        }
        executeQuery({
            method: 'put',
            url: `user/enable/${_.get(sData, '[0]._id')}`,
            data: {
                enabled: 'CANCEL',
                cancelReason: this.userDetailModal.refuseReason,
            },
            success: (res) => {
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '사용자 차단되었습니다');
                this.setState({
                    sIsUserDiableModal: false,
                });
            },
            fail: (err, res) => {

            }
        })
    };

    render() {
        const {sData, sFetchStatus, sIsUserDiableModal} = this.state;
        if (sFetchStatus) {
            return (
                <div className='containter-page-user-back'>
                    <div className='container-page-user-detail'>
                        <div className='container-page-user-info'>
                            <div className="page-title-container">
                                <div className='user-info-title'><span>{'공급자정보'}</span></div>
                                <div>
                                    <button className='user-btn-disable' onClick={this.handleUserDisable}>사용차단</button>
                                </div>
                            </div>
                            <div className='user-info-content'>
                                <div className='user-info-table'>
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
                                </div>
                            </div>
                        </div>
                        {
                            sIsUserDiableModal &&
                            <UserDetailModal
                                onRef={(ref) => {
                                    this.userDetailModal = ref
                                }}
                                userData={sData[0]}
                                handleCloseModal={this.handleCloseEnableModal}
                                handleClickEnableUserButton={this.handleClickEnableUserButton}
                                hasOperationButton={true}
                                columns={this.modalColumns}
                            />
                        }
                    </div>
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

UserDetail.propTypes = {};

UserDetail.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(UserDetail);