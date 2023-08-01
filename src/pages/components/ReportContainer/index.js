import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import LANG from '../../../language';

class ReporterContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      
    };  
  }

  componentDidMount() {

  }

  defineDaysOfMonth =(aDate) => {
    if (!aDate) return {days: 31, startDay: 0};
    const firstFourLetter = aDate.substring(0, 4);
    const year = Number(firstFourLetter);
    let month = 1;
    for (let i = aDate.length ; i-- ; i > 0) {
      if (!Number(aDate[i])){
        month = Number(aDate.substring(i + 1, aDate.length));
        break;
      } 
    }
    if( year < 1900 || year > 2500 || month < 1 || month > 12) return 31;
    const isLeap = new Date(year, 1, 29).getMonth() === 1;
    const startDay = new Date(year, month - 1, 1).getDay();
    switch(month) {
      case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        return {days: 31, startDay: startDay};
      case 4: case 6: case 9: case 11:
        return {days: 30, startDay: startDay};
      case 2:
        return {days: isLeap? 29 : 28, startDay: startDay};
      default:
        break;
    }
  }

  handleClickCell = (aData, aIndex, e) => {
    const { pHandleClickCell } = this.props;
    pHandleClickCell(aData, aIndex);
  }

  renderHeader = () => {
    const { pDate, pHandleClickColumn } = this.props;
    const totalDaysOfMonth = this.defineDaysOfMonth(pDate)
    let days = [];
    for (let i = 1; i < totalDaysOfMonth.days + 1; i++) days.push(i);
    return (
      _.map(days, (item, index) => {
        return (
          <th key={index} className={cn((item + 7 + totalDaysOfMonth.startDay - 1) % 7 === 0? "th-sunday" : "")} onClick={pHandleClickColumn.bind(this, index)}>{item}</th>
        )
      })
    );
  }

  renderBody = () => {
    const { pReportData, pDate } = this.props;
    const totalDaysOfMonth = this.defineDaysOfMonth(pDate)
    let days = [];
    for (let i = 1; i < totalDaysOfMonth.days + 1; i++) days.push(i);
    return (
      _.map(pReportData.data, (itemData, indexData) => {
        return (
          <tr key={indexData}>
            <td>{indexData + 1}</td>
            <td>{_.get(itemData, pReportData.titleKey)}</td>
            {
              _.map(days, (itemCell, indexCell) => {
                return this.renderReportCell(itemData, indexCell);
              })
            }
          </tr>
        )
      })
    )
  }

  renderReportCell = (aData, aIndex) => {
    const { pCustomRenderCell, pReportData } = this.props;
    let hasReported = false;
    const data = _.get(aData, pReportData.dataKey);
    _.map(data, (itemData, indexData) => {
      if (itemData.value === aIndex + 1){
        hasReported = true;
      }
    })
    return <td key={aIndex} className={cn(hasReported? "td-reported" : "")} onClick={this.handleClickCell.bind(this, aData, aIndex)} >{pCustomRenderCell(aData, aIndex)}</td>
  }

  render() {
    const { className, pItemTitle } = this.props;
    return (
      <div className={cn("component-report-container", className)}>
        <table className="report-container-table">
          <thead>
            <tr>
              <th className="no-th">{LANG('COMP_REPORT_CONTAINER_NO')}</th>
              <th className="title-th">{pItemTitle}</th>
              {this.renderHeader()}
            </tr>
          </thead>
          <tbody>
            {this.renderBody()}
          </tbody>
        </table>
      </div>
    );
  }
}

ReporterContainer.propTypes = {
  pDate: PropTypes.string,
  pItemTitle: PropTypes.string,
  pReportData: PropTypes.object,
  pCustomRenderCell: PropTypes.func,
  pHandleClickCell: PropTypes.func,
  pHandleClickColumn: PropTypes.func,
};

ReporterContainer.defaultProps = {
  pDate: "",
  pItemTitle: "",
  pReportData: {},
  pCustomRenderCell: () => {},
  pHandleClickCell: () => {},
  pHandleClickColumn: () => {},
};

export default ReporterContainer