import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import BeerTable, {MODE_DATA, TYPE_COUNT, TYPE_DATETIME, TYPE_NO, TYPE_NUMBER} from '../../../components/BeerTable';
import {executeQuery} from '../../../../library/utils/fetch';
import SearchInputer from '../../../components/SearchInputer';
import {
    pushNotification,
    NOTIFICATION_TYPE_SUCCESS,
    NOTIFICATION_TYPE_ERROR
} from '../../../../library/utils/notification';
import Loading from '../../../components/Loading';
import CreateProviderModal from "../PubManagerStatus/CreateProviderModal";
import md5 from "md5";

const CREATE_COLUMNS = [
    {
        name: 'storeName',
        title: '회사명',
    },
    {
        name: 'userID',
        title: 'ID',
    },
    {
        name: 'email',
        title: '이메일',
    },
    {
        name: 'realName',
        title: '담당자',
    },
    {
        name: 'callNumber',
        title: '담당자번호',
    },
    {
        name: 'password',
        title: '암호',
    }
];

class PubManagerStatus extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sPubManagerData: [],
            sSearchWord: props.searchWord,
            sSearchedArray: [],
            sOriginData: [],
            sFetchStatus: false,
            sIsMobileDimension: props.isMobileDimension
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            sIsMobileDimension: nextProps.isMobileDimension,
            sSearchWord: nextProps.searchWord
        });

        let pData = this.state.sOriginData;
        let result = [];
        _.map(pData, (dataItem, dataIndex) => {
            const contentString = JSON.stringify(dataItem).toLowerCase();
            if (contentString.indexOf(nextProps.searchWord) > -1) {
                result.push(dataItem);
            }
        });
        this.setState({sSearchedArray: result});

    }

    componentDidMount = () => {
        this.getUsers();
    };

    getUsers = () => {
        executeQuery({
            method: 'get',
            url: 'user/fetchall',
            success: (res) => {
                const result = res.users || [];
                const groupedUsers = _.groupBy(result, 'role') || {};
                this.setState({
                    sFetchStatus: true,
                    sOriginData: groupedUsers.ROLE_PUB_MANAGER || [],
                    sPubManagerData: groupedUsers.ROLE_PUB_MANAGER || [],
                });
                this.resultArray();
            },
            fail: (err, res) => {
            }
        });
    };

    handleClickDetailShow = (value, dataItem, columnItem) => {
        this.props.history.push(`/admin/pubmanager/pubmanagerdetail/${dataItem._id}`);
    };

    handleSearchWordInputed = (aData, aSearchWord) => {
        this.setState({sSearchWord: aSearchWord, sSearchedArray: aData})
    };

    handleClickMangerEnable = (dataItem, e) => {
        executeQuery({
            method: 'put',
            url: `user/enable/${dataItem._id}`,
            data: {
                enabled: 'APPROVAL',
            },
            success: (res) => {
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '관리자 승인되었습니다.');
                this.getUsers();
            },
            fail: (err, res) => {
                pushNotification(NOTIFICATION_TYPE_ERROR, '오류가 발생하었습니다.');

            }
        })
    };

    renderManagerEnable = (value, dataItem, columnItem) => {
        const enabled = _.get(dataItem, 'enabled') || '';
        if (enabled === 'APPROVAL') {
            return (
                <div>
                    <button onClick={this.handleClickMangerEnable.bind(this, dataItem)} disabled
                            className='pubmanager-btn-enable'>승인
                    </button>
                </div>
            )
        } else {
            return (
                <div>
                    <button onClick={this.handleClickMangerEnable.bind(this, dataItem)}
                            className='pubmanager-btn-enable'>승인
                    </button>
                </div>
            )
        }

    };

    resultArray = () => {
        const {sPubManagerData, sSearchWord} = this.state;
        let result = [];
        _.map(sPubManagerData, (managerItem, managerIndex) => {
            const contentString = JSON.stringify(managerItem);
            if (contentString.indexOf(sSearchWord) > -1) {
                result.push(managerItem);
            }
        });
        this.setState({sSearchedArray: result})
    };

    handleCreateProvider = () => {
        this.setState({
            sModalShow: true,
        })
    };

    handleCloseInsertModal = () => {
        this.setState({sModalShow: false})
    };

    handleInsertUserButton = () => {
        console.log(this.insertUserModal.userData);
        for(let i = 0 ; i < CREATE_COLUMNS.length ; i ++) {
            if(!this.insertUserModal.userData[CREATE_COLUMNS[i].name]) {
                const errMsg = CREATE_COLUMNS[i].title + "을(를) 입력하세요.";
                pushNotification(NOTIFICATION_TYPE_ERROR, errMsg);
                return ;
            }
        }
        executeQuery({
            method: 'post',
            url: '/user/pubmanager/create',
            data: {
                ...this.insertUserModal.userData,
                password: md5(this.insertUserModal.userData.password),
            },
            success: (res) => {
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '추가 성공');
                this.getUsers();
                this.beerTable.refresh();
                this.setState({sModalShow: false});
            },
            fail: (err, res) => {
                const errMsg = _.get(err, 'data.error') || '추가 실패';
                pushNotification(NOTIFICATION_TYPE_ERROR, errMsg);
            }
        })
    };

    render() {
        const {sFetchStatus, sSearchedArray, sSearchWord, sOriginData, sIsMobileDimension, sModalShow} = this.state;
        if (sFetchStatus) {
            _.map(sSearchedArray, (managerItem, managerIndex) => {
                const pub = _.get(managerItem, 'pubs') || [];
                managerItem.count = pub.length;
            });
            return (
                <div className='container-page-pub-manager-status'>
                    <div className='pub-manager-container'>
                        <div className='pub-manager-table-header'>
                            <div className='table-title'>본사관리자</div>
                            <div className="right-button-content">
                                <button className="control-button" onClick={this.handleCreateProvider}>추가</button>
                            </div>
                        </div>
                        {
                            sIsMobileDimension &&
                            <div className='pub-manager-status-search-panel'>
                                <SearchInputer
                                    pData={sOriginData}
                                    defaultData={sSearchWord}
                                    pHandleSearch={this.handleSearchWordInputed}
                                />
                            </div>
                        }
                        {
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
                                        name: 'storeName',
                                        title: '회사명',
                                        className: 'provider-detail-show',
                                        clickFunc: this.handleClickDetailShow
                                    },
                                    {
                                        name: 'userID',
                                        title: 'ID',
                                    },
                                    {
                                        name: 'email',
                                        title: '이메일',
                                    },
                                    {
                                        name: 'createdAt',
                                        title: '등록일',
                                        type: TYPE_DATETIME
                                    },
                                    {
                                        name: 'pubs',
                                        title: '관리매장',
                                        type: TYPE_COUNT
                                    }
                                ]}
                                pData={sSearchedArray}
                            />
                        }
                    </div>
                    {
                        sModalShow &&
                        <CreateProviderModal
                            onRef={(ref) => {
                                this.insertUserModal = ref
                            }}
                            handleCloseModal={this.handleCloseInsertModal}
                            handleInsertUserButton={this.handleInsertUserButton}
                            columns={CREATE_COLUMNS}
                        />
                    }
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

PubManagerStatus.propTypes = {};

PubManagerStatus.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            searchWord: state.search.searchWord
        }),
    )
)(PubManagerStatus);