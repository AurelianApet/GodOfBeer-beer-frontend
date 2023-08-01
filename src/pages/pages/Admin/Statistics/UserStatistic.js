import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import DateTimeComponent, { VIEW_MODE_YEARS, VIEW_MODE_MONTHS } from '../../../components/Form/DateTime';
import NewChart, { CHART_SERIAL } from '../../../components/NewChart';
import { defineDaysOfMonth } from '../../../../library/utils/dateTime';

class UserStatistic extends Component {

  constructor(props) {
    super(props);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    this.state = {
      sYearStatisticInfo: {
        year,
      },
      sMonthStatisticInfo: {
        year,
        month,
      },
    }
  }

  getYearStatisticData = ( aYear ) => {
    const { pData } = this.props;
    let result = [];
    for ( let i = 0; i < 12; i++ ) {
      result.push({
        month: i + 1,
        pageView: 0,
        visitor: 0,
      });
    }
    _.map( pData, ( dataItem, dataIndex ) => {
      const crrDate = new Date( dataItem.dateString );
      if ( crrDate.getFullYear() === aYear ) {
        const crrMonth = crrDate.getMonth() + 1;
        result[crrMonth - 1].pageView += dataItem.pageView || 0;
        result[crrMonth - 1].visitor += dataItem.visitor || 0;
      }
    });
    return result;
  }

  getMonthStatisticData = ( aYear, aMonth ) => {
    const { pData } = this.props;
    const monthInfo = defineDaysOfMonth( aYear, aMonth );
    let result = [];
    for ( let i = 0; i < monthInfo.days; i++ ) {
      result.push({
        date: i + 1,
        pageView: 0,
        visitor: 0,
      });
    }
    _.map( pData, ( dataItem, dataIndex ) => {
      const crrDate = new Date( dataItem.dateString );
      const crrYear = crrDate.getFullYear();
      const crrMonth = crrDate.getMonth() + 1;
      if ( crrYear === aYear && crrMonth === aMonth ) {
        const date = crrDate.getDate();
        const crrTarget = result[date - 1];
        _.set( result, `[${date - 1}].pageView`, crrTarget.pageView || 0 + dataItem.pageView || 0 );
        _.set( result, `[${date - 1}].visitor`, crrTarget.visitor || 0 + dataItem.visitor || 0 );
      }
    });
    return result;
  }

  handleChangeYearStatisticDate = ( aTarget, aDate ) => {
    const date = new Date( aDate );
    const year = date.getFullYear();
    this.setState({
      sYearStatisticInfo: {
        year,
      }
    });
  }

  handleChangeMonthStatisticDate = ( aTarget, aDate ) => {
    const date = new Date( aDate );
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    this.setState({
      sMonthStatisticInfo: {
        year,
        month,
      }
    });
  }

  renderYearStatistic = ( aData ) => {
    let firstTr = [], secondTr = [], thirdTr = [];
    firstTr.push( <th key='none'></th> );
    secondTr.push( <th key='header'>방문자</th> );
    thirdTr.push( <th key='header'>페이지뷰</th> );
    _.map( aData, ( dataItem, dataIndex ) => {
      firstTr.push( <td key={dataIndex}>{`${dataItem.month}월`}</td> );
      secondTr.push( <td key={dataIndex}>{dataItem.visitor}</td> );
      thirdTr.push( <td key={dataIndex}>{dataItem.pageView}</td> );
    });
    return (
      <table className='statistic-result-table'>
        <tbody>
          <tr>{firstTr}</tr>
          <tr>{secondTr}</tr>
          <tr>{thirdTr}</tr>
        </tbody>
      </table>
    );
  }

  renderMonthStatistic = ( aData ) => {
    let firstTr = [], secondTr = [], thirdTr = [];
    firstTr.push( <th key='none'>날짜</th> );
    secondTr.push( <th key='header'>방문자</th> );
    thirdTr.push( <th key='header'>페이지뷰</th> );
    _.map( aData, ( dataItem, dataIndex ) => {
      firstTr.push( <td key={dataIndex}>{`${dataItem.date}`}</td> );
      secondTr.push( <td key={dataIndex}>{dataItem.visitor}</td> );
      thirdTr.push( <td key={dataIndex}>{dataItem.pageView}</td> );
    });
    return (
      <table className='statistic-result-table'>
        <tbody>
          <tr>{firstTr}</tr>
          <tr>{secondTr}</tr>
          <tr>{thirdTr}</tr>
        </tbody>
      </table>
    );
  }

  render() {
    const { id } = this.props;
    const { sYearStatisticInfo, sMonthStatisticInfo } = this.state;
    const yearData = this.getYearStatisticData( sYearStatisticInfo.year );
    const monthData = this.getMonthStatisticData( sMonthStatisticInfo.year, sMonthStatisticInfo.month );
    return (
      <div id={id} className='container-component-user-statistic'>
        <div className='user-year-statistic user-statistic-item'>
          <div className='user-statistic-header'>
            <div className='user-statistic-title'>연간통계</div>
            <DateTimeComponent
              onChange={this.handleChangeYearStatisticDate}
              timeFormat={false}
              dateFormat={'YYYY년'}
              defaultValue={`${sYearStatisticInfo.year}년`}
              viewMode={VIEW_MODE_YEARS}
            />
          </div>
          {this.renderYearStatistic( yearData )}
          <NewChart
            type={CHART_SERIAL}
            data={yearData}
            title={{
              visitor: '방문자',
              pageView: '페이지뷰',
            }}
            graphSetting={{
              mainAxis: 'month',
              graphType: {
                visitor: 'line',
                pageView: 'line',
              }
            }}
            theme={{
            }}
          />
        </div>
        <div className='user-month-statistic user-statistic-item'>
          <div className='user-statistic-header'>
            <div className='user-statistic-title'>월간통계</div>
            <DateTimeComponent
              onChange={this.handleChangeMonthStatisticDate}
              timeFormat={false}
              dateFormat={'YYYY년 MM월'}
              defaultValue={`${sMonthStatisticInfo.year}년 ${sMonthStatisticInfo.month}월`}
              viewMode={VIEW_MODE_MONTHS}
            />
          </div>
          {this.renderMonthStatistic( monthData )}
          <NewChart
            type={CHART_SERIAL}
            data={monthData}
            title={{
              visitor: '방문자',
              pageView: '페이지뷰',
            }}
            graphSetting={{
              mainAxis: 'date',
              graphType: {
                visitor: 'line',
                pageView: 'line',
              }
            }}
            theme={{
            }}
          />
        </div>
      </div>
    );
  }
}

UserStatistic.propTypes = {
  id: PropTypes.string,
  pData: PropTypes.array,
};

UserStatistic.defaultProps = {
  id: '',
  pData: [],
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(UserStatistic);