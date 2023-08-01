import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import SearchInputer from '../../../components/SearchInputer';

const SORT_BUTTONS = [
  {
    title: '이벤트중',
    value: '',
  },
  {
    title: '좋아요많은',
    value: '',
  },
  {
    title: '리뷰많은',
    value: '',
  },
  {
    title: '새로생긴',
    value: 'createdAt',
  },
]

class StoreSearch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sStoreData: [],
      sOriginStoreData: [],
      sStoreLocationArray: [],
      sFilterWord: {},
      sSortCondition: null,
    }
  }

  componentDidMount = () => {
    this.getStoreData();
  }

  getStoreData = () => {
  }

  getVisibleData = () => {
    const { sStoreData, sSearchWord, sFilterWord } = this.state;
    let result = [];
    _.map( sStoreData, ( storeItem, storeIndex ) => {
      let visible = true;
      _.map( sFilterWord, ( filterItem, filterIndex ) => {
        if ( filterItem ) {
          visible = visible && ( _.get( storeItem, filterIndex ) === filterItem );
        }
      });
      if ( visible ) {
        result.push( storeItem );
      }
    });
    return result;
  }

  handleSearchWordInputed = ( aData ) => {
    this.setState({
      sStoreData: aData,
    });
  }

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
  }

  handleClickSortButton = ( aButtonItem ) => {
    this.setState({
      sSortCondition: aButtonItem,
    });
  }

  renderStoreSearchContainer = () => {
    const { sSortCondition } = this.state;
    const storeDataForRender = this.getVisibleData();
    const sortedStoreData = !( sSortCondition && sSortCondition.value )? storeDataForRender : _.orderBy( storeDataForRender, [function( storeItem ) { 
      const sortValue = _.get( sSortCondition, 'value' ) || '';
      let returnValue = _.get( storeItem, sortValue ) || '';
      return returnValue; 
    }], ['desc']);
  }

  render() {
    const { sStoreLocationArray, sOriginStoreData } = this.state;
    return (
      <div className='container-page-store-search'>
        <div className='store-search-inputer'>
          <SearchInputer
            pData={sOriginStoreData}
            pHandleSearch={this.handleSearchWordInputed}
          />
        </div>
        <div className='store-search-container'>
          <div className='store-search-header'>
            <div className='store-search-filter-panel'>
              <div className='store-search-type-filter'>
                <select
                  name='location'
                  onChange={this.handleSelectChange}
                >
                  <option key='none' value=''></option>
                  {_.map( sStoreLocationArray, ( locationItem, locationIndex ) => {
                    return (
                      <option key={locationIndex} value={locationItem.value}>{locationItem.title}</option>
                    )
                  })}
                </select>
              </div>
            </div>
            <div className='store-search-title-bar'>
              <div className='store-search-title'>검색 결과</div>
              <div className='store-search-sort-buttons'>
                {_.map( SORT_BUTTONS, ( buttonItem, buttonIndex ) => {
                  return (
                    <div 
                      key={buttonIndex}
                      className='sort-button'
                      onClick={this.handleClickSortButton.bind( this, buttonItem )}
                    >
                      {buttonItem.title}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

StoreSearch.propTypes = {
};

StoreSearch.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(StoreSearch);