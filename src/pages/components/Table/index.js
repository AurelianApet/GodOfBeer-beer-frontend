import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import moment from 'moment';
import $ from 'jquery';

import {
  FilteringState,
  RowDetailState,
  EditingState,
  SelectionState,
  IntegratedSelection,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableFilterRow,
  TableRowDetail,
  TableEditRow, 
  TableEditColumn,
  TableSelection,
  TableColumnVisibility,
} from '@devexpress/dx-react-grid-bootstrap3';
import {
  EditCell, CommandComponents, CONTROL_AUTO_FOCUS_ID
} from './Edit';
import StringFilterHeaderCell from './Filter/StringFilterHeaderCell';

import Loading from '../Loading';
import LANG from '../../../language';
import PaginationPanel from '../PaginationPanel';
import { findFromArray, removeFromArray } from '../../../library/utils/array';
import { pushNotification, NOTIFICATION_TYPE_ERROR } from '../../../library/utils/notification';
import SingleMessage from '../SingleMessage';
import { getFormattedStringFromDate, validateDate } from '../../../library/utils/dateTime';
import HtmlContainer from '../HtmlContainer';
import { ROW_SELECTION_NONE, ROW_SELECTION_SINGLE, ROW_SELECTION_MULTI } from './APITable';

export const ALIGN_LEFT = 'left';
export const ALIGN_CENTER = 'center';
export const ALIGN_RIGHT = 'right';

export const CELL_TYPE_NO = 0;
export const CELL_TYPE_STRING = 1;
export const CELL_TYPE_INTEGER = 2;
export const CELL_TYPE_FLOAT = 3;
export const CELL_TYPE_DATE = 4;
export const CELL_TYPE_TIME = 5;
export const CELL_TYPE_DATETIME = 6;
export const CELL_TYPE_MULTILINE = 7;
export const CELL_TYPE_HTML = 8;
export const CELL_TYPE_SELECT = 9;
export const CELL_TYPE_CHECKBOX = 10;
export const CELL_TYPE_BUTTONS = 11;
export const CELL_TYPE_USER = 12;
export const CELL_TYPE_OBJECT = 13;
export const CELL_TYPE_OPTION = 14;
export const CELL_TYPE_EDITBUTTON = 15;
export const CELL_TYPE_DELETEBTUTTON = 16;

const ROW_DOUBLECLICK_DURATION = 400;

// global variable for editable
global.currentChanges = {};
global.autoFocusId = 0;

// global variable for storing created table id
global.tableCreated = [];
export const getCurrentTableID = () => {
  if (global.tableCreated.length === 0) {
    return 'unknown';
  }
  return global.tableCreated[global.tableCreated.length - 1]; // get last table
}

// global variable for storing table query info
global.savedQuery = {};
const saveQuery = (aQuery, aTableID) => {
  global.savedQuery[aTableID] = {
    countPerPage: aQuery.countPerPage,
    currentPageNumber: aQuery.currentPageNumber,
    filterValues: {...aQuery.filterValues},
    sorting: {
      columnName: aQuery.sorting.columnName,
      direction: aQuery.sorting.direction,
    },
  }
}

export const clearTableQuery = (aTableID) => {
  if(global.savedQuery[aTableID]) {
    delete global.savedQuery[aTableID];
  }
}

// to retrieve current displayed table rows
global.currentRows = {};
const setCurrentRows = (aRows) => {
  global.currentRows[getCurrentTableID()] = aRows;
}
export const getCurrentRows = () => {
  return global.currentRows[getCurrentTableID()];
}

class DataTable extends Component {
  constructor(props) {
    super(props);
        
    const initValues = this.initialize(props, true);

    // editing utilities
    this.currentEditingType = null;
    global.currentChanges[props.pID] = {};    

    this.state = {
      // query to sort&filter table data
      sQuery: { 
        currentPageNumber: initValues.currentPageNumber,
        countPerPage: initValues.countPerPage,
        sorting: initValues.sorting,
        filterValues: initValues.filterValues,
      },

      // Table operation
      sTableColumnExtensions: initValues.tableColumnExtensions,
      sExpandedRows: {},
      sSelectedRows: undefined,
      
      // editing
      sEditingRowIds: [],

      // filtering
      sFilterRowVisible: initValues.filterRowVisible,
      
      // single message on usercell
      sIsSingleMessageVisible: false,
      sSingleMessagePosition: {left: 0, top: 0},
      sSingleMessageDirection: 'bl',
      sClickedUser: null,
    };
  }

  componentDidMount() {
    if (this.props.onRef) {
			this.props.onRef(this);
    }
  }

  componentWillReceiveProps(newProps) {
    // restore settings
    const initValues = this.initialize(newProps);
    this.setState({
      // query to sort&filter table data
      sQuery: { 
        currentPageNumber: initValues.currentPageNumber,
        countPerPage: initValues.countPerPage,
        sorting: initValues.sorting,
        filterValues: initValues.filterValues,
      },      
    });
    if (initValues.filterRowVisible) {
      // filtering
      this.setState({
        sFilterRowVisible: initValues.filterRowVisible,
      })
    }
    if (!_.isEqual(newProps.pColumns, this.props.pColumns)) { // pColumn changed
      this.setState({  
        // Table operation
        sTableColumnExtensions: initValues.tableColumnExtensions,
        sExpandedRows: {},
        sSelectedRows: undefined,     
        
        // editing
        sEditingRowIds: [],
      });
    } else {
      const { sQuery } = this.state;
      const startIndex = (sQuery.currentPageNumber - 1) * sQuery.countPerPage;
      if (startIndex >= newProps.pData.length && newProps.pData.length > 0 ) {
        // reset current page number if it's out of range
        this.setState({
          sQuery: {
            ...this.state.sQuery,
            currentPageNumber: 1,
          }
        });
      }
      if (this.firstTime && newProps.pIsGoToEnd && this.props.pData.length === 0 && newProps.pData.length > 0) {
        // calculate current page number according to pIsGoToEnd
        this.firstTime = false;
        let currentPageNumber = Math.ceil(newProps.pData.length / sQuery.countPerPage);
        this.setState({
          sQuery: {
            ...this.state.sQuery,
            currentPageNumber: currentPageNumber,
          }
        });
      }
      if (newProps.pData.length !== this.props.pData.length){
        // original data changed
        this.setState({
          sSelectedRows: undefined,
          sEditingRowIds: [],
        })
      }
    }
  }

  componentWillMount() {
    global.tableCreated.push(this.props.pID);
    if (global.tableCreated.length === 1) {      
      document.addEventListener('keyup', this.handleKeyUp, false);
    }
  }

  componentWillUnmount() {
    if (this.props.onRef) {
			this.props.onRef(undefined);
    }
    global.tableCreated = removeFromArray(global.tableCreated, null, this.props.pID);
    if (global.tableCreated.length === 0) {
      document.removeEventListener('keyup', this.handleKeyUp, false);
    }
  }

  // ===== Keyboard event handler =====
  handleKeyUp(e) {
    const currentTableID = getCurrentTableID();
    if ( e.ctrlKey && e.key === 'Enter' ) {
      $(`#${currentTableID} #table_commit_button`).trigger('click');
    }
    if ( e.ctrlKey && e.altKey && e.code === 'KeyN' ) {
      $(`#${currentTableID} #table_add_button`).trigger('click');
    }
    if (e.key === 'Escape') {
      $(`#${currentTableID} #table_cancel_button`).trigger('click');
    }
  }

  // ===== Initialize Utility =====
  initialize = (props) => {
    const { pDefaultSort, pDefaultCountPerPage, pColumns } = props;

    // analyze column info
    let filterValues = {};
    const tableColumnExtensions = [];
    _.map(pColumns, (column) => {
      filterValues[column.name] = '';
      tableColumnExtensions.push({
        columnName: column.name,
        width: column.width,
        align: column.alignContent || 'center',
      })
    });

    // calculate current page number according to pIsGoToEnd
    let currentPageNumber = 1;
    this.firstTime = true;
    if (props.pIsGoToEnd) {
      if (props.pData && props.pData.length > 0) {
        currentPageNumber = Math.ceil(props.pData.length / pDefaultCountPerPage);
      }
    }

    // restore previous query info if it's being initialized.
    let countPerPage = pDefaultCountPerPage;
    let sorting = pDefaultSort;
    let filterRowVisible = false;
    if (global.savedQuery[props.pID]) {
      countPerPage = global.savedQuery[props.pID].countPerPage || pDefaultCountPerPage;
      currentPageNumber = global.savedQuery[props.pID].currentPageNumber || 1;
      sorting = global.savedQuery[props.pID].sorting || pDefaultSort;
      filterValues = global.savedQuery[props.pID].filterValues || filterValues;
      let hasFilter = false;
      _.map(filterValues, (item, key) => {
        if(item) {
          hasFilter = true;
        }
      })
      filterRowVisible = hasFilter;
    }

    return {
      tableColumnExtensions,
      filterValues,
      currentPageNumber,
      countPerPage,
      sorting,
      filterRowVisible,
    };
  }

  // ===== Pagination Utilities =====
  handleCountPerPageChange = (e) => {
    const countPerPage = parseInt(e.target.value, 10);
    this.setState({ sSelectedRows: [] });
    this.setState({
      sQuery: {
        ...this.state.sQuery,
        currentPageNumber: 1,
        countPerPage: countPerPage,
      }
    }, () => {saveQuery(this.state.sQuery, this.props.pID)});
  }
  handleCurrentPageNumberChange = (aPageNumber) => {
    this.setState({
      sQuery: {
        ...this.state.sQuery,
        currentPageNumber: aPageNumber,
      }
    }, () => {saveQuery(this.state.sQuery, this.props.pID)});    
    this.setState({ sSelectedRows: [] });
  }

  // ===== Detail / Expand Utilities =====
  getExpandedRowIndices = (rows, expandedInfo) => {
    const { pKey } = this.props;
    const expanded = [];
    _.map(rows, (row, index) => {
      const id = row[pKey];
      if(expandedInfo[id]) {
        expanded.push(index);
      }
    })
    return expanded;
  }
  handleDetailRowChange = (row, expanded, e) => {
    e.stopPropagation();
    const { pKey, pHandleDetailRowExpanded } = this.props;
    const id = row[pKey];
    this.setState({
      sExpandedRows: {
        [id]: !expanded,
      }
    });
    if (pHandleDetailRowExpanded) {
      pHandleDetailRowExpanded(row, !expanded) // dispatch event 
    }
  }
  renderDetailRow = ({ row }) => {
    const rows = getCurrentRows();
    let foundIndex = null;
    const { pKey } = this.props;
    _.map(rows, (rowItem, index) => {
      if (rowItem[pKey] === row[pKey]){
        foundIndex = index;
      }
    })
    return this.props.pRenderDetailRow ? this.props.pRenderDetailRow(row, foundIndex) : null;
  }
  renderDetailToggle = ({ row, ...restProps }) => {
    const expanded = restProps.expanded;
    return (
      <TableRowDetail.Cell
        row={row}
        {...restProps}
        expanded={expanded.toString()}
        onClick={this.handleDetailRowChange.bind(this, row, restProps.expanded)}
      >
        <i
          className={expanded ? "fa fa-minus-square-o" : "fa fa-plus-square-o"}
        />
      </TableRowDetail.Cell>
    );
  };

  // ===== MultiCheck Utilities =====
  getDefaultSelectedRowIndices = (rows) => {
    const { pDefaultSelectedRows } = this.props;
    const { pKey } = this.props;
    const selected = [];
    _.map(rows, (row, index) => {
      const id = row[pKey];
      if(pDefaultSelectedRows.indexOf(id) >= 0) {
        selected.push(index);
      }
    })
    return selected;
  }
  handleSelectionChange = (rows, selectedIndices) => {
    this.setState({ sSelectedRows: selectedIndices });
    const { pHandleSelectionChange } = this.props;
    if (pHandleSelectionChange) {
      pHandleSelectionChange(rows, selectedIndices);
    }
  }

  // ===== Custom Row/Cell Render =====
  handleUserCellClick = (cellId, rowId, cellUser, e) => {
    e.stopPropagation();
    const extraHeight = 385; // tableOffset + height of singleMessage
    let position = {left: 0, top: 0};
    let direction = 'bl';
    if($('#' + cellId).offset()) {
      position.left = $('#' + cellId).offset().left;
      position.top = $('#' + cellId).offset().top;
    }
    if (position.top > extraHeight ) direction = 'tl';
    else direction = 'bl';
    this.setState({
      sIsSingleMessageVisible: true,
      sSingleMessagePosition: position,
      sClickedUser: cellUser,
      sSingleMessageDirection: direction,
    });
  }
  handleSingleMessageClose = (evt) => {
    this.setState({
      sIsSingleMessageVisible: false,
    }, () => {
      if (evt && evt.target && evt.target.id) {
        const id = evt.target.id;
        if (id.toString().indexOf('table_cell_user_') >= 0) { // if it's user cell
          $(`#${id}`).trigger('click');
        }
      }
    })
  }
  handleSingleRowClick = (rowIndex, currentRows) => {
    const currentClickedTime = new Date().getTime();
    this.setState({ sSelectedRows: [rowIndex] }, () => {      
      const { pHandleSelectionChange } = this.props;
      if (pHandleSelectionChange) {
        pHandleSelectionChange(currentRows, [rowIndex]);
      }
      if (this.rowClickedTime && this.rowClickedIndex === rowIndex && this.rowClickedTime - currentClickedTime < ROW_DOUBLECLICK_DURATION) {
        // double click
        if (this.props.pHandleRowDoubleClick) {
          this.props.pHandleRowDoubleClick();
        }
        this.rowClickedTime = null;
        this.rowClickedIndex = null;
      } else {
        this.rowClickedTime = currentClickedTime;
        this.rowClickedIndex = rowIndex;
      }
    });
  }
  renderRow = (hasSelection, aExpandedRows, currentRows, props) => {
    const { pHandleRowClick, pHandleRowDoubleClick, pUnreadRows, pCustomRowClass, pKey, pHighlightMyRow, pSelectionType, pSelectionClassName } = this.props;
    const row = props.tableRow.row;
    const rowIndex = props.tableRow.rowId;
    const id = row[pKey];

    // ----- add additional classes -----
    // expanded row
    let rowClass = 'tbody-tr-row';
    if (aExpandedRows[id]) {
      rowClass += ' row-expanded';
    }
    // unread row
    _.map(pUnreadRows, (unreadId) => {
      if(unreadId === id) {
        rowClass += ' row-unread';
      }
    })
    // custom row class
    _.map(pCustomRowClass, (item) => {
      if(item.column && item.value && item.class){
        if(_.get(row, item.column) === item.value) {
          rowClass += ' ' + item.class;
        }
      }
    })
    // selected row
    if (pSelectionType === ROW_SELECTION_SINGLE) {
      const { sSelectedRows } = this.state;
      if (sSelectedRows && sSelectedRows.length > 0 && sSelectedRows[0] === rowIndex) {
        rowClass += ' ' + pSelectionClassName;
      }
    }
    if (pSelectionType === ROW_SELECTION_MULTI) {
      const { sSelectedRows } = this.state;
      if (sSelectedRows && sSelectedRows.length > 0) {
        if ( sSelectedRows.indexOf(rowIndex) >= 0) {
          rowClass += ' ' + pSelectionClassName;
        }
      }
    }
    // highlight rows that I've created
    if (pHighlightMyRow && this.props.pCurrentUser) {
      if (this.props.pCurrentUser._id === _.get(row, pHighlightMyRow.columnName)) {
        rowClass += ' ' + pHighlightMyRow.className;
      }
    }
    
    if (hasSelection) {
      if (pHandleRowClick && pHandleRowDoubleClick) {
        return <TableSelection.Row {...props} className={rowClass} onClick={pHandleRowClick.bind(this, row)} onDoubleClick={pHandleRowDoubleClick.bind(this, row)}/>
      } else if (pHandleRowClick) {
        return <TableSelection.Row {...props} className={rowClass} onClick={pHandleRowClick.bind(this, row)}/>
      } else if (pHandleRowDoubleClick) {
        return <TableSelection.Row {...props} className={rowClass} onDoubleClick={pHandleRowDoubleClick.bind(this, row)}/>
      } else {
        return <TableSelection.Row {...props} className={rowClass}/>
      }
    } else {
      if (pSelectionType === ROW_SELECTION_SINGLE) {
        return <Table.Row {...props} className={rowClass} onClick={this.handleSingleRowClick.bind(this, rowIndex, currentRows)}/>
      } else if (pSelectionType === ROW_SELECTION_MULTI) {
        return <Table.Row {...props} className={rowClass}/>
      } else {
        if (pHandleRowClick && pHandleRowDoubleClick) {
          return <Table.Row {...props} className={rowClass} onClick={pHandleRowClick.bind(this, row)} onDoubleClick={pHandleRowDoubleClick.bind(this, row)}/>
        } else if (pHandleRowClick) {
          return <Table.Row {...props} className={rowClass} onClick={pHandleRowClick.bind(this, row)}/>
        } else if (pHandleRowDoubleClick) {
          return <Table.Row {...props} className={rowClass} onDoubleClick={pHandleRowDoubleClick.bind(this, row)}/>
        } else {
          return <Table.Row {...props} className={rowClass}/>
        }
      }
    }
  }
  renderCell = (startIndex, props) => {
    const { row, column, tableRow } = props;
    let cellValue = _.get(row, column.name);
    let content = null;
    let className = column.className;
    if (column.customRender) {
      if (column.openSlideShow && this.props.pHandleSlideShowOpen) {
        className += " cell-has-open-slideshow";
        content = (<Table.Cell {...props} className={className}
          onClick={this.props.pHandleSlideShowOpen.bind(this, row)}
          title={LANG('BASIC_DETAIL_VIEW')}
        >
          {column.customRender(row, column, tableRow.rowId)}
        </Table.Cell>);
      } else {
        content = (<Table.Cell {...props} className={className}>
          {column.customRender(row, column, tableRow.rowId)}
        </Table.Cell>);
      }
    } else {
      switch (column.type) {
        case CELL_TYPE_NO:
          cellValue = tableRow.rowId + 1 + startIndex;
          content = <Table.Cell {...props} className={column.className} value={cellValue}/>;
          break;
        case CELL_TYPE_USER:
          const cell_javascript_id = `table_cell_user_${tableRow.rowId}`;
          content = (<Table.Cell
              {...props}
              className={column.className}
              style={{overflow: 'unset'}}
              onClick={(e) => {e.stopPropagation()}}
            >
              <div className="cell-type-user">
                <div
                  id={cell_javascript_id}
                  className="user-name"
                  onClick={this.handleUserCellClick.bind(this, cell_javascript_id, tableRow.rowId, cellValue)}
                >
                  {cellValue.realName}
                </div>
                <div className="send-message-tooltip">
                  {LANG('BASIC_SEND_MESSAGE')}
                </div>
              </div>
            </Table.Cell>);
          break;
        case CELL_TYPE_DATE:          
          content = <Table.Cell {...props} className={column.className} value={getFormattedStringFromDate(cellValue, 'YYYY-MM-DD')}/>;
          break;
        case CELL_TYPE_DATETIME:
          content = <Table.Cell {...props} className={column.className} value={getFormattedStringFromDate(cellValue, 'YYYY-MM-DD HH:mm:ss')}/>;
          break;
        case CELL_TYPE_TIME:
          content = <Table.Cell {...props} className={column.className} value={getFormattedStringFromDate(cellValue, 'HH:mm:ss')}/>;
          break;
        case CELL_TYPE_EDITBUTTON:
          const editCallback = column.callback;
          const editButton = editCallback ? (
            <i
              className="fa fa-pencil-square-o cell-type-editbutton"
              title={LANG('BASIC_EDIT')}
              onClick={editCallback.bind(this, row)}
            />
          ) : (
            <i
              className="fa fa-pencil-square-o cell-type-editbutton"
              title={LANG('BASIC_EDIT')}
            />
          )
          content = <Table.Cell {...props} className={column.className} value={editButton}/>;
          break;
        case CELL_TYPE_DELETEBTUTTON:
          const deleteCallback = column.callback;
          const deleteButton = deleteCallback ? (
            <i
              className="fa fa fa-trash-o cell-type-deletebutton"
              title={LANG('BASIC_DELETE')}
              onClick={deleteCallback.bind(this, row)}
            />
          ) : (
            <i
              className="fa fa fa-trash-o cell-type-deletebutton"
              title={LANG('BASIC_DELETE')}
            />
          );
          content = <Table.Cell {...props} className={column.className} value={deleteButton}/>;
          break;
        default:
          let cellContent = cellValue;
          if (column.type === CELL_TYPE_HTML || column.type === CELL_TYPE_STRING || column.type === CELL_TYPE_OPTION) {
            cellContent = (
              <HtmlContainer
                pData={cellValue ? cellValue.toString() : ''}
                pIsHtml={false}
              />
            );
          }
          if (column.type === CELL_TYPE_MULTILINE) {
            cellContent = (
              <HtmlContainer
                pData={cellValue ? cellValue.toString() : ''}
                pIsHtml={false}
                pKeepPreTag={true}
              />
            );
          }
          if (column.operationButtons && this.props.pCurrentUser._id === _.get(row, column.operationButtons.condition)) {
            const editCallback = column.operationButtons.editCallback;
            const deleteCallback = column.operationButtons.deleteCallback;
            cellContent = (
              <div className="cell-has-operation-buttons">
                <div className="cell-original">
                  {cellContent}
                </div>
                <div className="cell-operation-buttons">
                  {editCallback &&
                    <i
                      title={LANG('BASIC_EDIT')}
                      className="fa fa-pencil-square-o cell-edit"
                      onClick={editCallback.bind(this, row)}
                    />
                  }
                  {deleteCallback &&
                    <i
                      title={LANG('BASIC_DELETE')}
                      className="fa fa-trash-o cell-delete"
                      onClick={deleteCallback.bind(this, row)}
                    />
                  }
                </div>
              </div>
            );
          }
          if (column.openSlideShow && this.props.pHandleSlideShowOpen) {
            className += " cell-has-open-slideshow";
            content = <Table.Cell {...props} className={className} value={cellContent}
              onClick={this.props.pHandleSlideShowOpen.bind(this, row)}
              title={LANG('BASIC_DETAIL_VIEW')}
            />;
          } else {
            content = <Table.Cell {...props} className={className} value={cellContent}/>;
          }
          break;
      }
    }
    return content;
  }

  // ===== Sorting & Filtering Utilities =====
  getColumnIndex = (columnName) => {
    let index = -1;
    const { pColumns } = this.props;
    for (let i = 0; i < pColumns.length; i++) {
      if (pColumns[i].name === columnName) {
        index = i;
        break;
      }
    }
    return index;
  }
  handleSort = (columnName, e) => {
    e.stopPropagation();
    const { sQuery: { sorting }, sQuery } = this.state;
    let newSorting = {...sorting};
    if (sorting.columnName === columnName) {
      newSorting = {
        columnName,
        direction: sorting.direction === 'asc' ? 'desc' : 'asc'
      };
    } else {
      newSorting = {
        columnName,
        direction: 'asc'
      };
    }
    this.setState({
      sQuery: {
        ...sQuery,
        sorting: newSorting,
      }
    }, () => {saveQuery(this.state.sQuery, this.props.pID)});    
    this.setState({ sSelectedRows: [] });
  }
  handleHeaderRowClick = () => {
    if (!this.props.pHasFiltering)
      return;
    this.setState({sFilterRowVisible: !this.state.sFilterRowVisible}, () => {saveQuery(this.state.sQuery, this.props.pID)});
  }
  handleSetFilter = (columnName, filterData) => {
    const { sQuery: { filterValues, currentPageNumber, countPerPage }, sQuery } = this.state;
    const queries = _.extend({}, sQuery);
    filterValues[columnName] = filterData.data;

    // reset pagination info according to filtered result;
    const { pData, pColumns } = this.props;
    const filteredRows = this.processFilter(pData, pColumns, filterValues);
    let pageNumber = currentPageNumber;
    if ((currentPageNumber - 1) * countPerPage >= filteredRows.length) {
      pageNumber = 1;
    }

    this.setState({ 
      sQuery: {
        ...queries,
        filterValues: filterValues,
        currentPageNumber: pageNumber,
      }
    }, () => {saveQuery(this.state.sQuery, this.props.pID)});    
    this.setState({ sSelectedRows: [] });
  }

  // ===== Query Utilities =====
  processFilter = (aRows, aColumns, aFilter) => {
    let filtered = _.filter(aRows, (row) => {
      if(!row)
        return false;
      let found = 0, hasFilter = 0;
      _.map(aFilter, (filterValue, columnName) => {
        if(filterValue && filterValue.trim() !== '') {
          let index = this.getColumnIndex(columnName);
          if (index >= 0) {
            hasFilter++;
            let pattern = null;
            switch(aColumns[index].type) {
              case CELL_TYPE_STRING:
              case CELL_TYPE_MULTILINE:
              case CELL_TYPE_INTEGER:
              case CELL_TYPE_FLOAT:
                pattern = new RegExp(filterValue.toString().toLowerCase());
                if(pattern.test((_.get(row, columnName) || '').toString().toLowerCase())) {
                  found++;
                }
                break;
              case CELL_TYPE_DATE:
                pattern = new RegExp(filterValue.toString().toLowerCase());
                if(pattern.test((_.get(row, columnName) || '').toString().toLowerCase())) {
                  found++;
                }
                break;
              case CELL_TYPE_USER:
                pattern = new RegExp(filterValue.toString().toLowerCase());
                if(pattern.test((_.get(row, columnName + '.realName') || '').toString().toLowerCase())) {
                  found++;
                }
                break;
              case CELL_TYPE_HTML:
                const htmlContent = window.htmlToText(_.get(row, columnName) || '');
                pattern = new RegExp(filterValue.toString().toLowerCase());
                if(pattern.test(htmlContent.toString().toLowerCase())) {
                  found++;
                }
                break;
              default:
                break;
            }
          }
        }
      });
      if (found === 0 && !hasFilter) {
        return true;
      }
      return found === hasFilter;
    });
    return filtered;
  }
  processSort = (aRows, aColumns, aSort) => {
    let foundColumn = null;
    for(let i = 0; i<aColumns.length; i++){
      if(aColumns[i].name === aSort.columnName){
        foundColumn = aColumns[i];
      }
    }
    if (!foundColumn) 
      return aRows;
    if (!foundColumn.type) // Type is not defined or string
      return _.orderBy(aRows, row => {return !_.get(row, aSort.columnName) ? '' : _.get(row, aSort.columnName).toString()}, aSort.direction);
    else {
      switch(foundColumn.type) {
        case CELL_TYPE_STRING:
          return _.orderBy(aRows, row => {return !_.get(row, aSort.columnName) ? '' : _.get(row, aSort.columnName).toString()}, aSort.direction);
        case CELL_TYPE_INTEGER:
          return _.orderBy(aRows, row => parseInt(_.get(row, aSort.columnName), 10), aSort.direction);
        case CELL_TYPE_FLOAT:
          return _.orderBy(aRows, row => parseFloat(_.get(row, aSort.columnName)), aSort.direction);
        case CELL_TYPE_SELECT:
          return _.orderBy(aRows, row => _.get(row, aSort.columnName), aSort.direction);
        case CELL_TYPE_DATE:
          return _.orderBy(aRows, row => _.get(row, aSort.columnName), aSort.direction);
        case CELL_TYPE_DATETIME:
          return _.orderBy(aRows, row => _.get(row, aSort.columnName), aSort.direction);
        case CELL_TYPE_USER:
          return _.orderBy(aRows, row => _.get(row, aSort.columnName + '.realName'), aSort.direction);
        case CELL_TYPE_OBJECT:
          return _.orderBy(aRows, row => _.get(row, aSort.columnName), aSort.direction);
        default:
          return aRows;
      }
    }
  }
  processPagination = (aRows, aCountPerPage, aCurrentPageNumber) => {
    const { pHasPagination } = this.props;
    if (!pHasPagination) {
      return aRows;
    }
    const locStart = (aCurrentPageNumber - 1) * aCountPerPage;
    const locEnd = aCurrentPageNumber * aCountPerPage > aRows.length ? aRows.length : aCurrentPageNumber * aCountPerPage;
    let locRows = [];
    if (locStart < aRows.length) {
      for (let i=locStart; i<locEnd; i++){
        locRows.push(aRows[i]);
      }
    }
    return locRows;
  }

  // ===== Editing Utilities =====
  resetEditingInfo = (type) => {
    this.currentEditingType = type;
    global.currentChanges[this.props.pID] = {};
    global.autoFocusId = 0;
    if (type === 'add') {
      const { pColumns } = this.props;
      _.map(pColumns, (column, index) => {
        if (column && column.isEditable)
        {
          switch(column.type) {
            case CELL_TYPE_STRING:
            case CELL_TYPE_HTML:
            case CELL_TYPE_INTEGER:
            case CELL_TYPE_FLOAT:
            case CELL_TYPE_SELECT:
              global.currentChanges[this.props.pID][column.name] = '';
              break;
            case CELL_TYPE_DATE:
              global.currentChanges[this.props.pID][column.name] = moment(new Date()).format('YYYY-MM-DD');
              break;
            case CELL_TYPE_DATETIME:
              global.currentChanges[this.props.pID][column.name] = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
              break;
            case CELL_TYPE_TIME:
              global.currentChanges[this.props.pID][column.name] = '00:00:00';
              break;
            case CELL_TYPE_OPTION:
              global.currentChanges[this.props.pID][column.name] = '';
              break;
            default:
              break;
          }
        }
      })
    }
  }
  handleEditingRowIdsChange = (editingRowIds) => {
    this.setState({ sEditingRowIds: editingRowIds });
  }
  handleCommandClick = (type, onExecute) => {
    switch (type) {
      case 'add':
      case 'edit':
        if (this.currentEditingType === null) { // prevent multi adding / editting
          this.resetEditingInfo(type);
          onExecute();
          setTimeout(() => {
            $('#' + CONTROL_AUTO_FOCUS_ID + '1').focus();
          }, 100);
        }
        break;
      case 'delete':
        if (this.currentEditingType === null) { // prevent multi adding / editting
          this.resetEditingInfo(null);
          onExecute();
        } else if (this.currentEditingType === 'add' || this.currentEditingType === 'edit') {
        }
        break;
      case 'cancel':
        this.resetEditingInfo(null);
        onExecute();
        break;
      case 'commit':
        const { pColumns } = this.props;
        let isValid = true, errorMessage = '';
        _.map(global.currentChanges[this.props.pID], (value, columnName) => {
          const column = findFromArray(pColumns, 'name', columnName);
          if (column) {
            let errorMsg = null;
            if (column.checkValidation && column.checkValidation(value)) {
              errorMsg = column.checkValidation(value);              
            }
            if (column.type === CELL_TYPE_DATE && validateDate(value)) {
              errorMsg = validateDate(value);
            }
            if (errorMsg !== null) {
              if (errorMessage)
                errorMessage += ', ';
              errorMessage += errorMsg;
              isValid = false;
            }
          }
        })
        if (isValid) {
          onExecute();
          this.currentEditingType = null;
        } else {
          pushNotification(NOTIFICATION_TYPE_ERROR, LANG('LIBRARY_NOTIFICATION_ERROR_DEFAULT') + errorMessage);
        }
        break;
      default:
        break;
    }
  }
  handleCommitChanges = (rows, totalRows, { added, changed, deleted }) => {
    const { pHandleEditComplete } = this.props;
    const { sEditingRowIds } = this.state;
    const isChanged = !_.isEmpty(global.currentChanges[this.props.pID]);
    const rowChanges = isChanged ? global.currentChanges[this.props.pID] : undefined;
    
    switch (this.currentEditingType) {
      case 'add':
        if (isChanged) {
          pHandleEditComplete( rows, {0: rowChanges}, undefined, undefined, totalRows );
        }
        break;
      case 'edit':
        if (isChanged) {
          const editted = {};
          const rowIndex = (sEditingRowIds.length > 0) ? sEditingRowIds[0] : 0;
          editted[rowIndex] = rowChanges;
          pHandleEditComplete( rows, undefined, editted, undefined, totalRows );
        }
        break;
      default:
        pHandleEditComplete( rows, added, changed, deleted, totalRows );
        break;
    }
  };

  renderEditCommandCell = ({ id, onExecute }) => {
    const CommandButton = CommandComponents[id];
    return (
      <div className="table-command-button-container">
        <CommandButton
          onExecute={this.handleCommandClick.bind(this, id, onExecute)}
        />
      </div>
    );
  };

  render() {
    const { pData, pColumns, pHiddenColumnNames, pIsLoading, pDefaultPanelSize, pClassName } = this.props;
    const { pHasPagination, pHasMultiCheckbox, pHasHeaderRow, pHasFiltering, pHasSorting, pHasDetailRows, pIsEditable, pHasAdding, pHasDeleting } = this.props;
    const { sQuery: { filterValues, sorting, countPerPage, currentPageNumber }, sTableColumnExtensions, sExpandedRows, sSelectedRows, sQuery } = this.state;
    const { sEditingRowIds, sFilterRowVisible, sIsSingleMessageVisible, sSingleMessagePosition, sClickedUser, sSingleMessageDirection } = this.state;

    let locHeightOffset = 0;
    if(pHasPagination) {
      locHeightOffset += 30;
    }
    
    const filteredRows = this.processFilter(pData, pColumns, filterValues);
    const sortedRows = this.processSort(filteredRows, pColumns, sorting);
    const currentRows = this.processPagination(sortedRows, countPerPage, currentPageNumber);

    const expandedRows = this.getExpandedRowIndices(currentRows, sExpandedRows);
    const defaultSelectedRows = this.getDefaultSelectedRowIndices(currentRows);

    setCurrentRows(currentRows);
    const totalCount = filteredRows.length;
    const startIndex = (sQuery.currentPageNumber - 1) * sQuery.countPerPage;

    return (
      <div className={cn("component-table-container", pClassName)}>
        <div id="table-body" className="table-body" style={{height: `calc(100% - ${locHeightOffset}px)`}}>
          { pColumns.length > 0 && <Grid
            rows={currentRows}
            columns={pColumns} 
          >
            {/* ===== Table Body Rows ===== */}
            <Table
              noDataRowComponent={(props) => {
                return (
                  <tr>
                    <td colSpan={props.children.length}>
                      {LANG('COMP_TABLE_EMPTY')}
                    </td>
                  </tr>
                )
              }}
              cellComponent={this.renderCell.bind(this, startIndex)}
              rowComponent={this.renderRow.bind(this, false, sExpandedRows, currentRows)}
              columnExtensions={sTableColumnExtensions}
            />

            <TableColumnVisibility
              hiddenColumnNames={pHiddenColumnNames}
            />

            {/* ===== Table Header Rows ===== */}
            {pHasHeaderRow && 
              <TableHeaderRow
                showSortingControls={false}
                rowComponent={(props) => {
                  return <Table.Row {...props} className={cn('table-row-title', pHasFiltering ? (sFilterRowVisible ? 'filtering-expanded' : 'filtering-collapsed') : '')} onClick={this.handleHeaderRowClick}/>
                }}
                cellComponent={(props) => {
                  const { column } = props;
                  if (column.customHeaderRender) {
                    return (<th style={{textAlign: column.alignHeader || 'center'}}>
                      {column.customHeaderRender(column)}
                    </th>);
                  } else {
                    let content = null;
                    let sortContent = null;
                    if (column.hasSort && pHasSorting) {
                      let sort_icon = 'fa-sort';
                      if (column.name === sQuery.sorting.columnName) {
                        sort_icon += '-' + sQuery.sorting.direction;
                      }
                      sortContent = (<div className="sort-container" title={LANG('COMP_TABLE_SORT')} onClick={this.handleSort.bind(this, column.name)}>
                        <i className={`fa ${sort_icon}`} />
                      </div>);
                    }
                    switch(column.type){
                      case CELL_TYPE_NO:
                        content = column.title;
                        break;
                      default:
                        content = <div>{column.title}</div>;
                        break;
                    }
                    return (<th style={{textAlign: column.alignHeader || 'center'}}>{content}{sortContent}</th>);
                  }                  
                }}
              />
            }
            { pHasFiltering &&
              <FilteringState
              />
            }
            { pHasFiltering && pHasHeaderRow &&
              <TableFilterRow
                rowComponent={(props) => {
                  return <Table.Row {...props} className={cn('table-row-filter', sFilterRowVisible ? 'visible' : 'collapsed')} />
                }}
                cellComponent={({ column }) => {
                  switch(column.type){
                    case CELL_TYPE_STRING:
                    case CELL_TYPE_HTML:
                    case CELL_TYPE_INTEGER:
                    case CELL_TYPE_FLOAT:
                    case CELL_TYPE_USER:
                    case CELL_TYPE_MULTILINE:
                    case CELL_TYPE_DATE:
                    case CELL_TYPE_OBJECT:
                      return <StringFilterHeaderCell columnName={column.name} setFilter={filterData => this.handleSetFilter(column.name, filterData)} value={filterValues[column.name]} />;
                    default:
                      return <th className="header-cell"></th>;
                  }
                }}
              />
            }

            {/* ===== Editable ===== */}
            { pIsEditable && 
              <EditingState
                editingRowIds={sEditingRowIds}
                onEditingRowIdsChange={this.handleEditingRowIdsChange}
                onCommitChanges={this.handleCommitChanges.bind(this, currentRows, pData)}
              />
            }
            { pIsEditable &&
              <TableEditRow
                cellComponent={EditCell.bind(this, startIndex, this.props.pID)}
              />
            }
            { pIsEditable && 
              <TableEditColumn
                width={60}
                showEditCommand
                showDeleteCommand={pHasDeleting}
                showAddCommand={pHasAdding}
                commandComponent={this.renderEditCommandCell}
              />
            }

            {/* ===== Multi Selection ===== */}
            { pHasMultiCheckbox &&
              <SelectionState
                selection={ sSelectedRows || defaultSelectedRows }
                onSelectionChange={this.handleSelectionChange.bind(this, currentRows)}
              />
            }
            { pHasMultiCheckbox &&
              <IntegratedSelection />
            }
            { pHasMultiCheckbox &&
              <TableSelection
                highlightRow={true}
                showSelectAll={true}
                rowComponent={this.renderRow.bind(this, true, sExpandedRows, currentRows)}
                cellComponent={(props) =>{
                  return <TableSelection.Cell {...props}/>;
                }}
              />
            }

            {/* ===== Detail Rows ===== */}
            { pHasDetailRows &&
              <RowDetailState
                expandedRowIds={expandedRows}
              />
            }
            { pHasDetailRows &&
              <TableRowDetail
                rowComponent={(props) => {
                  return <Table.Row {...props} className='table-detail-row'/>
                }}
                contentComponent={this.renderDetailRow}
                toggleCellComponent={this.renderDetailToggle}
              />
            }
          </Grid>
          }
        </div>
        { pHasPagination && filteredRows.length > 0 && pColumns.length > 0 &&
          <PaginationPanel
            pTotalCount={totalCount}
            pCurrentPageNumber={sQuery.currentPageNumber}
            pCountPerPage={sQuery.countPerPage}
            pPanelSize={pDefaultPanelSize}
            pHandleCountPerPageChange={this.handleCountPerPageChange}
            pHandleCurrentPageNumberChange={this.handleCurrentPageNumberChange}
          />
        }
        {sIsSingleMessageVisible && 
          <SingleMessage
            pUser={sClickedUser}
            pOffset={sSingleMessagePosition}
            pDirection={sSingleMessageDirection}
            pHandleMessageClose={this.handleSingleMessageClose}
          />
        }
        { pIsLoading && 
          <div className="loading-wrapper"> 
            <Loading />
          </div>
        }
      </div>
    );
  }
}

DataTable.propTypes = {
  // main props for table data
  pCurrentUser: PropTypes.object, // redux user info
  pID: PropTypes.string, // javascript id of table
  pKey: PropTypes.string, // id of each row, (ex: _id)
  pData: PropTypes.array.isRequired,
  pColumns: PropTypes.array.isRequired,
  pHiddenColumnNames: PropTypes.array, // array of columnNames, (ex: ['createdAt', ...])

  // flag prop for table loading
  pIsLoading: PropTypes.bool,
  pIsGoToEnd: PropTypes.bool,
  
  // feature props
  pHasPagination: PropTypes.bool,
  pHasHeaderRow: PropTypes.bool,
  pHasMultiCheckbox: PropTypes.bool,
  pHasFiltering: PropTypes.bool,
  pHasSorting: PropTypes.bool,
  pHasDetailRows: PropTypes.bool,
  pSelectionType: PropTypes.number, // one of ROW_SELECTION_NONE, ROW_SELECTION_SINGLE, ROW_SELECTION_MULTI
  pSelectionClassName: PropTypes.string,

  // editable props
  pIsEditable: PropTypes.bool,
  pHasAdding: PropTypes.bool,
  pHasDeleting: PropTypes.bool,

  // config props
  pClassName: PropTypes.string,
  pDefaultSort: PropTypes.object,
  pDefaultCountPerPage: PropTypes.number,
  pDefaultPanelSize: PropTypes.number,
  pDefaultSelectedRows: PropTypes.array,

  // slideshow
  pHandleSlideShowOpen: PropTypes.func, // func(row)

  // event handler props
  pHandleSelectionChange: PropTypes.func, // func(rows, selectedIndices)
  pHandleEditComplete: PropTypes.func, // func(rows, added, changed, deleted)
  pHandleDetailRowExpanded: PropTypes.func, // func(row, expanded)

  // custom row props
  pUnreadRows: PropTypes.array, // id of each row, (ex: _id)
  pCustomRowClass: PropTypes.array, // [{column, value, class}]
  pHighlightMyRow: PropTypes.object, // {columnName, className}
  pHandleRowClick: PropTypes.func, // func(row, event)
  pHandleRowDoubleClick: PropTypes.func, // func(row, event)

  // custom renderer props
  pRenderDetailRow: PropTypes.func, // func(row, rowIndex)
  pRenderHeaderRow: PropTypes.func,
  
};

DataTable.defaultProps = {
  // main props for table data
  pID: 'table_unknown',
  pKey: '_id',
  pData: [],
  pColumns: [],
  pHiddenColumnNames: [],

  // flag prop for table loading
  pIsLoading: false,
  pIsGoToEnd: false,

  // feature props
  pHasPagination: true,
  pHasHeaderRow: true,
  pHasMultiCheckbox: false,
  pHasFiltering: false,
  pHasSorting: true,
  pHasDetailRows: false,
  pSelectionType: ROW_SELECTION_NONE,
  pSelectionClassName: '',

  // editable props
  pIsEditable: false,
  pHasAdding: true,
  pHasDefault: true,

  // config props
  pClassName: '',
  pDefaultSort: {
    columnName: null,
    direction: 'asc'
  },
  pDefaultCountPerPage: 10,
  pDefaultPanelSize: 5,
  pDefaultSelectedRows: [], // array of key
  
  // slideshow
  pHandleSlideShowOpen: () => {},

  // event handler props
  pHandleSelectionChange: () => {},
  pHandleEditComplete: () => {}, 
  pHandleDetailRowExpanded: () => {},

  // custom row props
  pUnreadRows: [],
  pCustomRowClass: [],
  pHighlightMyRow: null, 
  pHandleRowClick: () => {},
  pHandleRowDoubleClick: () => {},

  // custom render
  pRenderDetailRow: () => {},
  pRenderHeaderRow: () => {},  
};

/**
 * column attributes
  {
    name: 'XXX', // string
    title: 'XXX', // string
    type: TYPE, // CELL_TYPE_STRING /... 
    icon: 'XXX', // string(ex: 'fa fa-close')
    width: XXX, // integer

    isEditable: false/true, // boolean (default: false)
    checkValidation: function (columnValue, row)

    hasSort: true/false, // boolean (default: true)
    hasFilter: true/false, // boolean (default: true)

    className: 'XXX', // string
    alignHeader: ALIGN_CENTER / ALIGN_LEFT, // (default: ALIGN_CENTER)
    alignContent: ALIGN_CENTER / ALIGN_LEFT, // (default: ALIGN_CENTER)
    
    customRender: function(row, column, rowId), 
    customHeaderRender: function(column), 

    moreOptions: object (used in some types: CELL_TYPE_SELECT / CELL_TYPE_BUTTONS)
  }
*/

export default DataTable;