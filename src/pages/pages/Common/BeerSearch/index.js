import React, {Component} from 'react';
import _ from 'lodash';
import cn from 'classnames';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Pagination from 'react-js-pagination';

import SearchInputer from '../../../components/SearchInputer';
import BeerItem from '../../../components/BeerItem';

import {executeQuery} from '../../../../library/utils/fetch';
import {findFromArray} from '../../../../library/utils/array';
import BeerFilterSort from '../../../components/BeerFilterSort';
import Loading from '../../../components/Loading';

class BeerSearch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sBeerData: [],
            activePage: 1,
            pageLimit: 10,
            totalCount: 0,
            sBeerOriginData: [],
            sAbroadBeerFilter: [],
            sDomesticBeerFilter: [],
            sFilterWord: {},
            sSortCondition: null,
            sRenderBeerType: 'domestic',
            sSearchWord: props.searchWord,
            sFetchStatus: false,
            sIsMobileDimension: props.isMobileDimension,
            sVisibleData: []
        };
        this.sortArray = [
            {
                title: '평점',
                fieldName: 'overAllRating',
                type: 'number',
            },
            {
                title: '리뷰',
                fieldName: 'reviewCount',
                type: 'number',
            },
            {
                title: 'ABV',
                fieldName: 'alcohol',
                type: 'number',
            },
            {
                title: 'IBU',
                fieldName: 'ibu',
                type: 'number',
            },
            {
                title: '판매매장',
                fieldName: 'pubCount',
                type: 'number',
            },
            {
                title: '신출규시',
                fieldName: 'reg_datetime',
                type: 'string',
            },
        ];
    }

    componentDidMount = () => {
        this.getBeerData();
    };

    componentWillReceiveProps = ( newProps ) => {
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
            sSearchWord: newProps.searchWord
        });
        this.setVisibleData(this.state.sBeerData, this.state.sRenderBeerType, newProps.searchWord);
    };

    getBeerData = () => {
        executeQuery({
            method: 'get',
            url: '/beer/fetchall',
            success: ( res ) => {
                let result = res.beer || [];
                let abroadFilterArray = [];
                let domesticFilterArray = [];
                let resultAbroadFilter = [];
                let resultDomesticFilter = [];
                let abroadCountryArray = [];
                _.map( result, ( beerItem, beerIndex ) => {
                    const review = beerItem.review || [];
                    let overAllRating = 0;
                    _.map( review, ( reviewItem, reviewIndex ) => {
                        overAllRating += reviewItem.marks || 0;
                    });
                    beerItem.reviewCount = review.length;
                    beerItem.overAllRating = overAllRating;
                    const pubs = beerItem.pubs || [];
                    beerItem.pubCount = pubs.length;
                    if (beerItem.type === 'abroad') {
                        const crrFilterValue = beerItem.style;
                        const cityFilterArray = findFromArray( abroadFilterArray, '', crrFilterValue);
                        if (!cityFilterArray) {
                            abroadFilterArray.push(crrFilterValue)
                        }
                    }
                    if (beerItem.type === 'abroad') {
                        const crrFilterValue = beerItem.country;
                        const cityFilterArray = findFromArray( abroadCountryArray, '', crrFilterValue);
                        if (!cityFilterArray) {
                            abroadCountryArray.push(crrFilterValue)
                        }
                    }
                    if (beerItem.type === 'domestic') {
                        const crrFilterValue = beerItem.style;
                        const regionFilterArray = findFromArray( domesticFilterArray, '', crrFilterValue);
                        if (!regionFilterArray) {
                            domesticFilterArray.push(crrFilterValue)
                        }
                    }
                });

                resultAbroadFilter.push({
                    fieldName: 'country',
                    title: '국가',
                    values: abroadCountryArray
                });


                executeQuery({
                    method: 'get',
                    url: '/beer/styles',
                    success: (res) => {
                        this.setState({styles: res.styles});
                        let values = [];
                        for (let i = 0; i < res.styles.length; i ++) {
                            values.push({
                                value: res.styles[i]._id,
                                title: res.styles[i].name
                            })
                        }
                        resultAbroadFilter.push({
                            fieldName: 'styleCategory',
                            title: '스타일',
                            values: values
                        });

                        resultDomesticFilter.push({
                            fieldName: 'styleCategory',
                            title: '스타일',
                            values: values
                        });

                        this.setState({
                            sAbroadBeerFilter: resultAbroadFilter,
                            sDomesticBeerFilter: resultDomesticFilter,
                        });
                    },
                    fail: (err) => {
                        // pushNotification(NOTIFICATION_TYPE_ERROR, errResult);
                    }
                });

                this.setState({
                    sFetchStatus: true,
                    sBeerData: result,
                    sBeerOriginData: result,
                    sAbroadBeerFilter: resultAbroadFilter,
                    sDomesticBeerFilter: resultDomesticFilter,
                });

                this.setVisibleData(result, this.state.sRenderBeerType, this.state.sSearchWord);
            },
            fail: ( err, res ) => {

            }
        })
    };

    setVisibleData = (data, sRenderBeerType, sSearchWord) => {
        let result = [];
        _.map( data, ( beerItem) => {
            // console.log(beerItem);
            let visible = true;
            // const contentString = JSON.stringify( beerItem ).toLowerCase();
            const contentString = beerItem.name + ' ' + beerItem.style + ' ' + beerItem.content;
            if ( sSearchWord ) {
                visible = visible && contentString.indexOf( sSearchWord ) > -1;
            }
            visible = visible && sRenderBeerType === beerItem.type;
            if ( visible ) {
                result.push( beerItem );
            }
        });

        this.setState({sVisibleData: result, totalCount: result.length});
    };

    handleGetFilterAndSortedData = ( aData ) => {
        this.setState({
            sBeerData: aData,
            activePage: 1
        });
        this.setVisibleData(aData, this.state.sRenderBeerType, this.state.sSearchWord);
    };

    handleSearchWordInputed = ( aData, aSearchWord ) => {
        this.setState({
            sSearchWord: aSearchWord,
            activePage: 1
        });
        this.setVisibleData(this.state.sBeerData, this.state.sRenderBeerType, aSearchWord);
    };

    handleSelectChange = ( e ) => {
        if ( !e ) {
            return;
        }
        let { sFilterWord } = this.state;
        const name = e.target.name;
        const value = e.target.value;
        _.set( sFilterWord, name, value );
        this.setState({
            sFilterWord,
        });
    };

    handleClickSortButton = ( aButtonItem ) => {
        this.setState({
            sSortCondition: aButtonItem,
        });
    };

    handleClickBeerType = ( aType ) => {
        this.setState({
            sRenderBeerType: aType,
            activePage: 1
        });
        this.setVisibleData(this.state.sBeerData, aType, this.state.sSearchWord);
    };

    renderBeerSearchContainer = () => {
        const { sSortCondition, sIsMobileDimension, activePage, pageLimit } = this.state;
        let beerDataForRender = [].concat(this.state.sVisibleData);
        let renderData = beerDataForRender.splice((activePage - 1) * pageLimit, pageLimit);

        renderData = renderData.sort(function(a,b) {return Math.floor(Math.random() * renderData.length) - Math.floor(Math.random() * renderData.length)});
        const sortedBeerData = !( sSortCondition && sSortCondition.value )?  renderData : _.orderBy( renderData, [function( beerItem ) {
            const sortValue = _.get( sSortCondition, 'value' ) || '';
            return _.get(beerItem, sortValue) || '';
        }], ['desc']);

        return (
            <div className='beer-search-beer-items'>
                {_.map( sortedBeerData, ( beerItem, beerIndex ) => {
                    return (
                        <BeerItem
                            key={beerIndex}
                            pData={beerItem}
                            isMobileDimension={sIsMobileDimension}
                        />
                    );
                })}
            </div>
        );
    };

    handlePageChange(pageNumber) {
        this.setState({activePage: pageNumber});
    }

    render() {
        const { sBeerOriginData, sAbroadBeerFilter, sDomesticBeerFilter, sRenderBeerType, sFetchStatus, sIsMobileDimension, activePage, pageLimit, totalCount, sSearchWord } = this.state;
        const filterArray = sRenderBeerType === 'abroad'? sAbroadBeerFilter : sDomesticBeerFilter;
        if ( sFetchStatus ) {
            return (
                <div className={sIsMobileDimension ? 'container-mobile-page' : 'container-page-beer-search'}>
                    {
                        sIsMobileDimension &&
                        <div className='beer-search-inputer'>
                            <SearchInputer
                                isMobileDimension={sIsMobileDimension}
                                pData={sBeerOriginData}
                                defaultData={sSearchWord}
                                pHandleSearch={this.handleSearchWordInputed}
                            />
                        </div>
                    }
                    <div className='beer-search-container'>
                        <div className="tab-container">
                            <div className='beer-type-tabs'>
                                <div className={cn('beer-type-domestic', sRenderBeerType === 'domestic' && 'beer-type-tab-selected')} onClick={this.handleClickBeerType.bind( this, 'domestic' )}><span>국내맥주</span></div>
                                <div className={cn('beer-type-abroad', sRenderBeerType === 'abroad' && 'beer-type-tab-selected')} onClick={this.handleClickBeerType.bind( this, 'abroad' )}><span>수입맥주</span></div>
                            </div>
                            <BeerFilterSort
                                pData={sBeerOriginData}
                                pFilterArray = {filterArray}
                                pSortArray = {this.sortArray}
                                pHandleDataArray = {this.handleGetFilterAndSortedData}
                            />

                            <hr/>
                        </div>
                        {this.renderBeerSearchContainer()}
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
                    <Loading />
                </div>
            )
        }
    }
}

BeerSearch.propTypes = {
};

BeerSearch.defaultProps = {
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            searchWord: state.search.searchWord
        }),
    )
)(BeerSearch);