import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import MultiCheckSearch from './FilterRange/search';
import TreeDataList from './treeDataList'
import ShowSelNum from './FilterRange/showSelNum'
import Radio from '../../../Radio'
import { removeFromArray } from '../../../../../library/utils/array';

const IS_FOUND = (value, keyword) => {
  if(!value)
    return false;
  return value.toString().toLowerCase().indexOf(keyword) !== -1 ? true : false;
}

class TreeView extends Component {
  constructor(props) {
    super(props);
    this.state= {
      sIsLoading: false,
      sKindFilter: "",
      sSearchKey: "",
    }
    this.gFilteredData = [];
    this.gKindValue = 'all';
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef( this );
    this.gFilteredData = this.props.pAllData;
    const { sIsLoading } = this.state;
    this.setState({ sIsLoading: !sIsLoading});
  }

  processEachSearch = (aData, aKeyword) => {
    const hasChilds = aData.childs && aData.childs.length > 0;
    if (hasChilds) {
      let ret = [];
      _.map(aData.childs, (childItem, index) => {
        const filtered = this.processEachSearch(childItem, aKeyword);      
        if(filtered !== null){
          ret.push(filtered);
        }
      })
      if (ret.length > 0){
        return { text: aData.text, id: aData.id, childs: ret};
      }
      else{
        return null;
      }
    } 
    else {
      if (IS_FOUND(aData.text, aKeyword)){
        return aData;
      }
      else{
        return null;
      }
    }
  }

  processSearch = (aAllData, aKeyword) => {
    if (!aKeyword) {
      return aAllData;
    }
    if (!!aAllData && aAllData.length > 0) {
      let ret = [];
      _.map(aAllData, (eachData, index) => {
        let realtempData = this.processEachSearch(eachData, aKeyword);
        if(realtempData)
          ret.push(realtempData);
      })
      return ret;
    }
  }

  handleRenderTreeDataList = (aSelData) => {
    this.showSelNum.handleRender(aSelData.length);
    this.treeDataList.handleChangeSelData(aSelData);
  }

  handleSetFilter = (filterData) => {
    const filtered = this.processSearch(this.gFilteredData, filterData.data);
    this.treeDataList.handleChangeFilteredData(filtered);
  }

  handleRadioChange = (aValue) => {
    if (this.gKindValue !== aValue) {
      this.gKindValue = aValue;
      this.multiCheckSearch.handleClearSearch();
      let allData = this.props.pAllData;
      if (aValue === 'teacher'){
        this.gFilteredData = removeFromArray(allData, 'kind', 'student');
      }
      else if (aValue === 'student'){
        this.gFilteredData = removeFromArray(allData, 'kind', 'teacher');
      }
      else {
        this.gFilteredData = allData;
      }
      this.treeDataList.handleChangeFilteredData(this.gFilteredData);
    }
  }

  render() {
    const { pKinds, pArrangeHorizontal, pSelData } = this.props;
    return (
      <div className="treeView-body">
        <div className="filter-body">
          {pKinds.length > 0 &&
            <div className="kindFilter-radio">
              <Radio
                values={pKinds}
                defaultValue='all'
                onChange={this.handleRadioChange}
              />
            </div>
          }
          <ShowSelNum 
            onRef={(ref) => {this.showSelNum = ref}}
            pSelNum = {pSelData.length}
          />
          <MultiCheckSearch
            onRef={(ref) => {this.multiCheckSearch = ref}}
            setFilter={filterData => this.handleSetFilter(filterData)}
          />
        </div>
        <TreeDataList
          onRef={(ref) => {this.treeDataList = ref}}
          pFilteredData = {this.gFilteredData}
          pSelData = {pSelData}
          pArrangeHorizontal = {pArrangeHorizontal}
        
          pHandleChangeSelData = {this.props.pHandleChangeSelData}
        />
      </div>
    )
  }
}

TreeView.propTypes = {
  pAllData: PropTypes.array.isRequired,
  pSelData: PropTypes.array,
  pKinds: PropTypes.array,
  pArrangeHorizontal: PropTypes.bool,
  pHandleChangeSelData: PropTypes.func,
};

export default TreeView;