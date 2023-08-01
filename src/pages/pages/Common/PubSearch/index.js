import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {executeQuery} from '../../../../library/utils/fetch';
import PubItem from '../../../components/PubItem';
import SearchInputer from '../../../components/SearchInputer';
import BeerFilterSort from '../../../components/BeerFilterSort';
import Loading from '../../../components/Loading';
import {findFromArray} from '../../../../library/utils/array';
import Pagination from 'react-js-pagination';
import { Seq } from 'immutable';

const getQuery = (aQueryString) => {
    if (!aQueryString) return null;
    const querySplitted = aQueryString.split('=');
    let key = querySplitted[0];
    const value = querySplitted[1];
    key = key.substr(1, key.length);
    let result = {};
    _.set(result, key, value);
    return result;
};

class PubSearch extends Component {

    constructor(props) {
        super(props);
        const query = getQuery(_.get(props, 'location.search'));
        this.state = {
            sPubData: [],
            sSearchWord: props.searchWord,
            sBeerId: 0,
            sBottleType: '',
            sBeerData: [],
            sQuery: query ? {...query} : null,
            sPubFiltedArray: [],
            sFetchStatus: false,
            sIsMobileDimension: props.isMobileDimension,
            totalCount: 0,
            pageLimit: 10,
            activePage: 1,
            sVisibleData: []
        };
        this.filterArray = [
            {
                fieldName: 'point_filter',
                title: '매장',
                values: [
                    {
                        title: '포인트사용가능 매장',
                        value: 'point',
                    },
                    {
                        title: '쿠폰사용가능 매장',
                        value: 'coupon',
                    }
                ]
            }
        ];
        this.sortArray = [
            {
                title: '맥주개수',
                fieldName: 'count',
            },
            {
                title: '신규등록매장',
                fieldName: 'reg_datetime',
            }
        ]
    }

    componentDidMount = () => {
        const {sQuery} = this.state;
        if (sQuery) {
            if(sQuery.beerId.indexOf('draft') >= 0) {
                this.setState({
                    sBeerId: sQuery.beerId.slice(5, sQuery.beerId.length),
                    sBottleType: 'Draft'
                })
            } else if(sQuery.beerId.indexOf('bottle') >= 0) {
                this.setState({
                    sBeerId: sQuery.beerId.slice(6, sQuery.beerId.length),
                    sBottleType: 'Bottle & Can'
                })
            }
        }
        this.getPubData();
    };

    componentWillReceiveProps = (newProps) => {
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
            sSearchWord: newProps.searchWord
        });

        this.setVisibleData(this.state.sPubFiltedArray, newProps.searchWord);
    };

    getPubData = () => {
        executeQuery({
            method: 'get',
            url: '/pub/fetchall',
            success: (res) => {
                const {sBeerId, sBottleType} = this.state;
                console.log(sBeerId, sBottleType);
                let result = _.get(res, 'pub') || '';
                let pubs = [];
                _.map(result, (pubItem, pubIndex) => {
                    const beerArray = _.get(pubItem, 'mainMenu') || [];
                    let beer = [];
                    let isExist = false;
                    _.map(beerArray, (beerItem, beerIndex) => {
                        const beerData = _.get(beerItem, 'beer') || '';
                        const isSame = findFromArray(beer, '_id', beerData._id);
                        if (!isSame) {
                            beer.push(beerData)
                        }

                        if(sBeerId && sBottleType) {
                            if(beerData._id == sBeerId && beerItem.bottleType == sBottleType) {
                                isExist = true;
                            }
                        }
                        else {
                            isExist = true;
                        }
                    });
                    pubItem.count = beer.length;
                    console.log(isExist);
                    if(isExist) {
                        pubs.push(pubItem);
                    }
                });
                this.setState({
                    sFetchStatus: true,
                    sPubData: pubs,
                    sPubFiltedArray: pubs,
                });

                this.setVisibleData(pubs, this.state.sSearchWord);
            },
            fail: (err, res) => {

            }
        })
    };

    handleSearchResult = (aData, aSearchWord) => {
        this.setState({sSearchWord: aSearchWord});
        this.setVisibleData(aData, aSearchWord)
    };

    handlePubFilterData = (aFilterData) => {
        this.setState({sPubFiltedArray: aFilterData});
        this.setVisibleData(aFilterData, this.state.sSearchWord);
    };

    setVisibleData = (data, sSearchWord) => {
        let result = [];
        _.map(data, (item) => {
            let visible = true;
            const contentString = JSON.stringify(item).toLowerCase();
            if (sSearchWord) {
                visible = visible && contentString.indexOf(sSearchWord) > -1;
            }
            if (visible) {
                result.push(item);
            }
        });

        this.setState({sVisibleData: result, totalCount: result.length});
    };

    renderPubContainer = () => {
        const {sPubFiltedArray, sSearchWord, activePage, pageLimit} = this.state;

        let resultData = [].concat(this.state.sVisibleData);
        let renderData = resultData.splice((activePage - 1) * pageLimit, pageLimit);

        renderData = renderData.sort(function(a,b) {return Math.floor(Math.random() * renderData.length) - Math.floor(Math.random() * renderData.length)});

        return (
            _.map(renderData, (pubItem, pubIndex) => {
                return (
                    <PubItem
                        key={`${pubItem._id}_${pubIndex}`}
                        pData={pubItem}
                    />
                )
            })
        )
    };

    handlePageChange(pageNumber) {
        this.setState({activePage: pageNumber});
    }

    render() {
        const {sPubData, sFetchStatus, sSearchWord, sIsMobileDimension, totalCount, pageLimit, activePage} = this.state;
        if (sFetchStatus) {
            return (
                <div className={sIsMobileDimension ? 'mobile-container-page-pub-search' : 'container-page-pub-search'}>
                    {
                        sIsMobileDimension &&
                        <div className='pub-search-inputer'>
                            <SearchInputer
                                isMobileDimension={sIsMobileDimension}
                                pData={sPubData}
                                defaultData={sSearchWord}
                                pHandleSearch={this.handleSearchResult}
                            />
                        </div>
                    }
                    <div className='pub-search-container'>
                        <div className="tab-container">
                            <div className='pub-search-header'>
                                <div className='pub-search-filter-panel'>
                                    {
                                        <BeerFilterSort
                                            pData={sPubData}
                                            pFilterArray={this.filterArray}
                                            pSortArray={this.sortArray}
                                            pHandleDataArray={this.handlePubFilterData}
                                        />
                                    }
                                </div>
                            </div>

                            <hr/>
                        </div>
                        {
                            this.renderPubContainer()
                        }
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

PubSearch.propTypes = {};

PubSearch.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            searchWord: state.search.searchWord
        }),
    )
)(PubSearch);
