import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import onClickOutside from 'react-onclickoutside'
import TreeView from './TreeView/treeView';
import SelectedItems from '../Result/selectedItems'
import { Button } from '../../Button';
import { removeFromArray } from '../../../../library/utils/array';
import LANG from '../../../../language'

class SelectPanel extends Component {
  constructor(props) {
    super(props);
    this.gSelectedData = [];
    this.gOldSelData = [];
  }

  processSetGSelData = (aSelData) => {
    this.gOldSelData = [];
    _.map(aSelData, (each, index) => {
      this.gOldSelData.push(each);
    })
  }

  processGetSelectedData = (aData, aSelectIdArray, aCheckFlag) => {
    _.map(aData, (eachData, index) => {
      let hasChilds = eachData.childs && eachData.childs.length > 0;
      if (hasChilds){
        this.processGetSelectedData(eachData.childs, aSelectIdArray, aCheckFlag);
      }
      else{
        _.map(aSelectIdArray, (eachId, index2) => {
          if (eachData.id === eachId.id){
            if (aCheckFlag === 1){
              let realAdd = true;
              _.map(this.gSelectedData, (item, index3) => {
                if (item.id === eachId.id) realAdd = false;
              })
              if (realAdd === true) this.gSelectedData.push(eachData);
            }
            else{
              let tempSelData = removeFromArray(this.gSelectedData, 'id', eachData.id);
              this.gSelectedData = tempSelData;
            }
          }
        })
      }
    })
  }
  
  handleClickOutside(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  handleChangeSelData = (aSelectIdArray, aCheckFlag) => {
    this.processGetSelectedData(this.props.pAllData, aSelectIdArray, aCheckFlag);
    this.treeView.handleRenderTreeDataList(this.gSelectedData);
    this.selItems.handleLoading(this.gSelectedData);
  }

  handleDelEachItem = (aText, aId) => {
    let tempSelData = removeFromArray(this.gSelectedData, 'id', aId);
    this.gSelectedData = tempSelData;
    this.treeView.handleRenderTreeDataList(this.gSelectedData);
    this.selItems.handleLoading(this.gSelectedData);
  }

  handleYesButtonClick = () => {
    this.props.pHandleChangeShow(true, this.gSelectedData);
  }

  handleNoButtonClick = () => {
    this.props.pHandleChangeShow(false, this.gOldSelData);
  }

  render() {
    const { pAllData, pSelData, pArrangeHorizontal, pKinds } = this.props;
    this.gSelectedData = pSelData;
    this.processSetGSelData(pSelData);
    return (
      <div className="multiCheck-modal">
        <div className="multiCheck-modal-all">
          <div className="multiCheck-modal-content">
            <SelectedItems
              onRef={(ref) => {this.selItems = ref}}
              itemDatas = {this.gSelectedData}
              pHandleCloseItem = {this.handleDelEachItem}
            />
            <TreeView
              onRef={(ref) => {this.treeView = ref}}
              pAllData = {pAllData}
              pSelData = {this.gSelectedData}
              pKinds = {pKinds}
              pArrangeHorizontal = {pArrangeHorizontal}
              pHandleChangeSelData = {this.handleChangeSelData}
            />
            <div className="multiCheck-buttons">
              <Button className="multiCheck-button button-yes" onClick={this.handleYesButtonClick}>{LANG('BASIC_ALERTMSG_YES')}</Button>
              <Button className="multiCheck-button button-no" onClick={this.handleNoButtonClick}>{LANG('BASIC_ALERTMSG_NO')}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SelectPanel.propTypes = {
  pAllData: PropTypes.array,
  pSelData: PropTypes.array,
  pKinds: PropTypes.array,
  pArrangeHorizontal: PropTypes.bool,
  pHandleChangeShow: PropTypes.func,
};

SelectPanel.defaultProps = {
  pHandleChangeShow: () => {},
}

export default onClickOutside(SelectPanel);