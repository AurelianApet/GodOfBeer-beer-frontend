import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import BeerTable, {MODE_DATA, TYPE_NO} from '../../../components/BeerTable';
import {executeQuery} from '../../../../library/utils/fetch';
import SearchInputer from '../../../components/SearchInputer';
import Loading from '../../../components/Loading';

class BlockedSellerStatus extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sEnableItem: null,
            sIsShowEnableModal: false,
            sUsers: [],
            sOriginUsers: [],
            sSearchWord: props.searchWord,
            sFetchStatus: false,
            sIsMobileDimension: props.isMobileDimension,
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
                this.setState({
                    sFetchStatus: true,
                    sUsers: groupedUsers.ROLE_SELLER || [],
                    sOriginUsers: groupedUsers.ROLE_SELLER || [],
                })
            },
            fail: (err, res) => {
            }
        });
    };

    handleClickDetailShow = (value, dataItem, columnItem) => {
        this.props.history.push(`/admin/seller/sellerdetail/${dataItem._id}`);
    };

    handleSearchWordInputed = (aData) => {
        this.setState({
            sUsers: aData,
        });
    };

    render() {
        const {sUsers, sOriginUsers, sFetchStatus, sIsMobileDimension, sSearchWord} = this.state;

        let results = [];
        for (let i = 0; i < sUsers.length; i ++) {
            if (sUsers[i].limited) {
                results.push(sUsers[i]);
            }
        }

        if (sFetchStatus) {
            return (
                <div className='container-page-seller-status'>
                    <div className='seller-status-container'>
                        <div className='seller-status-table-header'>
                            <div className='table-title'>기능제한매장</div>
                        </div>

                        {
                            sIsMobileDimension &&
                            <div className='seller-status-search-panel'>
                                <SearchInputer
                                    pData={sOriginUsers}
                                    pHandleSearch={this.handleSearchWordInputed}
                                    defaultData={sSearchWord}
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
                                    title: '매장명',
                                    className: 'seller-detail-show',
                                    clickFunc: this.handleClickDetailShow
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
                                    title: '담당자번호',
                                }
                            ]}
                            pData={results}
                        />
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

BlockedSellerStatus.propTypes = {};

BlockedSellerStatus.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            searchWord: state.search.searchWord
        }),
    )
)(BlockedSellerStatus);
