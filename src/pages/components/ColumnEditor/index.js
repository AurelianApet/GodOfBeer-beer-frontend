import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import LANG from '../../../language';

class ColumnEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sTotalColumns: [],
      sSelectedColumns: [],
    };
  }

  componentDidMount() {
    const { columns, defaultColumns } = this.props;
    this.setState({
      sTotalColumns: columns,
      sSelectedColumns: defaultColumns,
    })
  }

  componentWillMount() {
    document.addEventListener('keydown', this.handleKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }

  handleKeyDown = (e) => {
    if ( e.key === 'Escape' ) {
      this.handleCloseBtn(e);
    }
  }

  handleCloseBtn = (e) => {
    e.stopPropagation();
    const { pHandleClickClose } = this.props;
    pHandleClickClose();
  }

  handleClickYes = (e) => {
    e.stopPropagation();
    const { pHandleClickYes, pHandleClickClose } = this.props;
    const { sSelectedColumns } = this.state;
    pHandleClickYes(sSelectedColumns);
    pHandleClickClose();
  }

  handleClickComponent = (e) => {
    e.stopPropagation();
  }

  handleClickColumnItem = (aItem, aStatus, e) => {
    e.stopPropagation();
    const { sSelectedColumns } = this.state;
    let newSelected = [];
    if (aStatus === null) {
      _.map(sSelectedColumns, (selectedItem, selectedIndex) => {
        if (selectedItem !== aItem) newSelected.push(selectedItem);
      });
    } else {
      newSelected = sSelectedColumns;
      if (aStatus === false) newSelected.push(aItem);
    }
    this.setState({
      sSelectedColumns: newSelected,
    });
  }

  renderTotalColumnList = () => {
    const { sTotalColumns, sSelectedColumns } = this.state;
    let resultHtml = [];
    _.map(sTotalColumns, (columnItem, columnIndex) => {
      let hasSelected = false;
      _.map(sSelectedColumns, (selectedItem, selectedIndex) => {
        if (columnItem.name === selectedItem) hasSelected = true;
      });
      if (!hasSelected) resultHtml.push(this.renderColumnItem(columnItem, hasSelected, columnIndex));
    })
    return resultHtml;
  }

  renderSelectedColumnList = () => {
    const { sTotalColumns, sSelectedColumns } = this.state;
    let resultHtml = [];
    _.map(sSelectedColumns, (selectedItem, selectedIndex) => {
      let tmp = {};
      _.map(sTotalColumns, (columnItem, columnIndex) => {
        if (selectedItem === columnItem.name) tmp = columnItem;
      })
      resultHtml.push(this.renderColumnItem(tmp, null, selectedIndex));
    });
    return resultHtml;
  }

  renderColumnItem = (aItem, aStatus, aIndex) => {
    const key = (aStatus === null)? `selected_${aItem.name}_${aIndex}` : `total_${aItem.name}_${aIndex}`;
    return (
      <div key={key} className={aStatus === null ? "selected-column-item" : "column-item"} onClick={this.handleClickColumnItem.bind(this, aItem.name, aStatus)}>
        <i className="fa fa-list-ul" />
        <span>{aItem.title}</span>
      </div>
    )
  }
  
  render() {
    const { title, className } = this.props;
    return (
      <div className="component-column-editor-background" onClick={this.handleCloseBtn.bind(this)}>
        <div className={cn("component-column-editor", className)} onClick={this.handleClickComponent.bind(this)}>
          <div className="column-editor-header">
            <div>{title}</div>
            <i className="fa fa-check-circle-o yes-btn" onClick={this.handleClickYes.bind(this)} title={LANG('BASIC_SAVE')}/>
            <i className="fa fa-times-circle-o close-btn" onClick={this.handleCloseBtn.bind(this)} title={LANG('BASIC_CLOSE')}/>
          </div>
          <div className="column-editor-content">
            <div className="total-column-list">
              <div>모두</div>
              {this.renderTotalColumnList()}
            </div>
            <div className="selected-column-list">
              <div>선택됨</div>
              {this.renderSelectedColumnList()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ColumnEditor.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  defaultColumns: PropTypes.array,
  columns: PropTypes.array,
  pHandleClickClose: PropTypes.func,
  pHandleClickYes: PropTypes.func,
};

ColumnEditor.defaultProps = {
  title: "렬편집",
  className: "",
  defaultColumns: [],
  columns: [],
  pHandleClickClose: () => {},
  pHandleClickYes: () => {},
};

export default ColumnEditor;
