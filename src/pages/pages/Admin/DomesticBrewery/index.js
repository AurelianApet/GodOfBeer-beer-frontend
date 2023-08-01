import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import BreweryTable, {TYPE_NO, TYPE_IMG, TYPE_DETAIL, TYPE_TEXT} from '../../../components/BreweryTable';
import {
    MODE_CREATE, MODE_UPDATE, MODE_READ,
} from '../../../components/APIForm';

import SearchInputer from '../../../components/SearchInputer';
import UpdateModal from './UpdateModal';
import {executeQuery} from '../../../../library/utils/fetch';
import {confirmAlertMsg} from '../../../../library/utils/confirmAlert';
import LANG from '../../../../language';
import Loading from '../../../components/Loading';
import {
    pushNotification,
    NOTIFICATION_TYPE_WARNING,
    NOTIFICATION_TYPE_SUCCESS
} from '../../../../library/utils/notification';
import Pagination from 'react-js-pagination';

class DomesticBrewery extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sBreweryData: [],
            sFilterBreweryData: [],
            sSearchWord: props.searchWord,
            sFetchStatus: false,
            sIsMobileDimension: props.isMobileDimension,
            sInfoTableMode: MODE_READ,
            sModalMode: MODE_READ,
            sIsShowUpdateModal: false,
            sUpdateId: '',
            totalCount: 0,
            pageLimit: 10,
            activePage: 1
        }

    }

    componentDidMount = () => {
        this.getBreweryData()
    };

    componentWillReceiveProps = (newProps) => {
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
            sSearchWord: newProps.searchWord
        });

        let pData = this.state.sBreweryData;
        let result = [];
        _.map(pData, (dataItem, dataIndex) => {
            const contentString = JSON.stringify(dataItem).toLowerCase();
            if (contentString.indexOf(newProps.searchWord) > -1) {
                result.push(dataItem);
            }
        });
        this.setState({sFilterBreweryData: result, totalCount: result.length, activePage: 1});
    };

    handleCreateNewBrewery = () => {
        this.setState({
            sIsShowUpdateModal: true,
            sModalMode: MODE_CREATE,
        })
    };

    handleHideBrewery = () => {
        const selectedBrewry = this.breweryTable.getCheckedItems();
        if (selectedBrewry.length === 0) {
            pushNotification(NOTIFICATION_TYPE_WARNING, '선택된 데이터가 없습니다')
        } else {
            this.processHideBrewery();
        }
    };

    handleShowBrewery = () => {
        const selectedBrewry = this.breweryTable.getCheckedItems();
        if (selectedBrewry.length === 0) {
            pushNotification(NOTIFICATION_TYPE_WARNING, '선택된 데이터가 없습니다')
        } else {
            this.processShowBrewery();
        }
    };

    handleDeleteBrewery = () => {
        const {location: {pathname}} = this.props;
        const selectedBrewry = this.breweryTable.getCheckedItems();
        if (selectedBrewry.length === 0) {
            pushNotification(NOTIFICATION_TYPE_WARNING, '선택된 데이터가 없습니다')
        } else {
            let confirmParam = {
                title: LANG('BASIC_DELETE'),
                detail: LANG('BASIC_ALERTMSG_DELETE_BREWERY'),
                confirmTitle: LANG('BASIC_ALERTMSG_YES'),
                noTitle: LANG('BASIC_ALERTMSG_NO'),
                confirmFunc: this.processDeleteBrewery,
            };
            confirmAlertMsg(confirmParam, pathname);
        }
    };

    handleClickBreweryTable = (value, dataItem, columnItem) => {
        this.setState({
            sUpdateId: dataItem._id,
            sModalMode: MODE_UPDATE,
            sIsShowUpdateModal: true,
        })
    };

    handleModalShowChange = (aState, aComState) => {
        this.setState({
            sIsShowUpdateModal: aState,
        });
        if (aComState) {
            this.getBreweryData();
        }
    };

    handleSearchResult = (aData, aSearchWord) => {
        this.setState({
            sSearchWord: aSearchWord,
            sFilterBreweryData: aData,
            totalData: aData.length,
            activePage: 1
        })
    };

    getBreweryData = () => {
        const {sSearchWord} = this.state;
        executeQuery({
            method: 'get',
            url: '/brewery/fetch-type/?type=domestic',
            success: (res) => {
                let result = [];
                let breweries = res.brewery;
                _.map(breweries, (dataItem, dataIndex) => {
                    const contentString = JSON.stringify(dataItem).toLowerCase();
                    if (contentString.indexOf(sSearchWord) > -1) {
                        result.push(dataItem);
                    }
                });
                this.setState({
                    sFetchStatus: true,
                    sBreweryData: res.brewery,
                    sFilterBreweryData: result,
                    totalCount: result.length,
                    activePage: 1
                })
            },
            fail: (err, res) => {

            }
        })
    };

    processHideBrewery = () => {
        const selectedBrewry = this.breweryTable.getCheckedItems();
        let ids = [];
        _.map(selectedBrewry, (breweryItem, breweryIndex) => {
            ids.push(breweryItem._id);
        });
        if (ids.length > 0) {
            executeQuery({
                method: 'post',
                url: '/brewery/multihide',
                data: {
                    ids,
                },
                success: (res) => {
                    pushNotification(NOTIFICATION_TYPE_SUCCESS, '숨김 성공');
                },
                fail: (err, res) => {
                }
            })
        }
    };

    processShowBrewery = () => {
        const selectedBrewry = this.breweryTable.getCheckedItems();
        let ids = [];
        _.map(selectedBrewry, (breweryItem, breweryIndex) => {
            ids.push(breweryItem._id);
        });
        if (ids.length > 0) {
            executeQuery({
                method: 'post',
                url: '/brewery/multishow',
                data: {
                    ids,
                },
                success: (res) => {
                    pushNotification(NOTIFICATION_TYPE_SUCCESS, '해제 성공');
                },
                fail: (err, res) => {
                }
            })
        }
    };

    processDeleteBrewery = () => {
        const selectedBrewry = this.breweryTable.getCheckedItems();
        let ids = [];
        _.map(selectedBrewry, (breweryItem, breweryIndex) => {
            ids.push(breweryItem._id);
        });
        if (ids.length > 0) {
            executeQuery({
                method: 'post',
                url: '/brewery/multidel',
                data: {
                    ids,
                },
                success: (res) => {
                    const warnings = res.warnings || [];
                    if (warnings.length > 0) {
                        _.map(warnings, (warningItem, index) => {
                            pushNotification(NOTIFICATION_TYPE_WARNING, warningItem);
                        })
                    } else {
                        pushNotification(NOTIFICATION_TYPE_SUCCESS, '삭제가 완료되었습니다');
                    }
                    this.getBreweryData();
                },
                fail: (err, res) => {
                }
            })
        }
    };

    renderBreweryContent = (value, dataItem, columnItem) => {
        let content = dataItem.content || '';
        if (content.length > 100 ) {
            content = content.substr(0, 100) + '...';
        }
        content = content.replace(/\n/g, "<br>");
        return (
            <div className={'brewery-table-name'}>
                <label className="pointer" onClick={() => {this.handleClickBreweryTable(value, dataItem, columnItem)}}>{dataItem.name}</label>
                <p dangerouslySetInnerHTML={{__html: content}}/>
            </div>
        )
    };

    renderBreweryTable = () => {
        const {sFilterBreweryData, activePage, pageLimit} = this.state;
        let resultData = [].concat(sFilterBreweryData);
        let renderData = resultData.splice((activePage - 1) * pageLimit, pageLimit);

        return (
            <BreweryTable
                onRef={(ref) => {
                    this.breweryTable = ref
                }}
                pData={renderData}
                pColumns={[
                    {
                        name: 'image',
                        title: 'BreweryImage',
                        type: TYPE_IMG,
                    },
                    {
                        name: 'name',
                        title: '양조장 명',
                        className: 'pointer',
                        customRender: this.renderBreweryContent
                    }
                ]}
                operation={{
                    multiCheck: true,
                }}
            />
        )
    };

    handlePageChange(pageNumber) {
        this.setState({activePage: pageNumber});
    }

    render() {
        const {sBreweryData, sFetchStatus, sIsMobileDimension, sIsShowUpdateModal, sModalMode, sUpdateId, sSearchWord, totalCount, pageLimit, activePage} = this.state;

        if (sFetchStatus) {
            return (
                <div
                    className={sIsMobileDimension ? 'mobile-container-page-domestic-brewery' : 'container-page-domestic-brewery'}>
                    <div className='domestic-brewery-container'>
                        <div className='domestic-brewery'>
                            <div className='domestic-brewery-header'>
                                <div className='domestic-brewery-title'>국내 브루어리</div>
                                <div className='domestic-brewery-buttons'>
                                    <div className='domestic-brewery-operation-button'
                                         onClick={this.handleHideBrewery}>숨김
                                    </div>
                                    <div className='domestic-brewery-operation-button'
                                         onClick={this.handleShowBrewery}>해제
                                    </div>
                                    <div className='domestic-brewery-operation-button'
                                         onClick={this.handleCreateNewBrewery}>추가
                                    </div>
                                    <div className='domestic-brewery-operation-button'
                                         onClick={this.handleDeleteBrewery}>삭제
                                    </div>
                                </div>
                            </div>
                            {
                                sIsMobileDimension &&
                                <div className='domestic-brewery-inputer'>
                                    <SearchInputer
                                        isMobileDimension={sIsMobileDimension}
                                        pData={sBreweryData}
                                        defaultData={sSearchWord}
                                        pHandleSearch={this.handleSearchResult}
                                    />
                                </div>
                            }
                            <div className='domestic-brewery-table'>
                                {this.renderBreweryTable()}
                            </div>

                            <div className="pagination-container">
                                <div className="column text-center">
                                    {
                                        totalCount > pageLimit ? (<Pagination
                                            activePage={activePage}
                                            itemsCountPerPage={pageLimit}
                                            totalItemsCount={totalCount}
                                            pageRangeDisplayed={5}
                                            onChange={this.handlePageChange.bind(this)}
                                        />) : ''
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    {sIsShowUpdateModal &&
                    <UpdateModal
                        handleModalClose={this.handleModalShowChange}
                        pMode={sModalMode}
                        pId={sUpdateId}
                    />
                    }
                </div>
            );
        } else {
            return (
                <div className="loading-wrapper">
                    <Loading/>
                </div>
            );
        }
    }
}

DomesticBrewery.propTypes = {};

DomesticBrewery.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            searchWord: state.search.searchWord
        }),
    )
)(DomesticBrewery);
