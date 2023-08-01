import React, { Component } from 'react';
import _ from 'lodash';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { defineDaysOfMonth } from '../../../library/utils/dateTime'
import {maskNumber, numberUnmask} from '../../../library/utils/masks';

class BeerCalendar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sDay: [],
      sWeek: [],
      sStartDay: 0,
      sEndDay: 0,
      sMonthDay: 0,
      sTableSize: 0
    };
    this.weekName = [
      {title: '일요일'},
      {title: '월요일'},
      {title: '화요일'},
      {title: '수요일'},
      {title: '목요일'},
      {title: '금요일'},
      {title: '토요일'}
    ]
    this.tableWidth = 0;
  }

  componentDidMount = () => {
    this.updateDimensions();
    this.handleMonthOfDay(this.props);
    window.addEventListener( 'resize', this.updateDimensions);
  }

  componentWillReceiveProps = (newProps) => {
    this.updateDimensions();
    if (!_.isEqual(this.props.pDate, newProps.pDate)) {
      this.handleMonthOfDay(newProps);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions)
  }

  updateDimensions = (e) => {
    const containerElement = window.getElementFromId( 'beerCalendarBody' );
    this.tableWidth = containerElement[0].clientWidth / 14;
    this.setState({
      sTableSize: this.tableWidth
    })
  }

  handleMonthOfDay = (aProps) => {
    const { pDate } = aProps;
    let aWeekArray = [];
    let aDayArray = [];
    const date = defineDaysOfMonth(pDate.year, pDate.month);
    const weekNum = Math.floor((date.days + date.startDay + (6 - date.endDay)) / 7)
    for (let i = 0; i < weekNum; i ++) {
      aWeekArray.push({
        item: i,
      })
    }
    for (let i = 1; i <= 7; i ++) {
      aDayArray.push({
        item: i,
      })
    }
    this.setState({
      sDay: aDayArray,
      sWeek: aWeekArray,
      sStartDay: date.startDay,
      sEndDay: date.endDay,
      sMonthDay: date.days
    })
  }

  renderHeadTable = () => {
    const { sTableSize } = this.state;
    const { pDate, pAdditionalField } = this.props;
    return(
        <thead>
        <tr>
          <th className = 'table-head-title' style={{fontSize: Math.max( sTableSize / 5, 14 )}} colSpan = {pAdditionalField? '9' : '8'}>
            {`${pDate.year}년 ${pDate.month}월`}
          </th>
        </tr>
        <tr>
          {
            _.map(this.weekName, (name, index) => {
              return (
                  <th className = 'table-head-style' key = {`${index} weekName`} style={{fontSize: Math.max( sTableSize / 6, 14 )}} >{name.title}</th>
              )
            })
          }
          {pAdditionalField && <th></th>}
        </tr>
        </thead>
    )
  }

  renderBodyTable = () => {
    const { sDay, sWeek, sStartDay, sEndDay, sMonthDay, sTableSize } = this.state;
    const { pContent, pAdditionalField, pWeekCustomRender, pDayCustomRender,pFinalCustomRender, pHandleClickCalendarCell, pDatePosition } = this.props;
    return (
        <tbody id = 'tableBody'>
        {
          _.map(sWeek, (week, weekIndex) => {
            let startDate = null;
            let endDate = null;
            let resultHtml = [];
            _.map(sDay, (day, dayIndex) => {
              let totalDay = day.item + week.item * 7 - sStartDay;
              if ( dayIndex === 0 ) {
                startDate = totalDay > 0? totalDay : 1;
              } else if ( dayIndex === 6 ) {
                endDate = totalDay <= sMonthDay? totalDay : sMonthDay;
              }
              if (totalDay > 0 && totalDay <= sMonthDay) {
                let content = pContent[totalDay - 1] || {};
                resultHtml.push(
                  <td 
                    key = {`${weekIndex} ${dayIndex} week`} 
                    style={{height:sTableSize, width: sTableSize}}
                    onClick={pHandleClickCalendarCell.bind(this, totalDay, 0)}
                  >
                    <div className = {cn('calendar-day', `calendar-day-${pDatePosition}`)} style={{fontSize: Math.max( sTableSize / 6, 14 )}}>{totalDay}</div>
                    <div className = 'calendar-content' style={{fontSize: Math.max( sTableSize / 6, 14 )}}>
                      <span>{maskNumber(content.day_sum)}</span>
                    </div>
                  </td>
                );
              } else {
                resultHtml.push(
                    <td key = {`${weekIndex} ${dayIndex} week`} >
                      {''}
                    </td>
                )
              }
            });
            if ( pAdditionalField ) {
              resultHtml.push(
                <td key={`additional-td-${weekIndex}`} style={{height:sTableSize, width: sTableSize}} onClick={pHandleClickCalendarCell.bind(this, week.item + 1, 1)}>{pWeekCustomRender( week.item + 1, startDate, endDate )}</td>
                // <td key={`additional-td-${weekIndex}`} style={{height:sTableSize, width: sTableSize}}>{pWeekCustomRender( week.item + 1, startDate, endDate )}</td>
              )
            }

            return (
                <tr key = {`${weekIndex} weekIndex`} >
                  {resultHtml}
                </tr>
            )
          })
        }
        {pAdditionalField &&
          <tr>
            {
              _.map(sDay, (day, dayIndex) => {
                return (
                  <td key={`day-custom-td-${dayIndex}`} style={{height:sTableSize, width: sTableSize}} onClick={pHandleClickCalendarCell.bind(this, day.item - 1, 2)}>{pDayCustomRender(day.item - 1)}</td>
                  // <td key={`day-custom-td-${dayIndex}`} style={{height:sTableSize, width: sTableSize}}>{pDayCustomRender(day.item - 1)}</td>
                )
              })
            }
            <td key='final-td' style={{height:sTableSize, width: sTableSize}} onClick={pHandleClickCalendarCell.bind(this, 0, 3)}>{pFinalCustomRender(sStartDay, sEndDay, sMonthDay)}</td>
            {/* <td key='final-td' style={{height:sTableSize, width: sTableSize}}>{pFinalCustomRender(sStartDay, sEndDay, sMonthDay)}</td> */}
          </tr>
        }
        </tbody>
    )
  }

  render() {
    return (
        <div id='beerCalendarBody' className = 'container-beer-calendar-body'>
          <table>
            { this.renderHeadTable() }
            { this.renderBodyTable() }
          </table>
        </div>
    );
  }
}

BeerCalendar.propTypes = {
  pAdditionalField: PropTypes.bool,
  pDatePosition: PropTypes.string,
  pDate: PropTypes.object,
  pContent: PropTypes.object,
  pWeekCustomRender: PropTypes.func,
  pDayCustomRender: PropTypes.func,
  pFinalCustomRender: PropTypes.func,
  pHandleClickCalendarCell: PropTypes.func,
};

BeerCalendar.defaultProps = {
  pAdditionalField: false,
  pDatePosition: 'rt',  // rt-right top, rm-right middle, rb-right bottom, ct-center top, cm-center middle, cb-center bottom, lt-left top, lm-left middle, lb-left bottom
  pDate: {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1},
  pContent: {},
  pWeekCustomRender: () => {},
  pDayCustomRender: () => {},
  pFinalCustomRender: () => {},
  pHandleClickCalendarCell: () => {},
};

export default BeerCalendar
