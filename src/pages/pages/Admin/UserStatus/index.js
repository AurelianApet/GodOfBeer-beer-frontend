import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import BeerTable, {MODE_DATA, TYPE_NO} from '../../../components/BeerTable';
import {executeQuery} from '../../../../library/utils/fetch';
import {pushNotification, NOTIFICATION_TYPE_ERROR} from '../../../../library/utils/notification';
import SearchInputer from '../../../components/SearchInputer';

class UserStatus extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sEnableItem: null,
            sIsShowEnableModal: false,
            sIsMobileDimension: props.isMobileDimension,
            sUsers: [],
            sOriginUsers: [],
            sSearchWord: props.searchWord,
        }
    }

    componentDidMount = () => {
        this.getUsers();
    };

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

    getUsers = () => {
        executeQuery({
            method: 'get',
            url: 'user/fetchall',
            success: (res) => {
                const result = res.users || [];
                const groupedUsers = _.groupBy(result, 'role') || {};
                this.setState({
                    sUsers: groupedUsers.ROLE_USER || [],
                    sOriginUsers: groupedUsers.ROLE_USER || [],
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

    userDetailShow = (value, dataItem, columnItem) => {
        this.props.history.push(`/admin/normaluser/normaluserdetail/${dataItem._id}`);
    };

    render() {
        const {sUsers, sOriginUsers, sIsMobileDimension, sSearchWord} = this.state;
        return (
            <div className='container-page-user-status'>
                <div className='user-status-container'>
                    <div className='user-status-table-header'>
                        <div className='table-title'>일반사용자 등록 현황</div>
                    </div>
                    {
                        sIsMobileDimension &&
                        <div className='user-status-search-panel'>
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
                                name: 'realName',
                                title: '이름',
                                className: 'user-detail-show',
                                clickFunc: this.userDetailShow
                            },
                            {
                                name: 'userID',
                                title: 'ID',
                            },
                            {
                                name: 'phoneNumber',
                                title: '전화번호',
                            },
                        ]}
                        pData={sUsers}
                    />
                </div>
            </div>
        );
    }
}

UserStatus.propTypes = {};

UserStatus.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            searchWord: state.search.searchWord
        }),
    )
)(UserStatus);