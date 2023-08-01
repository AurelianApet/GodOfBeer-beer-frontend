import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import {executeQuery} from '../../../../library/utils/fetch';
import BeerTable, {MODE_DATA, TYPE_NO} from '../../../components/BeerTable';
import {
    pushNotification,
    NOTIFICATION_TYPE_SUCCESS,
    NOTIFICATION_TYPE_ERROR
} from '../../../../library/utils/notification';
import Loading from '../../../components/Loading';
import {confirmAlertMsg} from '../../../../library/utils/confirmAlert';

class interceptionDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sInterceptionDetail: {},
            sFetchStatus: false,
        }
    }

    componentDidMount = () => {
        this.getUsers();
    };

    getUsers = () => {
        const userId = _.get(this.props, 'match.params.id') || '';
        executeQuery({
            method: 'get',
            url: `user/fetchone?id=${userId}`,
            success: (res) => {
                const result = _.get(res, 'user') || {};
                this.setState({
                    sFetchStatus: true,
                    sInterceptionDetail: result
                })
            },
            fail: (err) => {

            }
        })
    };

    handleUserEnable = () => {
        const userId = _.get(this.props, 'match.params.id') || '';
        executeQuery({
            method: 'put',
            url: `user/enable/${userId}`,
            data: {
                enabled: 'APPROVAL',
                cancelReason: '',
            },
            success: (res) => {
                this.props.history.push('/admin/interception');
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '사용자 차단해제되었습니다');
            },
            fail: (err, res) => {

            }
        })
    };

    handleUserDelete = () => {
        const {location: {pathname}} = this.props;
        let confirmParam = {
            title: '삭제',
            detail: '이 사용자에 관한 모든 데이터가 삭제됩니다. 삭제하겠습니까?',
            confirmTitle: '확인',
            noTitle: '취소',
            confirmFunc: this.processDeleteUser,
        };
        confirmAlertMsg(confirmParam, pathname);

    };

    processDeleteUser = () => {
        const userId = _.get(this.props, 'match.params.id') || '';
        executeQuery({
            method: 'delete',
            url: `user/${userId}`,
            success: (res) => {
                this.props.history.push('/admin/interception');
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '삭제 성공');
            },
            fail: (err, res) => {
                const errMsg = _.get(err, 'data.error') || '서버와의 통신에 실패하였습니다. 관리자에게 문의해주세요.';
                pushNotification(NOTIFICATION_TYPE_ERROR, errMsg);
            }
        })
    };

    render() {
        const {sInterceptionDetail, sFetchStatus} = this.state;
        const adminDetail = _.get(sInterceptionDetail, 'blockedUser') || {};
        if (sFetchStatus) {
            return (
                <div className='container-page-interception-detail'>
                    <div className='interception-detail-container'>
                        <div className='interception-detail-info-table'>
                            <div style={{fontSize: 16, fontWeight: 'bold'}}>{sInterceptionDetail.storeName}</div>
                            <BeerTable
                                onRef={(ref) => {
                                    this.beerTable = ref
                                }}
                                mode={MODE_DATA}
                                pColumns={[
                                    {
                                        type: TYPE_NO,
                                        title: 'NO.'
                                    },
                                    {
                                        name: 'userID',
                                        title: 'ID',
                                    },
                                    {
                                        name: 'realName',
                                        title: '담당자',
                                    },
                                    {
                                        name: 'callNumber',
                                        title: '전화번호',
                                    }
                                ]}
                                pData={[sInterceptionDetail]}
                            />
                        </div>
                        <div>
                            <div>Comment</div>
                            <textarea value={sInterceptionDetail.cancelReason} readOnly/>
                        </div>
                        <div className='interception-user-manager-name'>
                            <span>{`차단자: ${adminDetail.realName}(${adminDetail.userID})`}</span>
                        </div>
                        <div className='interception-btn-group'>
                            <button className='interception-btn-enable' onClick={this.handleUserEnable}>해제</button>
                            <button className='interception-btn-enable' onClick={this.handleUserDelete}>삭제</button>
                        </div>
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

interceptionDetail.propTypes = {};

interceptionDetail.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            admin: state.auth.admin
        }),
    )
)(interceptionDetail);