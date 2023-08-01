import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Pagination from 'react-js-pagination';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import cn from 'classnames';
import moment from 'moment';
import { compose } from 'redux';
import { Form } from 'reactstrap';

import { appConfig } from '../../../appConfig';
import LANG from '../../../language';
import Select from '../Form/Select';
import Input from '../Form/Input';
import Checkbox from '../Form/Checkbox';
import Loading from '../Loading';
import DateTimeComponent from '../Form/DateTime'
import Validator from '../Validator/Validator';
import Textarea from '../Form/Textarea';

let schema;

export const ALIGN_LEFT = 1;
export const ALIGN_CENTER = 2;
export const ALIGN_RIGHT = 3;

export const CELL_TYPE_STRING = 0;
export const CELL_TYPE_INTEGER = 1;
export const CELL_TYPE_FLOAT = 2;
export const CELL_TYPE_DATE = 3;
export const CELL_TYPE_TIME = 4
export const CELL_TYPE_DATETIME = 5;
export const CELL_TYPE_TEXT = 6;

export const EDITABLE_TYPE_INPUT = 0;
export const EDITABLE_TYPE_DATE = 1;
export const EDITABLE_TYPE_TIME = 2;
export const EDITABLE_TYPE_SELECT = 3;
export const EDITABLE_TYPE_TEXTAREA = 4;

const DEFAULT_EXPANDED_ROW_INDEX = -1;

const IS_FOUND = (value, keyword) => {
  if(!value)
    return 0;
  return value.toString().toLowerCase().indexOf(keyword) !== -1 ? 1 : 0;
}

let gCurrentRows = [];
const setCurrentRows = (aRows) => {
  gCurrentRows = aRows;
}

export const getCurrentRows = () => {
  return gCurrentRows;
}

class DataTable extends Component {
  constructor(props) {
    super(props);
    const { pData, pDefaultSort, pDefaultCountPerPage, pDefaultPanelSize } = this.props;
    const sRows = this.processSort(pData, pDefaultSort);
    this.state = {
      sRows: sRows,
      sSearchInput: '',
      sRealSearchInput: '',
      sSearchInputCloseBtnStatus: 1,
      sCurrentPageNumber: 1,
      sCountPerPage: pDefaultCountPerPage,
      sPanelSize: pDefaultPanelSize,
      sSort: {
        field: pDefaultSort.field,
        direction: pDefaultSort.direction,
      },
      sEditedData: [],
      sEditedStatus: false,
      sNeedConfirm: false,
      sIsRowExpanded: DEFAULT_EXPANDED_ROW_INDEX, // -1: none is expanded, >= 0: expanded row index
      sCurrentEditRow: -2,   // -2: not edit , -1: add new , integer: edit (integer is the id of edit row)
      sIsSelectAllChecked: false,
      sIsRowChecked: [],
    };
  }

  componentDidMount() {
    schema=this.props.pSchema;
    if (this.props.pHasSearch) {
      let ctrlSearch = document.getElementById("searchInput");
      if(ctrlSearch) {
        ctrlSearch.addEventListener('keydown', this.handleKeyDown, false);
      }
    }
  }

  componentWillUnmount() {
    if (this.props.pHasSearch) {
      let ctrlSearch = document.getElementById("searchInput");
      if(ctrlSearch) {
        ctrlSearch.removeEventListener('keydown', this.handleKeyDown, false);
      }
    }
  }

  componentWillReceiveProps(aProps) {
    if(!_.isEqual(aProps.pData, this.props.pData)) {
      const sRows = this.processSort(aProps.pData, this.state.sSort);
      this.setState({
        sIsRowExpanded: DEFAULT_EXPANDED_ROW_INDEX,
        sRows: sRows,
        sSearchInput: '',
        sRealSearchInput: '',
        sCurrentPageNumber: 1,
        sIsSelectAllChecked: false,
        sIsRowChecked: [],
      });
    } else {
      const locRows = this.processSearch(this.state.sRealSearchInput);
      const locSorted = this.processSort(locRows, this.state.sSort);
      this.setState({
        sRows: locSorted,
      });
    }
  }

  handleCountPerPageChange = (e) => {
    const countPerPage = parseInt(e.target.value, 10);
    this.setState({
      sCurrentPageNumber: 1,
      sCountPerPage: countPerPage,
      sIsRowExpanded: DEFAULT_EXPANDED_ROW_INDEX,
      sIsRowChecked: [],
      sIsSelectAllChecked: false,
    });
  }

  handleCurrentPageNumberChange = (aPageNumber) => {
    this.setState({
      sCurrentPageNumber: aPageNumber,
      sIsRowExpanded: DEFAULT_EXPANDED_ROW_INDEX,
      sIsRowChecked: [],
      sIsSelectAllChecked: false,
    });
  }

  handleSearchInputChange = (e) => {
    const locSearch = e.target.value;
    
    if(locSearch === '') {
      let locRows = this.props.pData;
      const sRows = this.processSort(locRows, this.state.sSort);
      this.setState({
        sCurrentPageNumber: 1,
        sRows: sRows,
        sSearchInput: '',
        sRealSearchInput: '',
        sSearchInputCloseBtnStatus: 1,
        sIsRowExpanded: DEFAULT_EXPANDED_ROW_INDEX,      
        sIsRowChecked: [],
        sIsSelectAllChecked: false,
      });
    }
    else{
      this.setState({
        sSearchInputCloseBtnStatus: 2,
        sSearchInput: locSearch,
      });
    }
  }

  handleKeyDown = (e) => {
    if(e.keyCode === 13) {
      const locSearch = e.target.value;
      let locRows = this.props.pData;
      if(locSearch && locSearch !== '') {
        locRows = this.processSearch(locSearch.toString().toLowerCase());
      }

      const sRows = this.processSort(locRows, this.state.sSort);
      this.setState({
        sCurrentPageNumber: 1,
        sSearchInput: locSearch,
        sRealSearchInput: locSearch,
        sRows: sRows,
        sIsRowExpanded: DEFAULT_EXPANDED_ROW_INDEX,      
        sIsRowChecked: [],
        sIsSelectAllChecked: false,
      });
    }
  }

  handleSort = (field) => {
    const { pColumns, pIsLoading } = this.props;
    if (pIsLoading) {
      return;
    }
    const { sSort, sRows } = this.state;
    let foundColumn = null;
    for(let i = 0; i<pColumns.length; i++){
      if(pColumns[i].key === field){
        foundColumn = pColumns[i];
      }
    }
    if (!foundColumn || !foundColumn.sort)
      return;
    
    let locSort = {
      field: field,
      direction: 'asc',
    };
    if (sSort.field === field) {
      locSort.direction = sSort.direction === 'asc' ? 'desc' : 'asc';
    }
    const rows = this.processSort(sRows, locSort);
    this.setState({
      sSort: locSort,
      sRows: rows,
      sIsRowExpanded: DEFAULT_EXPANDED_ROW_INDEX,      
      sIsRowChecked: [],
      sIsSelectAllChecked: false,
    });
  }

  handleCellClick = (aRowIndex, aRows, aColumns, aColumn, e) => {
    const { sEditedStatus } = this.state;
    if (sEditedStatus) {
      window.getElementFromId("table-body")[0].scrollLeft = window.getElementFromId("table-body")[0].scrollWidth;
      this.setState({sNeedConfirm: true});
      return;
    }
    const tmp = (_.get(aRows[aRowIndex], this.props.pEditPermission.key))? _.get(aRows[aRowIndex], this.props.pEditPermission.key) : "";
    if (aRowIndex === -1) {
      this.setState({
        sCurrentEditRow: -1,
        sEditedData: [],
      })
      return;
    }
    if (this.props.pIsEditable) {
      if (tmp.toString() === this.props.pEditPermission.value || this.props.pEditPermission.key === "everybody can edit") {
        const { sEditedData } =this.state;
        const { validator: { onChangeHandler } } = this.props;
        _.map(aColumns, (item, index) => {
          sEditedData[item.key] = _.get(aRows[aRowIndex], item.key);
          onChangeHandler(item.key, _.get(aRows[aRowIndex], item.key));
        })
        this.setState({
          sCurrentEditRow: aRowIndex,
          sEditedData: sEditedData,
        });
      } else {
        this.setState({
          sCurrentEditRow: -2,
          sEditedData: [],
        })
      }
      
    } else {
      if (aColumn.detailShow) {
        const { sIsRowExpanded } = this.state;    
        this.setState({ sIsRowExpanded: aRowIndex === sIsRowExpanded ? DEFAULT_EXPANDED_ROW_INDEX : aRowIndex });
        if (this.props.pHandleCollapseDone !== null) {
          this.props.pHandleCollapseDone(aRowIndex, aRows);
        }
      }
    }
  }

  handleAllChecked = (aRows, aChecked) => {
    const { sIsRowChecked } = this.state;
    let locRowInfo = [];
    if (sIsRowChecked.length === 0) {
      // if array is empty, set aChecked
      for(let i = 0; i < aRows.length; i++) {
        locRowInfo.push(aChecked);
      }
    } else {
      for(let i = 0; i < aRows.length; i++) {
        locRowInfo.push(aChecked);
      }
    }
    this.setState({ 
      sIsSelectAllChecked: aChecked,
      sIsRowChecked: locRowInfo
    });
    this.props.pHandleMultiCheckbox(aRows, locRowInfo);
  }

  handleChecked = (aRowIndex, aRows, aChecked) => {
    const { sIsRowChecked } = this.state;
    let locRowInfo = [];
    if (sIsRowChecked.length === 0) {
      // if array is empty, set false
      for(let i = 0; i < aRows.length; i++) {
        locRowInfo.push(false);
      }
      locRowInfo[aRowIndex] = aChecked;
    } else {
      for(let i = 0; i < aRows.length; i++) {
        if (aRowIndex === i) {
          locRowInfo.push(aChecked);
        } else {
          locRowInfo.push(sIsRowChecked[i]);
        }
      }
    }
    this.setState({ sIsRowChecked: locRowInfo });
    this.props.pHandleMultiCheckbox(aRows, locRowInfo);
  }

  handleCloseBtnClick = (e) => {
    window.setFocus('#searchInput');
    let locRows = this.props.pData;
    const sRows = this.processSort(locRows, this.state.sSort);
    this.setState({
      sCurrentPageNumber: 1,
      sRows: sRows,
      sSearchInput: '',
      sRealSearchInput: '',
      sSearchInputCloseBtnStatus: 1,
      sIsRowExpanded: DEFAULT_EXPANDED_ROW_INDEX,      
      sIsRowChecked: [],
      sIsSelectAllChecked: false,
    });
  }

  handleEditInputChange = (e) => {
    const { sEditedData } = this.state;
    sEditedData[e.target.name] = e.target.value;
    this.setState({ 
      sEditedData, 
      sEditedStatus: true,
    });
    const { validator: { onChangeHandler } } = this.props;
    onChangeHandler(e.target.name, e.target.value);
  }

  handleEditDateChange = (e, dateTime) => {
    const { sEditedData } = this.state;
    sEditedData[e.target.name] = moment(dateTime).format('YYYY-MM-DD');
    this.setState({ 
      sEditedData, 
      sEditedStatus: true,
    })
  }

  handleEditTimeChange = (e, dateTime) => {
    const { sEditedData } = this.state;
    sEditedData[e.target.name] = moment(dateTime).format('HH:mm:ss');
    this.setState({ 
      sEditedData, 
      sEditedStatus: true,
    })
  }

  handleEditSelectChange = (e) => {
    const { sEditedData } = this.state;
    sEditedData[e.target.name] = e.target.value;
    this.setState({ 
      sEditedData, 
      sEditedStatus: true,
    })
  }

  handleTextAreaChange = (e) => {
    const { sEditedData } = this.state;
    sEditedData[e.target.name] = e.target.value;
    this.setState({ 
      sEditedData, 
      sEditedStatus: true,
    });
    const { validator: { onChangeHandler } } = this.props;
    onChangeHandler(e.target.name, e.target.value);
  }

  handleEditConfirmClick = () => {
    const { sEditedData, sCurrentEditRow } =this.state;
    const { validator: { validate } } = this.props;
    const rowIndex = sCurrentEditRow;
    if (validate(schema).isValid) {
      this.setState({ 
        sCurrentEditRow: -2,
        sEditedData: [],
        sEditedStatus: false, 
        sNeedConfirm: false,
      });
      if(this.props.pHandleEditConfirmClick !== null) {
        this.props.pHandleEditConfirmClick(sEditedData, rowIndex);
      }
    }
  }

  handleEditCancelClick = () => {
    this.setState({
      sCurrentEditRow: -2,
      sEditedData: [],
      sEditedStatus: false,
      sNeedConfirm: false,
    })
    if(this.props.pHandleEditCancelClick !== null) {
      this.props.pHandleEditCancelClick();
    }
  }

  processSort = (aRows, sort) => {
    const { pColumns } = this.props;
    let foundColumn = null;
    for(let i = 0; i<pColumns.length; i++){
      if(pColumns[i].key === sort.field){
        foundColumn = pColumns[i];
      }
    }
    if (!foundColumn) 
      return aRows;
    if (!foundColumn.type) // Type is not defined or string
      return _.orderBy(aRows, row => {return !_.get(row, sort.field) ? '' : _.get(row, sort.field).toString()}, sort.direction);
    else {
      switch(foundColumn.type) {
        case CELL_TYPE_STRING:
          return _.orderBy(aRows, row => {return !_.get(row, sort.field) ? '' : _.get(row, sort.field).toString()}, sort.direction);
        case CELL_TYPE_INTEGER:
          return _.orderBy(aRows, row => parseInt(_.get(row, sort.field), 10), sort.direction);
        case CELL_TYPE_FLOAT:
          return _.orderBy(aRows, row => parseFloat(_.get(row, sort.field)), sort.direction);
        case CELL_TYPE_DATE:
          return _.orderBy(aRows, row => _.get(row, sort.field), sort.direction);
        case CELL_TYPE_DATETIME:
            return _.orderBy(aRows, row => _.get(row, sort.field), sort.direction);
        default:
          return aRows;
      }
    }
  }

  processSearch = (aKeyword) => {
    const { pData, pColumns } = this.props;
    if (!aKeyword) {
      return pData;
    }
    let locRows = _.filter(pData, (row) => {
      if(!row)
        return false;
      let found = 0;
      for(let i = 0; i<pColumns.length; i++) {
        if(!pColumns[i].notSearch) {
          found += IS_FOUND(_.get(row, pColumns[i].key), aKeyword);
        }
      }
      return found > 0;
    });
    return locRows;
  }

  getPageRows = (aRows, aCurrentPageNumber, aCountPerPage) => {
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

  renderHeaderColumns = (aColumns) => {
    const { sSort } = this.state;
    let rowSpanNum = 1;
    aColumns.forEach((item) => {
      const hasChilds = item.childs && item.childs.length > 0;
      if (hasChilds) {
        rowSpanNum = 2;
      }
    });
    return _.map(aColumns, (item, index) => {
      let locClassName = !!item.sort ? 'sorting' : '';
      if (sSort.field === item.key) {
        locClassName = sSort.direction === 'desc' ? 'sorting_desc' : 'sorting_asc';
      }
      let locStyle = {};
      if(!!item.width){
        locStyle.width = item.width;
        locStyle.minWidth = item.width;
      }
      if(!!item.minWidth) {
        locStyle.minWidth = item.minWidth;
      }
      if(item.alignHeader === ALIGN_LEFT) {
        locStyle.textAlign = 'left';
      }
      if (item.customRenderHeader)
      {
        return (
          <th
            key={index}
            className={locClassName}
            style={locStyle}
            onClick={this.handleSort.bind(this, item.key)}
          >
            {item.customRenderHeader(item.icon && <i className={item.icon} />, item.title)}
          </th>
        )
      }
      else {
        const hasChilds = !!item.childs && item.childs.length > 0;
        const colSpanNum = hasChilds? item.childs.length : 1;

        return (
          <th
            key={index}
            className={locClassName}
            style={locStyle}
            rowSpan={(colSpanNum === 1)? rowSpanNum : 1}
            colSpan={colSpanNum}
            onClick={this.handleSort.bind(this, item.key)}
          >
            {item.icon && <i className={item.icon} />}
            {item.title}
          </th>
        )
      }
    })
  }

  renderRestHeader = (item, index) => {
    return(
      <th key={index}>{item.title}</th>
    );
  }

  renderChildsMember = (item, index) => {
    return (
      <td key={index}><p>{item}</p></td>
    );
  }

  renderEditElement = (aType, aColumn, aEditStatus) => {
    const { sEditedData } = this.state;
    let { validator: { values, errors } } = this.props;
    const targetData = aEditStatus?  _.get(sEditedData, aColumn.key) : "";
    let result;
    const now = new Date();
    switch(aType) {
      case EDITABLE_TYPE_INPUT:
        result = <div className="editable-table-input-container" onClick={e => {e.stopPropagation()}}>
          <Input 
            className={cn("editable-table-input", `editable-table-${aColumn.key}-edit`, aColumn.className !== ""? `${aColumn.className}-edit`: "")}
            label=""
            name={aColumn.key}
            placeHolder=""
            value={values[aColumn.key]}
            hasError={!!errors[aColumn.key]}
            errorMessage={errors[aColumn.key]}
            isBadgeVisible={false}
            onChange={this.handleEditInputChange}
            isErrorPlaceHolder={true}
          />
        </div>
        break;
      case EDITABLE_TYPE_DATE:
        result = <div className="editable-table-date-container" onClick={e => {e.stopPropagation()}}>
          <DateTimeComponent 
            className={cn("editable-table-date", `editable-table-${aColumn.key}-edit`, aColumn.className !== ""? `${aColumn.className}-edit`: "")}
            label=""
            name={aColumn.key}
            dateFormat="YYYY-MM-DD"
            timeFormat={false}
            isBadgeVisible={false}
            isForwardLabelFlag={false}
            defaultValue={(targetData !== "")? targetData : moment(now).format('YYYY-MM-DD')}
            onChange={this.handleEditDateChange}
          />
        </div>
        break;
      case EDITABLE_TYPE_TIME: 
        result = <div className="editable-table-time-container" onClick={e => {e.stopPropagation()}}>
          <DateTimeComponent 
            className={cn("editable-table-time", `editable-table-${aColumn.key}-edit`, aColumn.className !== ""? `${aColumn.className}-edit`: "")}
            label=""
            name={aColumn.key}
            dateFormat={false}
            timeFormat={"HH:mm:ss"}
            isBadgeVisible={false}
            isForwardLabelFlag={false}
            defaultValue={(targetData !== "")? targetData : moment(now).format('HH:mm:ss')}
            onChange={this.handleEditTimeChange}
          />
        </div>
        break;
      case EDITABLE_TYPE_SELECT: 
        result = <div className="editable-table-select-container" onClick={e => {e.stopPropagation()}}>
          <Select 
            name={aColumn.key}
            pData={aColumn.selectData}
            pValue={targetData.toString()}
            pHasDefault={false}
            pIsLabelAfter={true}
            pIsErrorVisible={false}
            onChange={this.handleEditSelectChange}
          />
        </div>
        break;
      case EDITABLE_TYPE_TEXTAREA:
        result = <div className="editable-table-textarea-container" onClick={ e => {e.stopPropagation()} }>
          <Textarea 
            name={aColumn.key}
            label=""
            value={values[aColumn.key]}
            onChange={this.handleTextAreaChange}
            hasError={!!errors[aColumn.key]}
            errorMessage={errors[aColumn.key]}
          />
        </div>
        break;  
      default:
        result = targetData;
        break;
    }
    return result;

  }

  renderRow = (aRow, aColumns, aRowIndex, aEditStatus) => {
    const { sRows, sCurrentPageNumber, sCountPerPage, sCurrentEditRow } = this.state;
    const locRows = this.getPageRows(sRows, sCurrentPageNumber, sCountPerPage);
    const { pIsEditable } =this.props;
    return _.map(aColumns, (column, index) => {
      const hasChilds = column.childs && column.childs.length > 0;
      let locStyle = {};
      if(!!column.width){
        locStyle.width = column.width;
        locStyle.minWidth = column.width;
      }
      if(!!column.minWidth) {
        locStyle.minWidth = column.minWidth;
      }
      if(column.alignContent === ALIGN_LEFT) {
        locStyle.textAlign = 'left';
      }
      if (column.customRender && !hasChilds) {
        return (
          <td
            className={cn(column.className ? column.className : '')}
            key={index}
            style={locStyle}
            onClick={this.handleCellClick.bind(this, aRowIndex, locRows, aColumns, column)}
          >
            {column.customRender(aRow, aColumns, aRowIndex)}
          </td>
        );
      }
      let value = _.get(aRow, column.key);
      const isTextArea = column.type === 5;
      switch(column.type) {
        case CELL_TYPE_STRING:
          if (value) {
            value = value.toString();  
          }
          break;
        case CELL_TYPE_DATE:
          if (value) {
            value = moment(value).format('YYYY-MM-DD');
          }
          break;
        case CELL_TYPE_TIME: 
          if (value) {
            value = moment(value).format('HH:mm:ss');
          }
          break;
        case CELL_TYPE_DATETIME: 
          if (value) {
            value = moment(value).format('YYYY-MM-DD HH:mm:ss');
          }
          break;
        default:
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          break;
      }
      
      if (hasChilds) {
        return _.map(column.childs, (childsColumn, index1) => {
          let childsLocStyle = {};
          if(!!childsColumn.width){
            childsLocStyle.width = childsColumn.width;
            childsLocStyle.minWidth = childsColumn.width;
          }
          if(!!childsColumn.minWidth) {
            childsLocStyle.minWidth = childsColumn.minWidth;
          }
          if(childsColumn.alignContent === ALIGN_LEFT) {
            childsLocStyle.textAlign = 'left';
          }
          if (column.customRender) {
            return (
              <td
                className={cn(childsColumn.className ? childsColumn.className : '', column.className ? column.className : '')}
                key={index1}
                style={childsLocStyle}
                onClick={column.detailShow && this.handleCellClick.bind(this, aRowIndex, locRows, aColumns, column )}
              >
                {column.customRender(aRow[column.key], childsColumn, aRowIndex, childsColumn.key)}
              </td>
            );
          } else {
          let childsValue = _.get(aRow[column.key], childsColumn.key);
          const isTextArea = childsColumn.type === 5;
          switch(childsColumn.type) {
            case CELL_TYPE_STRING:
              if (childsValue) {
                childsValue = value.toString();  
              }
              break;
            case CELL_TYPE_DATE:
              if (childsValue) {
                childsValue = moment(value).format('YYYY-MM-DD');
              }
              break;
            case CELL_TYPE_DATETIME: 
              if (childsValue) {
                childsValue = moment(value).format('YYYY-MM-DD HH:mm:ss');
              }
              break;
            default:
              if (typeof childsValue === 'object') {
                childsValue = JSON.stringify(childsValue);
              }
              break;
          }
          return (
            <td
              className={cn(childsColumn.className ? childsColumn.className : '')}
              key={index1}
              style={childsLocStyle}
              onClick={this.handleCellClick.bind(this, aRowIndex, locRows, aColumns, column)}
            >
              {isTextArea && <pre style={locStyle}>{childsValue}</pre>}
              {!isTextArea && <p style={locStyle}>{childsValue}</p>}
            </td>
          );
          }
        });


      } else {
        return (
          <td
            className={cn(column.className ? column.className : '')}
            key={index}
            style={locStyle}
            onClick={this.handleCellClick.bind(this, aRowIndex, locRows, aColumns, column)}
          >
            {sCurrentEditRow !== aRowIndex && isTextArea && <pre style={locStyle}>{value}</pre>}
            {sCurrentEditRow !== aRowIndex && !isTextArea && <p style={locStyle}>{value}</p>}
            {pIsEditable && aRowIndex === sCurrentEditRow && this.renderEditElement(column.editableType, column, aEditStatus)}
          </td>
        );
      }
    })
  }

  renderTable = () => {
    const { pIsLoading, pUser, pColumns, pHasNumberColumn, pDetailRowRender, pCustomRowRender, pHasMultiCheckbox,  pHighlightedRows } = this.props;
    const { sRows, sCurrentPageNumber, sCountPerPage, sIsRowExpanded, sIsRowChecked, sCurrentEditRow, sNeedConfirm } = this.state;
    const locRows = this.getPageRows(sRows, sCurrentPageNumber, sCountPerPage);
    let locStart = sCountPerPage * (sCurrentPageNumber - 1);
    const locHasDetailRow = pDetailRowRender !== null;
    const locHasCustomRow = pCustomRowRender !== null;

    let locColspan = pColumns.length;
    let htmlTableBody = [];

    let headerRowSpan = 1;
    let restHeader = [];
    let addedCols = 0;

    setCurrentRows(locRows);
    
    if (pHasMultiCheckbox) {
      locColspan ++;
    }
    if (pHasNumberColumn) {
      locColspan ++;
    }
    if (locHasDetailRow) {
      locColspan ++;
    }
    
    pColumns.forEach((item) => {
      const hasChilds = item.childs && item.childs.length > 0;
      if (hasChilds) {
        headerRowSpan = 2;
        addedCols += (item.childs.length - 1);
        item.childs.forEach((childsItem) => {
          restHeader.push(childsItem);
        });
      }
    });

    if (locHasCustomRow) {
      if (locRows.length > 0) {
        _.map(locRows, (row, index)=> {
          htmlTableBody.push(
            <tr key={index + '_expanded'}>
              {pCustomRowRender(locRows, pColumns, index)}
            </tr>
          );
        })
      }
      return(
        <table>
          <tbody>
            {locRows.length === 0 &&
              <tr>
                <td colSpan={locColspan + addedCols}>
                  {LANG('COMP_TABLE_EMPTY')}
                </td>
              </tr>
            }
            {htmlTableBody}
          </tbody>
        </table>
      );
    }

    if (this.props.pIsEditable) {
      const { sCurrentEditRow } = this.state;
      if (sCurrentEditRow === -1) {
        htmlTableBody.push(
          <tr key={locRows.length + 1} className="edit-row">
            {
              pHasMultiCheckbox &&
              <td className="" />
            }
            {
              pHasNumberColumn && <td />
            }
            {this.renderRow("" , pColumns, -1, false)}
            {sCurrentEditRow === -1 &&
              <td className={cn("confirm-button-container", sNeedConfirm? "confirm-button-container-need-confirm" : "")}>
                <div>
                  <i className="fa fa-check save-button" onClick={this.handleEditConfirmClick} />
                  <i className="fa fa-times cancel-button" onClick={this.handleEditCancelClick} />
                </div>
              </td>
            }
          </tr>
        );
      } else {
        htmlTableBody.push(
          <tr key={locRows.length + 1} className="edit-row add-new-row-button">
            <td colSpan={locColspan + addedCols} onClick={this.handleCellClick.bind(this, -1, locRows, pColumns)}>{LANG('COMP_TABLE_CLICK_FOR_ADD')}</td>
          </tr>
        )
      }
    }

    if (locRows.length > 0) {
      _.map(locRows, (row, index)=> {
        let isHighlighted = false;
        if (pHighlightedRows && pHighlightedRows.length !== 0) {
          pHighlightedRows.forEach ((item) => {
            if(item === row._id) {
              isHighlighted = true;
            }
          });
        }
        const isRowExpanded = sIsRowExpanded === index;
        const isChecked = sIsRowChecked.length > 0 && sIsRowChecked[index] === true;
        const tmpValue = pUser.length !== 0? _.get(row, pUser[1]) : "-999999999999999";
        htmlTableBody.push(
          <tr key={index} className={cn((tmpValue === pUser[0])? 'row-me' : '', isRowExpanded? 'row-expanded' : 'row-expanded-none', isHighlighted? 'row-highlighted' : '')}>
            {
              pHasMultiCheckbox &&
              <td className="">
                <Checkbox
                  id={`chkSelect_${index}`}
                  isChecked={isChecked}
                  onChange={this.handleChecked.bind(this, index, locRows)}
                />
              </td>
            }
            {
              pHasNumberColumn && <td>{++locStart}</td>
            }
            {this.renderRow(row, pColumns, index, true)}
            {sCurrentEditRow === index &&
              <td className={cn("confirm-button-container", sNeedConfirm? "confirm-button-container-need-confirm" : "")}>
                <div>
                  <i className="fa fa-check save-button" onClick={this.handleEditConfirmClick} />
                  <i className="fa fa-times cancel-button" onClick={this.handleEditCancelClick} />
                </div>
              </td>
            }
          </tr>
        );
        if(isRowExpanded) { // expanded row
          let locColumnCount = 1 + pColumns.length;
          if(pHasMultiCheckbox)
            locColumnCount++;
          if(pHasNumberColumn)
            locColumnCount++;
          htmlTableBody.push(
            <tr key={index + '_expanded'}>
              <td colSpan={locColumnCount + addedCols}>
                {pDetailRowRender(locRows, pColumns, index)}
              </td>
            </tr>
          );
        }
      })
    }
    
    const { location: { pathname } } = this.props;
    
    let catagory = 0;
    if (pathname.indexOf('/teaching-admin') !== -1) {
      catagory = 0;
    }
    if (pathname.indexOf('/teaching-support') !== -1) {
      catagory = 1;
    }
    if (pathname.indexOf('/teaching-evaluation') !== -1) {
      catagory = 2;
    }

    return (
      <table>
        <thead className={cn((catagory === 0)? "thead-admin" : "", (catagory === 1)? "thead-support" : "", (catagory === 2)? "thead-evaluation" : "")}>
          <tr>
            {
              pHasMultiCheckbox && 
                <th className="th_checkbox" rowSpan={headerRowSpan} colSpan='1'>
                  {!pIsLoading && <Checkbox
                    id="chkSelectAll"
                    isChecked={this.state.sIsSelectAllChecked}
                    onChange={this.handleAllChecked.bind(this, locRows)}
                  />}
                </th>
            }
            {
              pHasNumberColumn && <th className="th_number" rowSpan={headerRowSpan} colSpan='1'>{LANG('COMP_TABLE_COLUMN_NO')}</th>
            }
            {
              this.renderHeaderColumns(pColumns)
            }
          </tr>
          { (headerRowSpan === 2) &&
            <tr>
              {_.map(restHeader, (item, index) => {
                return this.renderRestHeader(item, index)
              })}
            </tr>
            
          }
        </thead>
        <tbody>
          {pIsLoading && 
            <tr>
              <td colSpan={locColspan + addedCols}>
                <Loading />
              </td>
            </tr> 
          }
          {!pIsLoading && locRows.length === 0 &&
            <tr>
              <td colSpan={locColspan + addedCols}>
                {LANG('COMP_TABLE_EMPTY')}
              </td>
            </tr>
          }
          {!pIsLoading && htmlTableBody}
        </tbody>
      </table>
    )
  }

  render() {
    const { sRows, sCurrentPageNumber, sSearchInput, sCountPerPage, sPanelSize, sSearchInputCloseBtnStatus } = this.state;
    const { pIsLoading, pHasPagination, pHasSearch, pSearchPlaceholderText, pIsEditable } = this.props;
    const locTotal = sRows.length;
    const locStart = pHasPagination? (sCurrentPageNumber - 1) * sCountPerPage + 1 : 1;
    const locEnd = pHasPagination? (sCurrentPageNumber * sCountPerPage > locTotal ? locTotal : sCurrentPageNumber * sCountPerPage) : locTotal;
    
    const locHasUpperPart = pHasPagination || pHasSearch || this.props.pLeftUpperPartCustomRender !== null || this.props.pRightUpperPartCustomRender !== null || this.props.pCenterLowerPartCustomRender !== null;
    const locHasLowerPart = locTotal > 0 && pHasPagination;
    const locHasCenterUpperPartCustomRender = this.props.pCenterUpperPartCustomRender !== null;
    const locHasLeftUpperPartCustomRender = this.props.pLeftUpperPartCustomRender !== null;
    const locHasRightUpperPartCustomRender = this.props.pRightUpperPartCustomRender !== null;
    const locHasCenterLowerPartCustomRender = this.props.pCenterLowerPartCustomRender !== null;
    let locHeightOffset = 0;
    if(locHasLowerPart)
      locHeightOffset += 30;
    if(locHasUpperPart)
      locHeightOffset += 0; // temporary action for upper part moving

    return (
      <div className="component-table-container">
        { !pIsLoading && locHasUpperPart &&
          <div className="search-bar">
            <div>
              {
                locHasLowerPart && pHasPagination &&      
                  <Select 
                    name="countPerPage"
                    pLabel={LANG('COMP_PAGINATIONPANEL_COUNT')}
                    pData={appConfig.PAGINATION_COUNT_PER_PAGE}
                    pValue={sCountPerPage.toString()}
                    pHasDefault={false}
                    pIsLabelAfter={true}
                    pIsErrorVisible={false}
                    onChange={this.handleCountPerPageChange}
                  />
              }
              {
                locHasLeftUpperPartCustomRender && this.props.pLeftUpperPartCustomRender()
              }
            </div>
            { 
              locHasCenterUpperPartCustomRender && this.props.pCenterUpperPartCustomRender()
            }
            {
              locHasRightUpperPartCustomRender && this.props.pRightUpperPartCustomRender()
            }
            { pHasSearch &&
              <div className="search-container">
                <div className="searchLabel">
                  {LANG('COMP_TABLE_SEARCH')}
                </div>
                <Input
                  name="searchInput"
                  id="searchInput"
                  label=""
                  className="search-input"
                  value={sSearchInput}
                  isBadgeVisible={false}
                  isErrorVisible={false}
                  searchInputStatus={sSearchInputCloseBtnStatus}
                  placeholder={pSearchPlaceholderText}
                  onChange={this.handleSearchInputChange}
                  pHandleCloseBtnClick={this.handleCloseBtnClick}
                />
              </div>
            }
          </div>
        }
        <div id="table-body" className="table-body" style={{maxHeight: `calc(100% - ${locHeightOffset}px)`}}>
          {pIsEditable && 
            <Form onSubmit={this.handleEditConfirmClick}>
              { this.renderTable() }
            </Form>
          }
          {!pIsEditable && 
            this.renderTable()
          }
        </div>
        { !pIsLoading && locHasLowerPart &&
          <div className="pagination-bar">
            <div className="pagination-info">
              <div className="pagination-info-all">
                {LANG('COMP_PAGINATIONPANEL_ALL')}
              </div>
              <div className="pagination-info-detail">
                {locTotal} ( {locStart} ~ {locEnd} )
              </div>
            </div>
            
            <div className="pagination-container">
              <Pagination
                activePage={sCurrentPageNumber}
                itemsCountPerPage={sCountPerPage}
                totalItemsCount={locTotal}
                pageRangeDisplayed={sPanelSize}
                onChange={this.handleCurrentPageNumberChange}
              />
            </div>
          </div>
        }
        {
          locHasCenterLowerPartCustomRender && 
          <div className="pagination-bar">
            {this.props.pCenterLowerPartCustomRender()}
          </div>
        }
      </div>
    );
  }
}

DataTable.propTypes = {
  pIsLoading: PropTypes.bool,
  pData: PropTypes.array,
  pColumns: PropTypes.array,
  pHighlightedRows: PropTypes.array,
  pHasMultiCheckbox: PropTypes.bool,
  pHasNumberColumn: PropTypes.bool,
  pHasPagination: PropTypes.bool,
  pHasSearch: PropTypes.bool,
  pIsEditable: PropTypes.bool,
  pDefaultCountPerPage: PropTypes.number,
  pDefaultPanelSize: PropTypes.number,
  pDefaultSort: PropTypes.object,
  pEditPermission: PropTypes.object,
  pLeftUpperPartCustomRender: PropTypes.func,
  pCenterUpperPartCustomRender: PropTypes.func,
  pRightUpperPartCustomRender: PropTypes.func,
  pCenterLowerPartCustomRender: PropTypes.func,
  pCustomRowRender: PropTypes.func,
  pDetailRowRender: PropTypes.func,
  pHandleMultiCheckbox: PropTypes.func,
  pHandleCollapseDone: PropTypes.func,
  pSearchPlaceholderText: PropTypes.string,
};

DataTable.defaultProps = {
  pIsLoading: false,
  pData: [],
  pColumns: [],
  pHighlightedRows: [],
  pUser: [],
  pEditPermission: {key: "everybody can edit", value: ""},
  pHasMultiCheckbox: false,
  pHasPagination: true,
  pHasSearch: true,
  pHasNumberColumn: true,
  pIsEditable: false,
  pDefaultCountPerPage: 10,
  pDefaultPanelSize: 5,
  pDefaultSort: {
    field: 'id',
    direction: 'asc', // 'asc / desc'
  },
  pLeftUpperPartCustomRender: null,
  pCenterUpperPartCustomRender: null,
  pRightUpperPartCustomRender: null,
  pCenterLowerPartCustomRender: null,
  pCustomRowRender: null,
  pDetailRowRender: null,
  pHandleMultiCheckbox: null,
  pHandleCollapseDone: null,
  pSearchPlaceholderText: '',
  pHandleEditConfirmClick: null,
  pHandleEditCancelClick: null
};

// column attributes
// {
//   key: 'XXX',
//   title: 'XXX',
//   width: XXX,
//   icon: 'XXX'
//   minWidth: XXX,
//   sort: true/false,
//   notSearch: true/false,
//   alignHeader: ALIGN_CENTER / ALIGN_LEFT,
//   alignContent: ALIGN_CENTER / ALIGN_LEFT,
//   customRender: function, // (aRow, aColumns, aRowIndex) 
//   className: 'XXX',
//   editableType: EDITABLE_TYPE_INPUT / EDITABLE_TYPE_DATE / EDITABLE_TYPE_TIME / EDITABLE_TYPE_SELECT
//   type: CELL_TYPE_STRING / CELL_TYPE_INTEGER / CELL_TYPE_FLOAT / CELL_TYPE_DATE / CELL_TYPE_DATETIME / CELL_TYPE_TEXT,
// },

export default compose(
  withRouter,
  Validator(schema),
)(DataTable);