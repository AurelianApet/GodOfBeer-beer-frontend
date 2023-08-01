import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import BeerTable, {MODE_DATA, TYPE_NO, TYPE_DATETIME, TYPE_DATE, TYPE_COUNT} from '../../../components/BeerTable';
import {executeQuery} from '../../../../library/utils/fetch';
import {
    pushNotification,
    NOTIFICATION_TYPE_SUCCESS,
    NOTIFICATION_TYPE_ERROR,
    NOTIFICATION_TYPE_WARNING
} from '../../../../library/utils/notification';
import UserRefuseModal from './UserRefuseModal';
import InsertPubModal from './InsertPubModal';
import {confirmAlertMsg} from '../../../../library/utils/confirmAlert';
import LANG from '../../../../language';
import Loading from '../../../components/Loading';

class PubManagerDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sData: [],
            sIsUserStatusModal: false,
            sIsInsertPubModal: false,
            sPubData: [],
            sFetchStatus: {}
        };
        this.managerPubData = [];
        this.insertPubArray = [];
    }

    componentDidMount = () => {
        this.getUserDetail();
        this.getPubData();
    };

    getPubData = () => {
        const {sFetchStatus} = this.state;
        executeQuery({
            method: 'get',
            url: '/pub/fetchall',
            success: (res) => {
                const result = _.get(res, 'pub') || [];
                sFetchStatus.pub = true;
                this.setState({
                    sFetchStatus,
                    sPubData: result
                })
            },
            fail: (err) => {

            }
        })
    };

    getUserDetail = () => {
        const {sFetchStatus} = this.state;
        const userId = _.get(this.props, 'match.params.id') || '';
        executeQuery({
            method: 'get',
            url: `user/fetchone?id=${userId}`,
            success: (res) => {
                const user = _.get(res, 'user');
                sFetchStatus.user = true;
                this.setState({
                    sFetchStatus,
                    sData: [user] || []
                })
            },
            fail: (err) => {

            }
        })
    };

    handleUserDisable = () => {
        this.setState({sIsUserStatusModal: true})
    };

    handleCloseEnableModal = () => {
        this.setState({sIsUserStatusModal: false})
    };

    handleClickEnableUserButton = () => {
        const {sData} = this.state;
        if (!this.userRefuseModal.refuseReason) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '차단사유를 입력하세요.');
            return;
        }
        executeQuery({
            method: 'put',
            url: `user/enable/${_.get(sData, '[0]._id')}`,
            data: {
                enabled: 'CANCEL',
                cancelReason: this.userRefuseModal.refuseReason,
            },
            success: (res) => {
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '사용자 차단되었습니다');
                this.setState({
                    sIsUserStatusModal: false,
                });
            },
            fail: (err, res) => {

            }
        })
    };

    handleInsertPub = () => {
        const {sPubData} = this.state;
        this.insertPubArray = [];
        _.map(sPubData, (originPubItem, originPubIndex) => {
            let visible = false;
            _.map(this.managerPubData, (managePubItem, managePubIndex) => {
                if (originPubItem._id === managePubItem._id) {
                    visible = true;
                }
            });
            if (!visible) {
                this.insertPubArray.push(originPubItem);
            }
        });

        this.setState({sIsInsertPubModal: true})
    };

    handleCloseInsertPub = () => {
        this.setState({sIsInsertPubModal: false})
    };

    handleDeletePub = () => {
        const {location: {pathname}} = this.props;
        const selectedPub = this.beerTable.getCheckedItems();
        if (selectedPub.length === 0) {
            pushNotification(NOTIFICATION_TYPE_WARNING, '선택된 데이터가 없습니다')
        } else {
            let confirmParam = {
                title: LANG('BASIC_DELETE'),
                detail: LANG('BASIC_ALERTMSG_DELETE_PUB'),
                confirmTitle: LANG('BASIC_ALERTMSG_YES'),
                noTitle: LANG('BASIC_ALERTMSG_NO'),
                confirmFunc: this.processDeletePub,
            };
            confirmAlertMsg(confirmParam, pathname);
        }
    };

    handleInsertManagePub = (checked) => {
        const {sPubData} = this.state;
        let pubIds = [];
        const userId = _.get(this.props, 'match.params.id') || '';
        _.map(sPubData, (pubItem, pubIndex) => {
            if (checked[pubItem._id]) {
                pubIds.push(pubItem._id);
            }
        });
        executeQuery({
            method: 'put',
            url: `/user/managepubs/${userId}`,
            data: {
                pubIds: pubIds
            },
            success: (res) => {
                this.setState({sIsInsertPubModal: false});
                this.beerTable.refresh();
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '추가 성공')
            },
            fail: (err) => {
            }
        })
    };

    processDeletePub = () => {
        const userId = _.get(this.props, 'match.params.id') || '';
        const selectedPub = this.beerTable.getCheckedItems();
        let ids = [];
        _.map(selectedPub, (pubItem, index) => {
            ids.push(pubItem._id);
        });
        if (ids.length > 0) {
            executeQuery({
                method: 'post',
                url: '/user/managepubs/multidel',
                data: {
                    id: userId,
                    pubIds: ids,
                },
                success: (res) => {
                    const warnings = res.warnings || [];
                    if (warnings.length > 0) {
                        _.map(warnings, (warningItem, index) => {
                            pushNotification(NOTIFICATION_TYPE_WARNING, warningItem);
                        })
                    } else {
                        pushNotification(NOTIFICATION_TYPE_SUCCESS, '삭제 성공');
                    }
                    this.beerTable.refresh();
                },
                fail: (err, res) => {

                }
            })
        }
    };

    renderUserDetailInfo = () => {
        const {sData, sIsUserStatusModal} = this.state;
        return (
            <div className='pubmanager-info-content'>
                <div className="page-title-container">
                    <div className='pubmanager-info-title'>{_.get(sData, '[0].storeName')}</div>
                    <div>
                        <button className='pubmanager-btn-disable' onClick={this.handleUserDisable}>사용차단</button>
                    </div>
                </div>
                <div className='pubmanager-info-table'>
                    <BeerTable
                        onRef={(ref) => {
                            this.beerDetailTable = ref
                        }}
                        mode={MODE_DATA}
                        pColumns={[
                            {
                                name: 'userID',
                                title: 'ID'
                            },
                            {
                                name: 'email',
                                title: '이메일'
                            },
                            {
                                type: TYPE_DATE,
                                name: 'createdAt',
                                title: '등록일'
                            },
                            {
                                name: 'pubs',
                                title: '관리매장',
                                type: TYPE_COUNT
                            },
                            {
                                name: 'realName',
                                title: '담당자',
                            },
                            {
                                name: 'callNumber',
                                title: '번호',
                            },
                        ]}
                        pData={sData}
                    />
                </div>


                {
                    sIsUserStatusModal &&
                    <UserRefuseModal
                        onRef={(ref) => {
                            this.userRefuseModal = ref
                        }}
                        userData={sData[0]}
                        handleCloseModal={this.handleCloseEnableModal}
                        handleClickEnableUserButton={this.handleClickEnableUserButton}
                    />
                }
            </div>
        )
    };

    renderPubManage = () => {
        const {sIsInsertPubModal} = this.state;
        const userId = _.get(this.props, 'match.params.id') || '';
        return (
            <div className='pubmanager-info-content'>
                <div className='pubmanager-info-table'>
                    <div className="page-title-container">
                        <div className='pubmanager-info-title'>관리매장</div>
                        <div className='button-group-pub-manage'>
                            <button className='button-pub-manage' onClick={this.handleInsertPub}>추가</button>
                            <button className='button-pub-manage' onClick={this.handleDeletePub}>삭제</button>
                        </div>
                    </div>
                    {
                        <BeerTable
                            onRef={(ref) => {
                                this.beerTable = ref
                            }}
                            url={`user/fetchone?id=${userId}`}
                            getDataFunc={(res) => {
                                this.managerPubData = _.get(res, 'user.pubs') || [];
                                return this.managerPubData || []
                            }}

                            pColumns={[
                                {
                                    type: TYPE_NO,
                                    title: 'NO.'
                                },
                                {
                                    name: 'name',
                                    title: '매장명',
                                },
                                {
                                    name: 'callNumber',
                                    title: '사업자번호',
                                },
                                {
                                    name: 'createdAt',
                                    title: '등록일',
                                    type: TYPE_DATETIME
                                },
                            ]}
                            operation={{
                                multiCheck: true,
                            }}
                        />
                    }
                </div>


                {
                    sIsInsertPubModal &&
                    <InsertPubModal
                        onRef={(ref) => {
                            this.insertPub = ref
                        }}
                        pPubData={this.insertPubArray}
                        handleCloseModal={this.handleCloseInsertPub}
                        handleInsertPub={this.handleInsertManagePub}
                    />
                }
            </div>
        )
    };

    render() {
        const {sData, sFetchStatus} = this.state;
        if (sFetchStatus.pub && sFetchStatus.user) {
            return (
                <div className='container-page-pubmanager-detail'>
                    <div className='container-page-pubmanager-info'>
                        {this.renderUserDetailInfo()}
                        {this.renderPubManage()}
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

PubManagerDetail.propTypes = {};

PubManagerDetail.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(PubManagerDetail);
