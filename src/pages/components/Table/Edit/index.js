import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Table } from '@devexpress/dx-react-grid-bootstrap3';
import MaskedInput from 'react-text-mask';

import LANG from '../../../../language';
import DateTimeComponent from '../../Form/DateTime';
import { CELL_TYPE_STRING, CELL_TYPE_HTML, CELL_TYPE_SELECT, CELL_TYPE_DATETIME, CELL_TYPE_DATE, CELL_TYPE_TIME, CELL_TYPE_INTEGER, CELL_TYPE_FLOAT, CELL_TYPE_USER, CELL_TYPE_OBJECT, CELL_TYPE_OPTION } from '../index';
import Option from '../../Option';
import { validateDate } from '../../../../library/utils/dateTime';

const CONTROL_BORDER_NO_ERROR = '1px solid #999'; 
const CONTROL_BORDER_HAS_ERROR = '1px solid red'; 
const CONTROL_TITLE_ERROR = LANG('COMP_TABLE_EDIT_INPUT_PLACEHOLDER');
export const CONTROL_AUTO_FOCUS_ID = 'editable_autofocus_';

const handleChange = (rowChanges, column, row, e) => {
  const value = e.target.value;
  rowChanges[column.name] = value;
  let isInvalid = false, errorMessage = '';
  if (column.type === CELL_TYPE_DATE) {
    errorMessage = validateDate(value);
    isInvalid = errorMessage !== null;
  }
  if (column.checkValidation) {
    errorMessage = column.checkValidation(value, row);
    isInvalid = errorMessage !== null;
  }
  if (isInvalid) {
    e.target.style.border = CONTROL_BORDER_HAS_ERROR;
    e.target.title = errorMessage || CONTROL_TITLE_ERROR;
  } else {    
    e.target.style.border = CONTROL_BORDER_NO_ERROR;
    e.target.title = '';
  }
}

const handleDateChange = (rowChanges, column, row, e, value) => {
  rowChanges[column.name] = moment(value).format('YYYY-MM-DD'); //moment(e.target.value).format('YYYY-MM-DD');
}

const handleDateTimeChange = (rowChanges, column, row, e, value) => {
  rowChanges[column.name] = moment(value).format('YYYY-MM-DD HH:mm:ss');
}

const handleTimeChange = (rowChanges, column, row, e, value) => {
  rowChanges[column.name] = moment(value).format('HH:mm:ss');
}

const handleOptionChange = (rowChanges, column, row, data, e) => {
  if (data && data.length > 0) {
    rowChanges[column.name] = data[0].item;
  }
}

const handleOptionOpen = (onValueChange, value, e) => {
  e.stopPropagation();
  e.preventDefault();

  if (typeof(value) !== 'object') { // modal is not opened yet
    onValueChange({
      val: value,
      modal: true,
    });
  }
}

const handleOptionCloseClick = (onValueChange, value) => {
  if (typeof(value) === 'object' && value.modal) { // modal already opened
    onValueChange(value.val);
  }
}

export const EditCell = (startIndex, tableID, props) => {
  const { column, onValueChange, value, row, tableRow } = props;
  if (!column.isEditable){
    switch (column.type) {
      case CELL_TYPE_SELECT:
      case CELL_TYPE_OBJECT:
        return <Table.Cell value={_.get(row, column.name)}/>;
      case CELL_TYPE_USER:
        return <Table.Cell value={_.get(row, column.name + '.realName')}/>;
      case CELL_TYPE_DATE:
        return <Table.Cell value={moment(_.get(row, column.name)).format('YYYY-MM-DD')}/>;
      case CELL_TYPE_DATETIME:
        return <Table.Cell value={moment(_.get(row, column.name)).format('YYYY-MM-DD HH:mm:ss')}/>;
      default:
        if (column.customRender) {
          const customRendered = column.customRender(row, [], tableRow.rowId);
          return (<Table.Cell value={customRendered} />);
        } else {
          return (<Table.Cell value={value} />);
        }        
    }
  } else {
    const hasErrorStyle = {border: '1px solid red'};
    let defaultValue = _.get(row, column.name);
    if (column.type === CELL_TYPE_SELECT) {
      defaultValue = _.get(row, column.moreOptions.defaultValueFieldName);
    }
    let isInvalid = false, errorMessage = '';
    if (column.type === CELL_TYPE_DATE) {
      errorMessage = validateDate(value);
      isInvalid = errorMessage !== null;
    }
    if (column.checkValidation) {      
      errorMessage = column.checkValidation(defaultValue, row);
      isInvalid = errorMessage !== null;
    }
    switch (column.type) {
      case CELL_TYPE_STRING:
      case CELL_TYPE_INTEGER:
      case CELL_TYPE_FLOAT:
        global.autoFocusId ++;
        return (<td>
          <input
            id={CONTROL_AUTO_FOCUS_ID + global.autoFocusId}
            type="text"
            className="form-control"
            defaultValue={value}
            style={isInvalid ? hasErrorStyle: null}
            title={isInvalid ? errorMessage : ''}
            onChange={handleChange.bind(this, global.currentChanges[tableID], column, row)}
          />
        </td>);
      case CELL_TYPE_HTML:
        global.autoFocusId ++;
        return (<td>
          <textarea
            id={CONTROL_AUTO_FOCUS_ID + global.autoFocusId}
            type="text"
            className="form-control"
            defaultValue={value}
            style={isInvalid ? hasErrorStyle: null}
            title={isInvalid ? errorMessage : ''}
            onChange={handleChange.bind(this, global.currentChanges[tableID], column, row)}
          />
        </td>);
      case CELL_TYPE_DATE:
        if (column.moreOptions && column.moreOptions.optionType === "calendar") {
          return (<td>
            <DateTimeComponent
              timeFormat={false}
              defaultValue={value ? new Date(value) : new Date()}
              onChange={handleDateChange.bind(this, global.currentChanges[tableID], column, row)}
            />
          </td>);
        } 
        return (<td>
          <MaskedInput 
            className="editable-cell-date"
            mask={[/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
            style={isInvalid ? hasErrorStyle: null}
            title={isInvalid ? errorMessage : ''}
            onChange={handleChange.bind(this, global.currentChanges[tableID], column, row)}
            defaultValue={value ? value : ''}
          />
        </td>);
      case CELL_TYPE_DATETIME:
        return (<td>
          <DateTimeComponent
            defaultValue={value ? new Date(value) : ''}
            onChange={handleDateTimeChange.bind(this, global.currentChanges[tableID], column, row)}
          />
        </td>);
      case CELL_TYPE_TIME:
        return (<td>
          <DateTimeComponent
            dateFormat={''}
            timeFormat={'HH:mm:ss'}
            defaultValue={value ? value : '00:00:00'}
            onChange={handleTimeChange.bind(this, global.currentChanges[tableID], column, row)}
          />
        </td>);
      case CELL_TYPE_SELECT:
        let options = [];
        let hideEmpty = false;
        if (column.moreOptions){
          if (column.moreOptions.selectData && column.moreOptions.selectValue && column.moreOptions.selectTitle) {
            _.map(column.moreOptions.selectData, (item) => {
              options.push({
                value: _.get(item, column.moreOptions.selectValue),
                title: _.get(item, column.moreOptions.selectTitle),
              });
            })
          }
          if (!!column.moreOptions.hideEmpty) {
            hideEmpty = true;
          }
        }
        return (<td>
            <select
              className="form-control"
              onChange={handleChange.bind(this, global.currentChanges[tableID], column, row)}
              defaultValue={defaultValue}
              style={isInvalid ? hasErrorStyle: null}
              title={isInvalid ? errorMessage : ''}
            >
              {!hideEmpty && <option value=""></option>}
              {
                options && options.map((item, key) => (<option key={key} value={item.value}>{item.title}</option>))
              }
            </select>
          </td>
        );
      case CELL_TYPE_OPTION:
        let optionType = '', optionTitle='';
        const strValue = typeof(value) === "object" ? value.val: value;
        const hasDefaultValue = typeof(strValue) === "string";
        if (column.moreOptions){
          optionTitle = column.moreOptions.optionTitle;
          optionType = column.moreOptions.optionType;
        }
        if (column.checkValidation) {      
          errorMessage = column.checkValidation(global.currentChanges[tableID][column.name], row);
          isInvalid = errorMessage !== null;
        }
        return (<td>
          <div
            style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '6px 2px', 
              border: isInvalid ? !hasDefaultValue? "1px solid red" : "" : "", 
              borderRadius : '2px'
            }}
            onClick={handleOptionOpen.bind(this, onValueChange, value)}
          >
            <div>
              <div>{global.currentChanges[tableID][column.name] || strValue}</div>
            </div>
            <i
              className='fa fa-toggle-down'
              style={{fontSize : '18px'}}
              title={isInvalid ? errorMessage : ''}
            />
            {value && value.modal &&
              <Option
                pTitle={optionTitle}
                pKind={optionType}
                pCanSelectMultiRow={false}
                pHandleYes={handleOptionChange.bind(this, global.currentChanges[tableID], column, row)}
                pHandleCloseClick={handleOptionCloseClick.bind(this, onValueChange, value)}
              />
            }
          </div>          
        </td>);
      default:
        return (<td></td>);
    }
  }
};

const AddButtonStyle = {
  fontSize: '15px',
  color: '#04BC6C',
  padding: '8px 15px',
  cursor: 'pointer',
  display: 'inline-block',
  height: '36px',
};

const EditButtonStyle = {
  fontSize: '15px',
  color: '#04BC6C',
  margin: '0px 5px',
  cursor: 'pointer',
  display: 'inline-block',
};

const CommitButtonStyle = {
  fontSize: '16px',
  color: '#04BC6C',
  margin: '9px 5px',
  cursor: 'pointer',
  display: 'inline-block',
};

const CancelButtonStyle = {
  fontSize: '16px',
  color: '#f50057',
  margin: '9px 5px',
  cursor: 'pointer',
  display: 'inline-block',
};

const handleButtonClick = (onExecute, e) => {
  e.stopPropagation();
  onExecute();
}
const AddButton = ({ onExecute }) => (
  <div
    id='table_add_button'
    onClick={handleButtonClick.bind(this, onExecute)}
    style={AddButtonStyle}
    title={LANG('BASIC_NEW_ADD') + ' (Ctrl + Alt + N)'}
  >
    <i className="fa fa-plus"></i>
  </div>
);

const EditButton = ({ onExecute }) => (
  <div
    onClick={handleButtonClick.bind(this, onExecute)}
    style={EditButtonStyle}
    title={LANG('BASIC_EDIT')}
  >
    <i className="fa fa-edit"></i>
  </div>
);

const DeleteButton = ({ onExecute }) => (
  <div
    onClick={handleButtonClick.bind(this, onExecute)}
    style={CancelButtonStyle}
    title={LANG('BASIC_DELETE')}
  >
    <i className="fa fa-trash"></i>
  </div>
);

const CommitButton = ({ onExecute }) => (
  <div
    id='table_commit_button'
    onClick={handleButtonClick.bind(this, onExecute)}
    style={CommitButtonStyle}
    title={LANG('BASIC_SAVE') + ' (Ctrl + Enter)'}
  >
    <i className="fa fa-save"></i>
  </div>
);

const CancelButton = ({ onExecute }) => (
  <div
    id='table_cancel_button'
    onClick={handleButtonClick.bind(this, onExecute)}
    style={CancelButtonStyle}
    title={LANG('BASIC_CANCEL') + ' (Escape)'}
  >
    <i className="fa fa-times-circle"></i>
  </div>
);

export const CommandComponents = {
  add: AddButton,
  edit: EditButton,
  delete: DeleteButton,
  commit: CommitButton,
  cancel: CancelButton,
};