import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

import Radio from '../Radio';
import Option from '../Option';


let globalValue = {};

export const TYPE_FILE_ATTACH = 0;
export const TYPE_BLANK = 1;
export const TYPE_RADIO = 2;
export const TYPE_OPTION = 3;
export const TYPE_DATE = 4;
export const TYPE_CHECK = 5;
export const TYPE_MASK_INPUT = 6;
export const TYPE_NUMBER = 7;
export const TYPE_SELECT = 8;
export const TYPE_TIME = 9;
export const TYPE_DATETIME = 10;



export const getCurrentStaffValues = () => {
  return globalValue;
}

class StaffEditor extends Component {

  constructor( props ) {
    super( props );
    this.state = {
      values: {},
      optionShow: {},
      errors: {},
    };
  }

  componentDidMount = () => {
    const { id, pRow, defaultData } = this.props;
    globalValue[id] = defaultData;
    let optionShow = {};
    let values = {};
    _.map( pRow, ( rowItem, rowIndex ) => {
      _.map( rowItem, ( item, index ) => {
        const hasDefaultData = !!defaultData && !!defaultData[item.name];
        switch ( item.type ) {
          case 3:  //TYPE_OPTION
            optionShow[item.name] = false;
            if ( hasDefaultData ) {
              values[item.name] = defaultData[item.name];
            }
            break;
          case 5:  //TYPE_CHECK
            _.map( item.value, ( checkItem, checkIndex ) => {
              if ( !!defaultData && !!defaultData[checkItem.name] ) {
                values[checkItem.name] = defaultData[checkItem.name];
              }
            })
            break;
          case 8:  // TYPE_SELECT
            if ( hasDefaultData ) {
              values[item.name] = defaultData[item.name];
            }
            break;
          default:
            break;
        }
      });
    });
    this.setState({
      optionShow: optionShow,
      values: values,
    })
  }

  componentWillReceiveProps = ( newProps ) => {
    const { errors } = newProps;
    if (errors && errors.length !== 0) {
      let errorMsg = '';
      _.map(errors, ( error, index ) => {
        errorMsg += ` ${error}`;
      })
      if (errorMsg !== '') {
        this.setState({
          errors: errors,
        });
      }
    }
  }

  handleInputChange = ( e ) => {
    const { id, pProcessModified } = this.props;
    globalValue[id][e.target.name] = e.target.value;
    this.setState({
      errors: {},
    });
    pProcessModified();
  }

  handleRadioChange = ( aValue, aName ) => {
    const { id, pProcessModified } = this.props;
    globalValue[id][aName] = aValue;
    this.setState({
      errors: {},
    });
    pProcessModified();
  }

  handleShowOption = ( aName, e ) => {
    e.stopPropagation();
    let { optionShow } = this.state;
    optionShow[aName] = true;
    this.setState({
      optionShow: optionShow,
    });
  }

  handleCloseOption = ( aName, e ) => {
    let { optionShow } = this.state;
    optionShow[aName] = false;
    this.setState({
      optionShow: optionShow,
    });
  }

  handleSelectedOption = ( aName, aData ) => {
    const { id, pProcessModified } = this.props;
    let { values } = this.state;
    if ( aData && aData.length !== 0 ) {
      globalValue[id][aName] = aData[0].item;
      values[aName] = aData[0].item;
      this.setState({
        values: values,
        errors: {},
      });
      pProcessModified();
    }
  }

  handleCancelValue = ( aName, e ) => {
    e.stopPropagation();
    const { id, pProcessModified } = this.props;
    let { values } = this.state;
    globalValue[id][aName] = "";
    values[aName] = "";
    this.setState({
      values: values,
      errors: {},
    });
    pProcessModified();
  }

  handleMaskedInputChange = ( aName, e ) => {
    const { id, pProcessModified } = this.props;
    globalValue[id][aName] = e.target.value;
    this.setState({
      errors: {},
    });
    pProcessModified();
  }

  handleClickCheckBox = ( aName ) => {
    const { id, pProcessModified } = this.props;
    let { values } = this.state;
    values[aName] = !values[aName];
    globalValue[id][aName] = values[aName];
    this.setState({
      values: values,
      errors: {},
    })
    pProcessModified();
  }

  handleChangeSelect = ( aName, e ) => {
    const { id, pProcessModified } = this.props;
    globalValue[id][aName] = e.target.value;
    this.setState({
      errors: {},
    })
    pProcessModified();
  }

  render() {
    const { name, id, className, pRow, editingMode, defaultData } = this.props;
    const { values, optionShow, errors } = this.state;
    const numMask = createNumberMask({
      prefix: '',
      suffix: '',
      thousandsSeparatorSymbol: '',
    })
    let errorDivRendered = false;
    return (
      <div className={cn( 'component-staff-editor', className )} name={name} id={id}>
        <table className='staff-editor-table'>
          <tbody>
            {
              _.map( pRow, ( rowItem, rowIndex ) => {
                let html = [];
                let memberHtml = [];
                _.map( rowItem, ( item, index ) => {
                  let errorDivHtml=[];
                  if ( item.type !== 0 && item.type !== 1 && item.type !== 5 ) {
                    memberHtml.push(
                      <td 
                        key={`${index}_1`} 
                        className={cn( 'staff-editor-title', `${item.name}-title` )}
                      >
                        {item.title}
                      </td>
                    );
                  }
                  if ( editingMode ) {
                    const hasError = errors[item.name] && errors[item.name] !== "";
                    if ( hasError && !errorDivRendered ) {
                      errorDivHtml.push(
                        <div className="error-div" key={`${index}_error`}>
                          {errors[item.name]}
                        </div>
                      )
                      errorDivRendered = true;
                    }
                    const hasDefaultData = !!defaultData && !!defaultData[item.name];
                    switch ( item.type ) {
                      case 0:  // TYPE_FILE_ATTACH
                        memberHtml.push(
                          <td 
                            key={`${index}_2`} 
                            className={cn( 'staff-editor-content', `${item.name}-content` )} 
                            colSpan={item.colSpan}  
                            rowSpan={item.rowSpan}
                          >
                            <div className={cn( 'container-photo-attachment', 'container-photo-attachment-nothing' )}>
                              <i className="fa fa-user"/>
                            </div>
                            {errorDivHtml}
                          </td>
                        );
                        break;
                      case 1:  // TYPE_BLANK
                        memberHtml.push(
                          <td 
                            key={`${index}_2`} 
                            className={cn( 'staff-editor-content', 'staff-editor-content-blank' )} 
                            colSpan={item.colSpan? item.colSpan + 1 : 2} 
                            rowSpan={item.rowSpan}
                          />
                        );
                        break;
                      case 2:  // TYPE_RADIO
                        memberHtml.push(
                          <td 
                            key={`${index}_2`} 
                            className={cn("staff-editor-content", `${item.name}-content`)} colSpan={item.colSpan} rowSpan={item.rowSpan}>
                            <Radio
                              name={item.name}
                              values={item.value}
                              defaultValue={hasDefaultData? defaultData[item.name] : ""}
                              onChange={this.handleRadioChange.bind()}
                            />
                            {errorDivHtml}
                          </td>
                        );
                        break;
                      case 3:  // TYPE_OPTION
                        memberHtml.push(
                          <td key={`${index}_2`} className={cn("staff-editor-content", `${item.name}-content`)} colSpan={item.colSpan} rowSpan={item.rowSpan}>
                            <div className={cn("option-value-container")} onClick={this.handleShowOption.bind(this, item.name)}>
                              <span>
                                {values[item.name]}
                              </span>
                              <i className="fa fa-close close-btn" onClick={this.handleCancelValue.bind(this, item.name)} />
                            </div>
                            { optionShow[item.name] &&
                              <Option 
                                name={item.name}
                                pTitle={item.title}
                                pKind={item.kind}
                                pCanSelectMultiRow={false}
                                pHandleCloseClick={this.handleCloseOption.bind(this, item.name)}
                                pHandleYes={this.handleSelectedOption.bind(this, item.name)}
                              />
                            }
                            {errorDivHtml}
                          </td>
                        );
                        break;
                      case 4:  // TYPE_DATE
                        const mask_date = [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
                        memberHtml.push(
                          <td key={`${index}_2`} className={cn("staff-editor-content", `${item.name}-content`)} colSpan={item.colSpan} rowSpan={item.rowSpan}>
                            <MaskedInput 
                              id={item.name}
                              name={item.name}
                              mask={mask_date}
                              onChange={this.handleMaskedInputChange.bind(this, item.name)}
                              defaultValue={hasDefaultData? defaultData[item.name] : ""}
                            />
                            {errorDivHtml}
                          </td>
                        );
                        break;
                      case 5:  // TYPE_CHECK
                        memberHtml.push(
                          <td key={`${index}_2`} className="staff-editor-content" colSpan={item.colSpan? item.colSpan + 1 : 2} rowSpan={item.rowSpan}>
                            <div className="staff-editor-checkbox-content">
                              { item.value && item.value.length !== 0 &&
                                _.map(item.value, (item, index) => {
                                  return (
                                    <div key={index} className={`staff-editor-checkbox-${item.name}`} onClick={this.handleClickCheckBox.bind(this, item.name)}>
                                      <i className={cn("fa", values[item.name]? "fa-check-square-o" : "fa-square-o")} />
                                      <span>{item.title}</span>
                                    </div>
                                  );
                                })
                              }
                            </div>
                          </td>
                        );
                        break;
                      case 6:  // TYPE_MASK_INPUT
                        memberHtml.push(
                          <td key={`${index}_2`} className={cn("staff-editor-content", `${item.name}-content`)} colSpan={item.colSpan} rowSpan={item.rowSpan}>
                            <MaskedInput 
                              id={item.name}
                              name={item.name}
                              mask={item.mask}
                              onChange={this.handleInputChange.bind()}
                              defaultValue={hasDefaultData? defaultData[item.name] : ""}
                            />
                            {errorDivHtml}
                          </td>
                        );
                        break;
                      case 7:  // TYPE_NUMBER
                        memberHtml.push(
                          <td key={`${index}_2`} className={cn("staff-editor-content", `${item.name}-content`)} colSpan={item.colSpan} rowSpan={item.rowSpan}>
                            <MaskedInput 
                              id={item.name}
                              name={item.name}
                              mask={numMask}
                              onChange={this.handleInputChange.bind()}
                              defaultValue={hasDefaultData? defaultData[item.name] : ""}
                            />
                            {errorDivHtml}
                          </td>
                        );
                        break;
                      case 8:  // TYPE_SELECT
                        memberHtml.push(
                          <td key={`${index}_2`} className={cn("staff-editor-content", `${item.name}-content`)} colSpan={item.colSpan} rowSpan={item.rowSpan}>
                            <select
                              onChange={this.handleChangeSelect.bind(this, item.name)}
                              className="staff-editor-select"
                            >
                              {
                                _.map(item.data, (dataItem, dataIndex) => {
                                  if (hasDefaultData && defaultData[item.name] === dataItem.value) {
                                    return <option key={dataIndex} value={dataItem.value} checked>{dataItem.title}</option>
                                  } else {
                                    return <option key={dataIndex} value={dataItem.value}>{dataItem.title}</option>
                                  }
                                })
                              }
                            </select>
                            {errorDivHtml}
                          </td>
                        );
                        break; 
                      case 9:  // TYPE_TIME
                        const mask_time = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
                        memberHtml.push(
                          <td key={`${index}_2`} className={cn("staff-editor-content", `${item.name}-content`)} colSpan={item.colSpan} rowSpan={item.rowSpan}>
                            <MaskedInput 
                              id={item.name}
                              name={item.name}
                              mask={mask_time}
                              onChange={this.handleMaskedInputChange.bind(this, item.name)}
                              defaultValue={hasDefaultData? defaultData[item.name] : ""}
                            />
                            {errorDivHtml}
                          </td>
                        );
                        break;
                      case 10:  // TYPE_DATETIME
                        const mask_datetime = [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
                        memberHtml.push(
                          <td key={`${index}_2`} className={cn("staff-editor-content", `${item.name}-content`)} colSpan={item.colSpan} rowSpan={item.rowSpan}>
                            <MaskedInput 
                              id={item.name}
                              name={item.name}
                              mask={mask_datetime}
                              onChange={this.handleMaskedInputChange.bind(this, item.name)}
                              defaultValue={hasDefaultData? defaultData[item.name] : ""}
                            />
                            {errorDivHtml}
                          </td>
                        );
                        break;
                      default:
                        memberHtml.push(
                          <td key={`${index}_2`} className={cn("staff-editor-content", `${item.name}-content`)} colSpan={item.colSpan} rowSpan={item.rowSpan}>
                            <input 
                              id={item.name}
                              name={item.name}
                              onChange={this.handleInputChange.bind()}
                              defaultValue={hasDefaultData? defaultData[item.name] : ""}
                            />
                            {errorDivHtml}
                          </td>
                        );
                        break;
                    }
                  } else {

                  }
                });
                html.push(
                  <tr key={rowIndex}>
                    {memberHtml}
                  </tr>
                );
                return html;
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
}

StaffEditor.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  editingMode: PropTypes.bool,
  errors: PropTypes.object,
  defaultData: PropTypes.object,
  defaultValue: PropTypes.array,
  pRow: PropTypes.array,
  pProcessModified: PropTypes.func,
};

StaffEditor.defaultProps = {
  name: '',
  id: '',
  className: '',
  editingMode: true,
  errors: {},
  defaultData: {},
  defaultValue: [],
  pRow: [],
  pProcessModified: () => {},
};

/**
 * pRow attributes
  {
    name: 'XXX', // string
    title: 'XXX', // string
    colSpan: XXX, // number
    rowSpan: XXX // number
  }
*/

export default StaffEditor