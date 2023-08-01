import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import SearchInputer from '../../../components/SearchInputer';
import {executeQuery} from '../../../../library/utils/fetch';
import BeerTable, {MODE_DATA, TYPE_NO, TYPE_DATETIME} from '../../../components/BeerTable';
import Loading from '../../../components/Loading';

class Interception extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sInterception: [],
            sFetchStatus: false,
            sSearchWord: props.searchWord,
            sIsMobileDimension: props.isMobileDimension
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            sSearchWord: nextProps.searchWord,
            sIsMobileDimension: nextProps.isMobileDimension
        })
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
                const groupedUsers = _.groupBy(result, 'enabled') || {};
                _.map(groupedUsers.CANCEL, (userItem, userIndex) => {
                    userItem.role = userItem.role === 'ROLE_PUB_MANAGER' ? '매장관리자' :
                        userItem.role === 'ROLE_SELLER' ? '판매자' :
                            userItem.role === 'ROLE_PROVIDER' ? '공급자' : '일반사용자';
                });
                this.setState({
                    sFetchStatus: true,
                    sInterception: groupedUsers.CANCEL || [],
                })
            },
            fail: (err) => {

            }
        })
    };

    handleSearchWordInputed = (aData, aSearchWord) => {
        this.setState({sSearchWord: aSearchWord})
    };

    handleClickDetailShow = (value, dataItem, columnItem) => {
        this.props.history.push(`/admin/interception/interceptiondetail/${dataItem._id}`);

    };

    resultArray = () => {
        const {sInterception, sSearchWord} = this.state;
        let result = [];
        _.map(sInterception, (interceptionItem, interceptionIndex) => {
            const contentString = JSON.stringify(interceptionItem);
            if (contentString.indexOf(sSearchWord) > -1) {
                result.push(interceptionItem);
            }
        });
        return result;
    };

    render() {
        const {sFetchStatus, sSearchWord, sIsMobileDimension} = this.state;
        const searchedArray = this.resultArray();
        if (sFetchStatus) {
            return (
                <div className='container-page-interception'>
                    <div className='interception-container'>
                        <div className='table-title'>차단회원 등록 현황</div>
                        {
                            sIsMobileDimension &&
                            <div className='interception-search-panel'>
                                <SearchInputer
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
                                    name: 'userID',
                                    title: 'ID',
                                },
                                {
                                    name: 'realName, storeName',
                                    title: '이름(사업자명)',
                                    className: 'interception-detail-show',
                                    clickFunc: this.handleClickDetailShow
                                },
                                {
                                    name: 'role',
                                    title: '회원구분',
                                },
                                {
                                    name: 'enabledDate',
                                    title: '차단일',
                                    type: TYPE_DATETIME,
                                }
                            ]}
                            pData={searchedArray}
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

Interception.propTypes = {};

Interception.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            searchWord: state.search.searchWord
        }),
    )
)(Interception);
