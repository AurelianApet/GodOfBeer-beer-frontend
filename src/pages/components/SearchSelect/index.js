import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

class SearchSelect extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sSelectedItem: {},
      sFilteredData: [],
      sIsVisibleSelect: false,
    }
  }

  componentDidMount = () => {
    this.setDefaultData( this.props );
  }

  componentWillReceiveProps = ( newProps ) => {
    if ( !_.isEqual( this.props, newProps ) ) {
      this.setDefaultData( newProps );
    }
  }

  setDefaultData = ( aProps ) => {
    const { defaultValue, pData } = aProps;
    this.setState({
      sFilteredData: pData,
      sSelectedItem: defaultValue || {},
    })
  }

  handleChangeSearchWord = ( e ) => {
    if ( !e ) return;
    const { pData, pTitle } = this.props;
    const { value } = e.target;
    let filteredData = [];
    _.map( pData, ( dataItem, dataIndex ) => {
      let title = dataItem.title;
      if ( pTitle.func ) {
        title = pTitle.func( dataItem );
      } else if ( pTitle.key ) {
        title = _.get( dataItem, pTitle.key ) || '';
      }
      if ( title.indexOf( value ) > -1 ) {
        filteredData.push( dataItem );
      }
    });
    this.setState({
      sFilteredData: filteredData,
    })
  }

  handleClickSelectInputer = ( e ) => {
    this.setState( prev => ({
      sIsVisibleSelect: !prev.sIsVisibleSelect,
    }))
  }

  handleClickSearchItem = ( aItem ) => {
    const { pData, onChange } = this.props;
    if ( this.searchInputerElement ) this.searchInputerElement.value = '';
    this.setState({
      sSelectedItem: aItem,
      sIsVisibleSelect: false,
      sFilteredData: pData
    });
    onChange( aItem );
  }

  render() {
    const { pTitle, pHasSearch } = this.props;
    const { sSelectedItem, sFilteredData, sIsVisibleSelect } = this.state;
    let contentTitle = sSelectedItem.title;
    if ( pTitle.func ) {
      contentTitle = pTitle.func( sSelectedItem );
    } else if ( pTitle.key ) {
      contentTitle = _.get( sSelectedItem, pTitle.key ) || '';
    }
    return (
      <div className='container-component-search-select'>
        <div className='search-select-inputer' onClick={this.handleClickSelectInputer}>
          <div className='search-selelct-inputer-content'>{contentTitle}</div>
          <div className='search-selelct-inputer-arrow'><i className='fa fa-angle-down' /></div>
        </div>
        { sIsVisibleSelect && 
          <div className='search-select-items-container'>
            {pHasSearch &&
              <div className='search-inputer'>
                <input ref={node => {this.searchInputerElement = node}} placeholder='검색어를 입력하세요' onChange={this.handleChangeSearchWord} />
              </div>
            }
            <div className='search-select-items'>
              {_.map( sFilteredData, ( dataItem, dataIndex ) => {
                let title = dataItem.title;
                if ( pTitle.func ) {
                  title = pTitle.func( dataItem );
                } else if ( pTitle.key ) {
                  title = _.get( dataItem, pTitle.key ) || '';
                }
                return (
                  <div key={dataIndex} className='search-select-item' onClick={this.handleClickSearchItem.bind( this, dataItem )}>{title}</div>
                )
              })}
            </div>
          </div>
        }
      </div>
    );
  }
}

SearchSelect.propTypes = {
  pHasSearch: PropTypes.bool,
  pTitle: PropTypes.object,
  defaultValue: PropTypes.object,
  pData: PropTypes.array,
  onChange: PropTypes.func,
};

SearchSelect.defaultProps = {
  pHasSearch: true,
  pTitle: {
    key: 'title',
  },
  defaultValue: {},
  pData: [],
  onChange: () => {},
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(SearchSelect);