import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import CreateAdvertiseModal from './CreateAdvertiseModal';
import {executeQuery} from '../../../../library/utils/fetch';
import {
    pushNotification,
    NOTIFICATION_TYPE_SUCCESS,
    NOTIFICATION_TYPE_ERROR
} from '../../../../library/utils/notification';
import md5 from 'md5';
import moment from 'moment';

const CREATE_COLUMNS = [
    {
        name: 'name',
        title: '광고명',
    },
    {
        name: 'ownerName',
        title: '광고주',
    },
    {
        name: 'startAt',
        title: '시작일',
    },
    {
        name: 'period',
        title: '광고기간',
    },
    {
        name: 'managerName',
        title: '담당자',
    },
    {
        name: 'phoneNumber',
        title: '전화',
    },
    {
        name: 'bannerUrl',
        title: '배너이미지',
    },
    {
        name: 'detailUrl',
        title: '상세이미지',
    },
    {
        name: 'linkUrl',
        title: '연결url',
    }
];

const UPDATE_COLUMNS = [
    {
        name: 'name',
        title: '광고명',
    },
    {
        name: 'ownerName',
        title: '광고주',
    },
    {
        name: 'startAt',
        title: '시작일',
    },
    {
        name: 'period',
        title: '광고기간',
    },
    {
        name: 'managerName',
        title: '담당자',
    },
    {
        name: 'phoneNumber',
        title: '전화',
    },
    {
        name: 'bannerUrl',
        title: '배너이미지',
    },
    {
        name: 'detailUrl',
        title: '상세이미지',
    },
    {
        name: 'linkUrl',
        title: '연결url',
    },
    {
        name: 'status',
        title: '상태',
    }
];

class Advertise extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sData: [],
            sModalShow: false,
            sEditData: {},
            sDataMode: 0,
            sCheckedAdvertise: []
        };
    }

    componentDidMount = () => {
        this.getAdvertiseList();
    };

    getAdvertiseList = () => {
        executeQuery({
            method: 'get',
            url: `/advertise/fetchall`,
            success: (res) => {
                const result = _.get(res, 'advertises') || [];
                this.setState({sData: result})
            },
            fail: (err, res) => {
            }
        })
    };

    handleInsertUser = () => {
        const {sData} = this.state;
        this.setState({
            sModalShow: true,
            sDataMode: 0,
            sEditData: {}
        })
    };

    handleDeleteAdvertise = () => {
        const {sCheckedAdvertise} = this.state;
        if (sCheckedAdvertise.length > 0) {
            executeQuery({
                method: 'post',
                url: '/advertise/delete',
                data: {
                    ids: sCheckedAdvertise
                },
                success: (res) => {
                    pushNotification(NOTIFICATION_TYPE_SUCCESS, '삭제 성공');
                    this.getAdvertiseList();
                },
                fail: (err, res) => {
                    const errMsg = _.get(err, 'data.error') || '삭제 실패';
                    pushNotification(NOTIFICATION_TYPE_ERROR, errMsg);
                }
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
                url: '/advertise/create',
                data: {
                    ...this.insertUserModal.advertiseData,
                },
                success: (res) => {
                    pushNotification(NOTIFICATION_TYPE_SUCCESS, '추가 성공');
                    this.setState({sModalShow: false});
                    this.getAdvertiseList();
                },
                fail: (err, res) => {
                    const errMsg = _.get(err, 'data.error') || '추가 실패';
                    pushNotification(NOTIFICATION_TYPE_ERROR, errMsg);
                }
            })
        } else {
            executeQuery({
                method: 'put',
                url: `/advertise/updateone/${sEditData._id}`,
                data: {
                    ...this.insertUserModal.advertiseData
                },
                success: (res) => {
                    pushNotification(NOTIFICATION_TYPE_SUCCESS, '수정 성공');
                    this.setState({sModalShow: false});
                    this.getAdvertiseList();
                },
                fail: (err, res) => {
                    pushNotification(NOTIFICATION_TYPE_ERROR, '수정 실패');
                }
            })
        }
    };

    calcExpireDate(startAt, period) {
        console.log(startAt);
        let date = new Date(startAt);
        console.log(date);
        let eDate = new Date(date.getTime() + period * 24 * 3600 * 1000);
        return moment(eDate).format('YYYY-MM-DD');
    }

    handleClickAdvertiseItem(item) {
        let {sCheckedAdvertise} = this.state;
        if (sCheckedAdvertise.indexOf(item._id) >= 0) {
            sCheckedAdvertise.splice(sCheckedAdvertise.indexOf(item._id), 1);
        } else {
            sCheckedAdvertise.push(item._id);
        }
        this.setState({sCheckedAdvertise: sCheckedAdvertise});
    }

    handleEditAdvertise(aData) {
        this.setState({
            sModalShow: true,
            sEditData: aData,
            sDataMode: 1
        })
    }

    render() {
        const {sData, sModalShow, sEditData, sDataMode, sCheckedAdvertise} = this.state;
        console.log(sData);
        return (
            <div>
                <div className="advertise-container">
                    <div className="page-title">
                        <label>광고관리</label>
                        <div className="right-button-content">
                            <button className="control-button" onClick={this.handleDeleteAdvertise} style={{marginRight: '5px'}}>삭제</button>
                            <button className="control-button" onClick={this.handleInsertUser}>추가</button>
                        </div>
                    </div>
                    <div className="server-admin-show">

                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>No</th>
                                    <th>광고명</th>
                                    <th>광고주</th>
                                    <th>시작일</th>
                                    <th>종료일</th>
                                    <th>조회</th>
                                    <th>url방문</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                sData.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <i className={sCheckedAdvertise.indexOf(item._id) >= 0 ? 'fa fa-check-square-o' : 'fa fa-square-o'} onClick={this.handleClickAdvertiseItem.bind( this, item )}/>
                                        </td>
                                        <td>{index + 1}</td>
                                        <td>
                                            <a onClick={() => {this.handleEditAdvertise(item)}}>
                                                {item.name}
                                            </a>
                                        </td>
                                        <td>{item.ownerName}</td>
                                        <td>{moment(item.startAt).format('YYYY-MM-DD')}</td>
                                        <td>{this.calcExpireDate(item.startAt, item.period)}</td>
                                        <td>{(item.viewCount * 1).toFixed(0)}</td>
                                        <td>{(item.viewUrlCount * 1).toFixed(0)}</td>
                                        <td>{item.status === 1 ? '게재' : '정지'}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>

                        {
                            sModalShow &&
                            <CreateAdvertiseModal
                                onRef={(ref) => {
                                    this.insertUserModal = ref
                                }}
                                handleCloseModal={this.handleCloseInsertModal}
                                handleCreateButton={this.handleInsertUserButton}
                                advertiseData={sEditData}
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

Advertise.propTypes = {};

Advertise.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(Advertise);
