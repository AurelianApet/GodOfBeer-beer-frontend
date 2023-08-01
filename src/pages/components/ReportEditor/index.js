import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import $ from 'jquery';

import { Button } from '../Button';

import LANG from '../../../language';

let globalValue = {};
let globalColumns = [];
let globalRows = [];

export const getCurrentReportValues = () => {
  let result = [];
  _.map(globalRows, (rowItem, rowIndex) => {
    let tmp = {};
    _.map(globalColumns, (columnItem, columnIndex) => {
      const fieldName = columnItem.name.split('.')[0];
      tmp[fieldName] = globalValue[`reportContainer_${fieldName}_${rowIndex}`];
    })
    result.push(tmp);
  })
  return result;
}

class ReportEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sStatus: false,
      sDefaultValue: {},
    };
    globalValue = {};
  }

  componentDidMount() {
    this.setGlobalData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (!_.isEqual(newProps.pRows, this.props.pRows)) this.setGlobalData(newProps);
  }

  setGlobalData = (aProps) => {
    globalColumns = aProps.pHeaders;
    globalRows = aProps.pRows;
    globalValue = {};
    _.map(aProps.pRows, (rowItem, rowIndex) => {
      _.map(rowItem, (item, index) => {
        if(index !== "minHeight") {
          globalValue[`reportContainer_${index}_${rowIndex}`] = item? item : "";
        }
      })
    })
    setTimeout(() => {
      _.map(globalValue, (item, index) => {
        $(`#${index}`).val(item);
      })
    }, 100);
  }

  handleReportContentChange = (aRow, e) => {
    globalValue[e.target.name] = e.target.value;
  }

  handleCommit = (aData) => {
    const { pHandleCommit } = this.props;
    pHandleCommit(aData);
  }

  renderHeaderItem = (aItem, aIndex) => {
    const widthStyle = _.get(aItem, "width");
    const alignStyle = _.get(aItem, 'align');
    return (
      <th key={aIndex} style={{width: !!widthStyle? `${widthStyle}px` : "", textAlign: !!alignStyle? alignStyle : ""}}>{aItem.title}</th>
    )
  }

  renderBody = (aRow, aRowIndex) => {
    const { pHeaders } = this.props;
    const { sDefaultValue } = this.state;
    const minHeightStyle = _.get(aRow, 'minHeight');
    let resultHtml =[];
    _.map(pHeaders, (headerItem, headerIndex) => {
      const defaultValue = _.get(aRow, headerItem.name);
      resultHtml.push(
        <td key={headerIndex}>
          {headerItem.isEditable?
            <textarea
              name={`reportContainer_${headerItem.name}_${aRowIndex}`}
              id={`reportContainer_${headerItem.name}_${aRowIndex}`}
              className="report-container"
              label=""
              style={{
                minHeight: !!minHeightStyle? minHeightStyle : '', 
              }}
              onChange={this.handleReportContentChange.bind(this, aRow)}
              defaultValue={sDefaultValue[`reportContainer_${headerItem.name}_${aRowIndex}`]}
            />
            :
            defaultValue
          }
        </td>
      )
    })
    
    return (
      <tr key={aRowIndex}>
        {resultHtml}
      </tr>
    )    
  }

  render() {
    const { className, pHeaders, pRows, pButtonTitle, pHasCommitButton } = this.props;
    const hasValue = pRows && pRows.length !== 0;
    return (
      <div className={cn("component-report-editor", className)}>
        {pHasCommitButton &&
          <Button 
            className="report-editor-commit-button" 
            onClick={this.handleCommit.bind(this, globalValue)}
          >
            {pButtonTitle}
          </Button>
        } 
        <table className="container-report-editor-table">
          <thead>
            <tr>
              {
                _.map(pHeaders, (headerItem, headerIndex) => {
                  return this.renderHeaderItem(headerItem, headerIndex);
                })
              }
            </tr>
          </thead>
          <tbody>
            {hasValue &&
              _.map(pRows, (rowItem, rowIndex) => {
                return this.renderBody(rowItem, rowIndex)
              })
            }
            {!hasValue &&
              <tr>
                <td colSpan={pHeaders.length}>
                  {LANG('COMP_TABLE_EMPTY')}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    );
  }
}

ReportEditor.propTypes = {
  pButtonTitle: PropTypes.string,
  pHasCommitButton: PropTypes.bool,
  pRows: PropTypes.array,
  pHeaders: PropTypes.array,
  pHandleCommit: PropTypes.func,
};

ReportEditor.defaultProps = {
  pButtonTitle: LANG('SAVE'),
  pHasCommitButton: true,
  pRows: [],
  pHeaders: [],
  pHandleCommit: () => {},
};

/**
 * pRow attributes
  {
    name: 'XXX', // string
    title: 'XXX', // string
    value: 'XXX', //string
    minHeight: XXX // number
  }
*/

export default ReportEditor