import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import BeerTable, {MODE_DATA, TYPE_NO, TYPE_DATE} from '../../../components/BeerTable';
import {executeQuery} from '../../../../library/utils/fetch';
import {pushNotification, NOTIFICATION_TYPE_ERROR} from '../../../../library/utils/notification';
import UserDetailModal from '../UserDetailModal';
import SearchInputer from '../../../components/SearchInputer';
import Loading from '../../../components/Loading';

class ProviderStatus extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sEnableItem: null,
            sIsShowEnableModal: false,
            sUsers: [],
            sOriginUsers: [],
            sFetchStatus: false,
            sIsMobileDimension: props.isMobileDimension,
            sSearchWord: props.searchWord
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            sIsMobileDimension: nextProps.isMobileDimension,
            sSearchWord: nextProps.searchWord
        });

        let pData = this.state.sOriginUsers;
        let result = [];
        _.map(pData, (dataItem, dataIndex) => {
            const contentString = JSON.stringify(dataItem).toLowerCase();
            if (contentString.indexOf(nextProps.searchWord) > -1) {
                result.push(dataItem);
            }
        });
        this.setState({sUsers: result});
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
                let providerUsers = groupedUsers.ROLE_PROVIDER;
                _.map(providerUsers, (user, index) => {
                    user.companyType = user.companyType === 1 ? '수입사' : '양조장'
                });
                this.setState({
                    sFetchStatus: true,
                    sUsers: providerUsers || [],
                    sOriginUsers: providerUsers || [],
                })
            },
            fail: (err, res) => {
            }
        });
    };

    handleClickStatusTable = (value, dataItem, columnItem) => {
        this.setState({
            sEnableItem: dataItem,
            sIsShowEnableModal: true,
        })
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
                    sIsShowEnableModal: false,
                });
                this.beerTable.refresh();
            },
            fail: (err, res) => {

            }
        })
    };

    handleSearchWordInputed = (aData) => {
        this.setState({
            sUsers: aData,
        });
    };

    handleClickDetailShow = (value, dataItem, columnItem) => {
        this.props.history.push(`/admin/provider/providerdetail/${dataItem._id}`);
    };


    render() {
        const {sEnableItem, sIsShowEnableModal, sUsers, sOriginUsers, sFetchStatus, sIsMobileDimension, sSearchWord} = this.state;
        if (sFetchStatus) {
            return (
                <div className='container-page-provider-status'>
                    <div className='provider-status-container'>
                        <div className='provider-status-table-header'>
                            <div className='table-title'>공급자 등록 현황</div>
                        </div>
                        {
                            sIsMobileDimension &&
                            <div className='provider-status-search-panel'>
                                <SearchInputer
                                    pData={sOriginUsers}
                                    defaultData={sSearchWord}
                                    pHandleSearch={this.handleSearchWordInputed}
                                />
                            </div>
                        }
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
                                    name: 'companyType',
                                    title: '공급자구분',
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
                                    type: TYPE_DATE,
                                    name: 'createdAt',
                                    title: '가입일',
                                }
                            ]}
                            pData={sUsers}
                        />
                    </div>
                    {sIsShowEnableModal &&
                    <UserDetailModal
                        onRef={(ref) => {
                            this.userDetailModal = ref
                        }}
                        userData={sEnableItem}
                        handleCloseModal={this.handleCloseEnableModal}
                        handleClickEnableUserButton={this.handleClickEnableUserButton}
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

ProviderStatus.propTypes = {};

ProviderStatus.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            searchWord: state.search.searchWord
        }),
    )
)(ProviderStatus);
