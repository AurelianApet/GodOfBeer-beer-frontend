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
import Loading from '../../../components/Loading';
import BreweryItem from "../../../components/BreweryItem";
import PubItem from "../../../components/PubItem";

class BeerSearch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sSearchData: [],
            activePage: 1,
            pageLimit: 10,
            totalCount: 0,
            sSearchOriginData: [],
            sBeerData: [],
            sSearchWord: props.searchWord,
            sSearchFilter: 'beer',
            sFetchStatus: false,
            sIsMobileDimension: props.isMobileDimension,
            sVisibleData: []
        };
    }

    componentDidMount = () => {
        this.getSearchData();
    };

    componentWillReceiveProps = ( newProps ) => {
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
            sSearchWord: newProps.searchWord
        });
        this.setVisibleData(this.state.sSearchData, this.state.sSearchFilter, newProps.searchWord);
    };

    getSearchData = () => {
        executeQuery({
            method: 'get',
            url: '/search/fetchall',
            success: ( res ) => {
                let result = res.result || [];
                let beerData = [];
                _.map( result, ( resultItem, beerIndex ) => {
                    if (resultItem.searchType === 'beer') {
                        const review = resultItem.review || [];
                        let overAllRating = 0;
                        _.map( review, ( reviewItem, reviewIndex ) => {
                            overAllRating += reviewItem.marks || 0;
                        });
                        resultItem.reviewCount = review.length;
                        resultItem.overAllRating = overAllRating;
                        const pubs = resultItem.pubs || [];
                        resultItem.pubCount = pubs.length;
                        beerData.push(resultItem);
                    }
                });
                console.log('search-data:', result);
                this.setState({
                    sFetchStatus: true,
                    sSearchData: result,
                    sBeerData: beerData,
                    sSearchOriginData: result,
                });

                this.setVisibleData(result, this.state.sSearchFilter, this.state.sSearchWord);
            },
            fail: ( err, res ) => {

            }
        })
    };

    setVisibleData = (data, sSearchFilter, sSearchWord) => {
        let result = [];
        _.map( data, ( searchItem) => {
            let visible = true;
            const contentString = JSON.stringify( searchItem ).toLowerCase();
            if ( sSearchWord ) {
                visible = visible && contentString.indexOf( sSearchWord ) > -1;
            }
            if ( visible && searchItem.searchType === sSearchFilter ) {
                result.push( searchItem );
            }
        });

        this.setState({sVisibleData: result, totalCount: result.length});
    };

    handleSearchWordInputed = ( aData, aSearchWord ) => {
        this.setState({
            sSearchWord: aSearchWord,
            sSearchData: aData,
            activePage: 1
        });
        this.setVisibleData(aData, this.state.sSearchFilter, aSearchWord);
    };

    renderSearchContainer = () => {
        const { sIsMobileDimension, activePage, pageLimit, sSearchFilter, sBeerData } = this.state;
        let searchDataForRender = [].concat(this.state.sVisibleData);
        let renderData = searchDataForRender.splice((activePage - 1) * pageLimit, pageLimit);

        renderData = renderData.sort(function(a,b) {return Math.floor(Math.random() * renderData.length) - Math.floor(Math.random() * renderData.length)});

        if (sSearchFilter === 'beer') {
            return (
                <div className='beer-search-beer-items'>
                    {_.map( renderData, ( beerItem, beerIndex ) => {
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
        } else if (sSearchFilter === 'brewery') {
            return (
                _.map(renderData, (breweryItem, index) => {
                    return (
                        <BreweryItem
                            key = {`${breweryItem._id}_${index}`}
                            pBreweryData = {breweryItem}
                            pBeerData = {sBeerData}
                        />
                    )
                })
            )
        }

        return (
            _.map(renderData, (pubItem, pubIndex) => {
                return (
                    <PubItem
                        key = {`${pubItem._id}_${pubIndex}`}
                        pData = {pubItem}
                    />
                )
            })
        )
    };

    handlePageChange(pageNumber) {
        this.setState({activePage: pageNumber});
    }

    changeSearchFilter(filterType) {
        this.setState({sSearchFilter: filterType, activePage: 1});
        this.setVisibleData(this.state.sSearchData, filterType, this.state.sSearchWord);
    }


    render() {
        const {sSearchOriginData, sFetchStatus, sIsMobileDimension, activePage, pageLimit, totalCount, sSearchWord, sSearchFilter} = this.state;
        if ( sFetchStatus ) {
            return (
                <div className={sIsMobileDimension ? 'container-mobile-page' : 'container-page-search'}>
                    <div className="search-filter-container">
                        {
                            sIsMobileDimension &&
                            <div className='beer-search-inputer'>
                                <SearchInputer
                                    isMobileDimension={sIsMobileDimension}
                                    pData={sSearchOriginData}
                                    defaultData={sSearchWord}
                                    pHandleSearch={this.handleSearchWordInputed}
                                />
                            </div>
                        }

                        <div className={cn(sIsMobileDimension ? 'mobile-filter-container' : 'pc-filter-container')}>
                            <div className="filter-box">
                                <button className={cn(sSearchFilter === 'beer' && 'active')} onClick={() => {this.changeSearchFilter('beer')}}>맥주</button>
                                <button className={cn(sSearchFilter === 'brewery' && 'active')} onClick={() => {this.changeSearchFilter('brewery')}}>브루어리</button>
                                <button className={cn(sSearchFilter === 'pub' && 'active')} onClick={() => {this.changeSearchFilter('pub')}}>매장</button>
                            </div>
                        </div>
                    </div>

                    <div className={cn('beer-search-container', !sIsMobileDimension ? 'pc-container' : 'mobile-container')}>
                        {this.renderSearchContainer()}
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