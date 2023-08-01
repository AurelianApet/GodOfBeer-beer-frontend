import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import _ from 'lodash';

class TreeDataList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sIsLoading: false,
      sSelData: [],
      sFilteredData: [],
    }
    this.fileFlagArray = [];
    this.selIdArray = [];
    this.childsNum = 0;
    this.checkedChildsNum = 0;
  }

  componentDidMount() {
    const { onRef, pSelData, pFilteredData } = this.props;
    onRef( this );
    this.processInitFileFlag(this.props.pFilteredData);
    this.setState({
      sSelData: pSelData,
      sFilteredData: pFilteredData,
    });
  }
  
  componentWillReceiveProps(newProps) {
    if ( !_.isEqual( newProps.pFilteredData, this.props.pFilteredData ) ) {
      this.processInitFileFlag(newProps.pFilteredData);
      this.setState({
        sSelData: newProps.pSelData,
        sFilteredData: newProps.pFilteredData,
      });
    }
  }
  
  processInitFileFlag = (aData) => {
    _.map(aData, (eachData, index)=> {
      let hasChilds = eachData.childs && eachData.childs.length > 0;
      if (hasChilds){
        this.fileFlagArray.push({id: eachData.id, fileFlag: false});
        this.processInitFileFlag(eachData.childs);
      }
    })
  }

  processGetFileFlag = (aData) => {
    let fileFlag = true;
    const hasChilds = aData.childs && aData.childs.length > 0;
    if (hasChilds){
      _.map(this.fileFlagArray, (eachItem, index) => {
        if (eachItem.id === aData.id) fileFlag = eachItem.fileFlag;
      })
    }
    return fileFlag;
  }

  processGetEachCheckFlag = (aData) => {
    let hasChilds = aData.childs && aData.childs.length > 0;
    if (hasChilds){
      _.map(aData.childs, (eachData, index)=>{
        this.processGetEachCheckFlag(eachData);
      })
    }
    else{
      this.childsNum++;
      _.map(this.state.sSelData, (eachItem, index) => {
        if (eachItem.id === aData.id) this.checkedChildsNum++;
      })
    }
  }

  processGetCheckFlag = (aData) => {
    this.childsNum = 0;
    this.checkedChildsNum = 0;
    this.processGetEachCheckFlag(aData);
    let checkFlag;
    if (this.checkedChildsNum === 0) checkFlag = -1;
    else if (this.childsNum === this.checkedChildsNum) checkFlag = 1;
    else checkFlag = 0;
    return checkFlag;
  }

  processGetCheckedIds = (aCheckedItem) => {
    let hasChilds = aCheckedItem.childs && aCheckedItem.childs.length > 0;
    if (hasChilds){
      _.map(aCheckedItem.childs, (eachItem, index) =>{
        this.processGetCheckedIds(eachItem);
      })
    }
    else{
      if (aCheckedItem.id !== "noChilds") {
        this.selIdArray.push(aCheckedItem);
      }
    }
  }

  handleChangeSelData = (aSelData) => {
    this.setState({sSelData: aSelData});
  }

  handleChangeFilteredData = (aFilteredData) => {
    this.setState({sFilteredData: aFilteredData});
  }

  handleFileTreeClick = (obj) => {
    _.map(this.fileFlagArray, (eachId, index)=> {
      if (eachId.id === obj.id) eachId.fileFlag = !eachId.fileFlag;
    })
    const { sIsLoading } = this.state;
    this.setState({sIsLoading: !sIsLoading});
  }
  
  handleCheckItem = (aCheckedItem) => {
    if (this.props.pHandleChangeSelData !== null){
      let checkFlag = this.processGetCheckFlag(aCheckedItem);
      if (checkFlag === 1) checkFlag = -1;
      else checkFlag = 1;
      this.selIdArray = [];
      this.processGetCheckedIds(aCheckedItem);
      this.props.pHandleChangeSelData(this.selIdArray, checkFlag);
    }
  }

  renderTreeItem = (aData, aIndex, leftPadding) => {
    const hasChilds = aData.childs && aData.childs.length > 0;
    let fileFlag = this.processGetFileFlag(aData);
    let checkFlag = this.processGetCheckFlag(aData);
    return (
      <div key={aIndex} className={cn("file-body", !hasChilds && aData.id !== "noChilds" ? this.props.pArrangeHorizontal ? "horizontal-show" : "vertical-show" : "" )}>
        <div className={cn("file-tree", leftPadding === 0? "first-padding-body" : "second-padding-body")}>
          <div className="file-tree-only">
            <div className={cn("file-tree-image-group", hasChilds && aData.id !== "noChilds" ? "":"noChilds-margin-body")}>
              {hasChilds &&
                <i onClick={this.handleFileTreeClick.bind(this, aData)} className = {cn("fa", fileFlag ? "fa-plus-square-o" : "fa-minus-square-o")}/>
              }
            </div>
            <div className="check-image">
              <i onClick={this.handleCheckItem.bind(this, aData)} className = {cn("fa", checkFlag === 1 ? "fa-check-square-o" : checkFlag === -1 ? "fa-square-o" : "fa-check-square")}/>
            </div>
            <div title={aData.text} onClick={this.handleCheckItem.bind(this, aData)} className= {cn("file-tree-text", !hasChilds && aData.id !== "noChilds" ? "":"hasChildsText")}>
              {aData.text}
            </div>
          </div>
          {hasChilds && !fileFlag &&
            _.map(aData.childs, (item, index2) => {
              return this.renderTreeItem(item, index2, leftPadding + 1);
            })
          }
        </div>
      </div>
    )
  }

  render() {
    const { sFilteredData } = this.state;
    return (
      <div className="treeData-list">
        {
          _.map(sFilteredData, (item, index) => {
              return this.renderTreeItem(item, index, 0);
          })
        }
      </div>
    )
  }
}

TreeDataList.propTypes = {
  pFilteredData: PropTypes.array,
  pSelData: PropTypes.array,
  pArrangeHorizontal: PropTypes.bool,

  pHandleChangeSelData: PropTypes.func,
};

export default TreeDataList;