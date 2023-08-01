import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import _ from 'lodash';
import SelectPanel from './Content/selectPanel';
import SelEachItem from './Result/selEachItem';
import { removeFromArray } from '../../../library/utils/array';

class MultiCheck extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sShowSelectPanel : false,
      sSelectedData : [],
    }
  }

  componentDidMount() {
    this.setState({sSelectedData : this.props.defaultValue});
  }

  componentWillReceiveProps(newProps) {
    if ( !_.isEqual( newProps.defaultValue, this.props.defaultValue ) ) {
      this.setState({sSelectedData : newProps.defaultValue});
    }
  }
  
  handleDelEachItem = (aText, aId) => {
    const { sSelectedData } = this.state;
    const deletedSelData = removeFromArray(sSelectedData, 'id', aId);
    this.props.pHandleChange(deletedSelData);
    this.setState({sSelectedData: deletedSelData});
  }

  handleShowSelPanel = (showFlag, selData) => {
    if (showFlag === true){
      this.props.pHandleChange(selData); 
    }
    this.setState({
      sShowSelectPanel : false,
      sSelectedData: selData,
    });
  }

  handleClickEachItem = (aText, aId) => {
    if (this.props.pHandleSelectedItemDone !== null) {
      const item = {
        text: aText,
        id: aId,
      }
      this.props.pHandleSelectedItemDone(item);
    }
  }

  handleClickEditBtn = (clickItem, e) => {
    const { sSelectedData, sShowSelectPanel } = this.state;
    if ( clickItem === true || sSelectedData.length < 1 ){
      this.setState({ sShowSelectPanel : !sShowSelectPanel});
    }
  }

  renderSelectedItems = () => {
    const { sSelectedData } = this.state;
    return (
      <div className={cn("selected-item", sSelectedData.length > 0 ? "":"clickAble")} onClick = {this.handleClickEditBtn.bind(this, false)}>
        {!!sSelectedData && 
          _.map(sSelectedData, (eachItem, index) => {
            return(
              <SelEachItem 
                key = {`multiCheck-eachItem-${eachItem.id}`}
                pText = {eachItem.text}
                pId = {eachItem.id}
                pHandleCloseItem = {this.handleDelEachItem}
                pHandleClickItem = {this.handleClickEachItem}
              />
            )
          })
        }
        
      </div>
    )
  }
  
  render() {
    const { pArrangeHorizontal, data, pKinds, className, label } = this.props;
    const { sShowSelectPanel, sSelectedData } = this.state;
    return (
      <div className="container-component-multiCheck">
        <div id="component-multiCheck" className="component-multiCheck">
          {!!label && <div id="multiCheck-label" className="multiCheck-label">{label}</div>}
          
          <div className={cn("component-selectedItems", className)}>
            {this.renderSelectedItems()}
            <div className = "multiCheck-editBtn" id = "multiCheck-editBtn" onClick = {this.handleClickEditBtn.bind(this, true)}>
              <i className = "fa fa-edit editBtn" />
            </div>
          </div>
          
          {!!data && sShowSelectPanel &&
            <SelectPanel 
              pAllData = {data}
              pSelData = {sSelectedData}
              pKinds = {pKinds}
              pArrangeHorizontal = {pArrangeHorizontal}
              pHandleChangeShow = {this.handleShowSelPanel}
            />}
        </div>
      </div>
    )
  }
}

MultiCheck.propTypes = {
  data: PropTypes.array.isRequired,
  defaultValue: PropTypes.array,
  pKinds: PropTypes.array,
  className: PropTypes.string,
  pArrangeHorizontal: PropTypes.bool,
  pHandleSelectedItemDone: PropTypes.func,
  pHandleChange: PropTypes.func,
};

MultiCheck.defaultProps = {
  data: [],
  defaultValue: [],
  pKinds: [],
  pArrangeHorizontal: true,
  pHandleSelectedItemDone: null,
  pHandleChange: () => {},
};

export default MultiCheck;