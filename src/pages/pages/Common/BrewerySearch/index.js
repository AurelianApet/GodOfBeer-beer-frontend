import React, { Component } from 'react';
import _ from 'lodash';
import cn from 'classnames';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import SearchInputer from '../../../components/SearchInputer';
import { executeQuery } from '../../../../library/utils/fetch';
import { findFromArray } from '../../../../library/utils/array';
import BeerFilterSort     from '../../../components/BeerFilterSort'
import BreweryItem from '../../../components/BreweryItem';
import Loading from '../../../components/Loading';
import Pagination from 'react-js-pagination';

class BrewerySearch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sFilterArrayAbroad: [],
            sFilterArrayDomestic: [],
            sBreweryData: [],
            sFilterSortArray: [],
            sSearchWord: props.searchWord,
            sBreweryType: 'domestic',
            sBeerData: [],
            sFetchStatus: {},
            sIsMobileDimension: props.isMobileDimension,
            totalCount: 0,
            pageLimit: 10,
            activePage: 1,
            sVisibleData: []
        }

    }

    componentDidMount = () => {
        this.getBreweryData();
        this.getBeerData()
    };

    componentWillReceiveProps = ( newProps ) => {
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
            sSearchWord: newProps.searchWord
        });
        this.setVisibleData(this.state.sFilterSortArray, this.state.sBreweryType, newProps.searchWord);
    };

    getBeerData = () => {
        executeQuery ({
            method: 'get',
            url: 'beer/fetchall',
            success: (res) => {
                let { sFetchStatus } = this.state;
                const result = _.get(res, 'beer') || [];
                sFetchStatus.beer = true;
                this.setState({
                    sFetchStatus,
                    sBeerData: result
                })
            },
            fail: (err) => {
            }
        })
    };

    getBreweryData = () => {
        const { sIsMobileDimension } = this.state;
        executeQuery ({
            method: 'get',
            url: '/brewery/fetchall',
            success: (res) => {
                let { sFetchStatus } = this.state;
                let result = [];
                _.map(res.brewery, (breweryItem, index) => {
                    result.push({
                        ...breweryItem,
                        addressSido: _.get( breweryItem, 'address.sido' ) || '',
                    });
                });
                let abroadFilterArray = [];
                let domesticFilterArray = [];
                let resultAbroadFilter = [];
                let resultDomesticFilter = [];
                let abroadCountryArray = [];

                _.map(result, (breweryItem, index) => {
                    if (breweryItem.type === 'abroad') {
                        const crrFilterValue = breweryItem.city;
                        const cityFilterArray = findFromArray( abroadFilterArray, '', crrFilterValue);
                        if (!cityFilterArray) {
                            abroadFilterArray.push(crrFilterValue)
                        }
                    }
                    if (breweryItem.type === 'abroad') {
                        const crrFilterValue = breweryItem.country;
                        const cityFilterArray = findFromArray( abroadCountryArray, '', crrFilterValue);
                        if (!cityFilterArray) {
                            abroadCountryArray.push(crrFilterValue)
                        }
                    }
                    if (breweryItem.type === 'domestic') {
                        const crrFilterValue = breweryItem.address;
                        if(_.get(crrFilterValue, 'sido')){
                            const regionFilterArray = findFromArray( domesticFilterArray, 'sido', crrFilterValue.sido);
                            if (!regionFilterArray) {
                                domesticFilterArray.push(crrFilterValue.sido)
                            }
                        }
                    }
                });
                if (!sIsMobileDimension) {
                    resultAbroadFilter.push({
                        fieldName: 'city',
                        title: '도시',
                        values: abroadFilterArray
                    })
                }
                resultAbroadFilter.push({
                    fieldName: 'country',
                    title: '국가',
                    values: abroadCountryArray
                });

                resultDomesticFilter.push({
                    fieldName: 'addressSido',
                    title: '지역',
                    values: domesticFilterArray
                });

                sFetchStatus.brewery = true;
                this.setState({
                    sFetchStatus,
                    sFilterArrayAbroad: resultAbroadFilter,
                    sFilterArrayDomestic: resultDomesticFilter,
                    sBreweryData: result,
                    sFilterSortArray: result
                });

                this.setVisibleData(result, this.state.sBreweryType, this.state.sSearchWord);
            },
            fail: ( err, res ) => {

            }
        })
    };

    setVisibleData = (data, sBreweryType, sSearchWord) => {
        let result = [];
        _.map( data, ( item) => {
            let visible = true;
            const contentString = JSON.stringify( item ).toLowerCase();
            if ( sSearchWord ) {
                visible = visible && contentString.indexOf( sSearchWord ) > -1;
            }
            visible = visible && sBreweryType === item.type;
            if ( visible ) {
                result.push( item );
            }
        });

        this.setState({sVisibleData: result, totalCount: result.length});
    };

    getResultData = () => {
        const { sFilterSortArray, sBreweryType } = this.state;
        let result = [];
        _.map(sFilterSortArray, (item, index) => {
            if (item.type === sBreweryType){
                result.push(item);
            }
        });
        return result;
    };

    getFilterArray = (aType) => {
        const { sFilterArrayAbroad, sFilterArrayDomestic } = this.state;
        let result = [];
        if (aType === 'abroad') {
            result = sFilterArrayAbroad
        } else {
            result = sFilterArrayDomestic
        }

        return result;
    };

    handleClickBreweryType = ( aType ) => {
        this.setState({
            sBreweryType: aType
        });
        this.setVisibleData(this.state.sFilterSortArray, aType, this.state.sSearchWord);
    };

    handleGetData = (aData) => {
        this.setState({ sFilterSortArray: aData });
        this.setVisibleData(aData, this.state.sBreweryType, this.state.sSearchWord);
    };

    handleSearchResult = (aData, aSearchWord) => {
        this.setState({ sSearchWord: aSearchWord, sFilterSortArray: aData });
        this.setVisibleData(aData, this.state.sBreweryType, aSearchWord);
    };

    renderBreweryContainer = () => {
        const { sSearchWord, sBeerData, activePage, pageLimit } = this.state;
        let resultData = [].concat(this.state.sVisibleData);
        let renderData = resultData.splice((activePage - 1) * pageLimit, pageLimit);

        renderData = renderData.sort(function(a,b) {return Math.floor(Math.random() * renderData.length) - Math.floor(Math.random() * renderData.length)});

        return (
            _.map(renderData, (breweryItem, index) => {
                const contentString = JSON.stringify(breweryItem);
                if (contentString.indexOf(sSearchWord) > -1) {
                    return (
                        <BreweryItem
                            key = {`${breweryItem._id}_${index}`}
                            pBreweryData = {breweryItem}
                            pBeerData = {sBeerData}
                        />
                    )
                }
            })
        )
    };

    handlePageChange(pageNumber) {
        this.setState({activePage: pageNumber});
    }

    render() {
        const { sBreweryType, sBreweryData, sFetchStatus, sIsMobileDimension, totalCount, activePage, pageLimit, sSearchWord } = this.state;
        const filterArray = this.getFilterArray(sBreweryType);
        const sortArray = sBreweryType === 'domestic' ? [
                {
                    title: '이름',
                    fieldName: 'name',
                },
                {
                    title: '지역',
                    fieldName: 'address',
                }
            ] :
            [];
        if ( sFetchStatus.beer && sFetchStatus.brewery ) {
            return (
                <div className={sIsMobileDimension ? 'mobile-container-page-brewery-search' : 'container-page-brewery-search'}>
                    {
                        sIsMobileDimension &&
                        <div className='brewery-search-inputer'>
                            <SearchInputer
                                isMobileDimension={sIsMobileDimension}
                                pData={sBreweryData}
                                pHandleSearch={this.handleSearchResult}
                                defaultData={sSearchWord}
                            />
                        </div>
                    }
                    <div className='brewery-search-container'>
                        <div className="tab-container">
                            <div className='brewery-type-tabs'>
                                <div className={cn('brewery-type-domestic', sBreweryType === 'domestic' && 'brewery-type-tab-selected')} onClick={this.handleClickBreweryType.bind( this, 'domestic' )}><span>국내</span></div>
                                <div className={cn('brewery-type-abroad', sBreweryType === 'abroad' && 'brewery-type-tab-selected')} onClick={this.handleClickBreweryType.bind( this, 'abroad' )}><span>해외</span></div>
                            </div>
                            {/*{*/}
                            {/*    <BeerFilterSort*/}
                            {/*        pData = {sBreweryData}*/}
                            {/*        pFilterArray = {filterArray}*/}
                            {/*        pSortArray = {sortArray}*/}
                            {/*        pHandleDataArray = {this.handleGetData}*/}
                            {/*    />*/}
                            {/*}*/}
                            <hr/>
                        </div>
                        {
                            this.renderBreweryContainer()
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
                    <Loading />
                </div>
            );
        }
    }
}

BrewerySearch.propTypes = {
};

BrewerySearch.defaultProps = {
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            searchWord: state.search.searchWord
        }),
    )
)(BrewerySearch);
