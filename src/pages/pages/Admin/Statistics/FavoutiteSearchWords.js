import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import DateRangePicker from '../../../components/DateRange';

class FavouriteSearchWords extends Component {

  constructor(props) {
    super(props);
    const now = new Date();
    let monthAgo = new Date();
    monthAgo.setMonth( monthAgo.getMonth() - 1 );
    this.state = {
      sStartDate: moment( monthAgo ).format( 'YYYY-MM-DD' ),
      sEndDate: moment( now ).format( 'YYYY-MM-DD' ),
    }
  }

  getDataForRender = () => {
    const { pData } = this.props;
    const { sStartDate, sEndDate } = this.state;
    let result = [];
    _.map( pData, ( dataItem, dataIndex ) => {
      let count = 0;
      _.map( dataItem.dates, ( dateItem, dateIndex ) => {
        const startDate = new Date( sStartDate );
        const endDate = new Date( sEndDate );
        const crrDate = new Date( dateItem );
        if ( moment( startDate ).isSameOrBefore( moment( crrDate ) ) && moment( endDate ).isSameOrAfter( moment( crrDate ) ) ) {
          count++;
        }
      });
      if ( count ) {
        result.push({
          title: dataItem.title,
          count,
        });
      }
    });
    return result;
  }
  
  handleChangeDateRange = ( aStartDate, aEndDate ) => {
    const startDate = moment( aStartDate ).format( 'YYYY-MM-DD' );
    const endDate = moment( aEndDate ).format( 'YYYY-MM-DD' );
    this.setState({
      sStartDate: startDate,
      sEndDate: endDate,
    })
  }

  render() {
    const { id } = this.props;
    const { sStartDate, sEndDate } = this.state;
    const data = this.getDataForRender();
    return (
      <div id={id} className='container-component-favourite-search-words'>
        <div className='favourite-search-words-header'>
          <div/>
          <DateRangePicker
            className='statistic-daterange'
            onApply={this.handleChangeDateRange}
            hasDefaultRange={true}
            startDate={sStartDate}
            endDate={sEndDate}
          />
        </div>
        <div className='favourite-search-words-container'>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>검색어</th>
                <th>조회수</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0?
              _.map( data, ( dataItem, dataIndex ) => {
                return (
                  <tr key={dataIndex}>
                    <td>{dataIndex + 1}</td>
                    <td>{dataItem.title}</td>
                    <td>{dataItem.count}</td>
                  </tr>
                )
              })
              :
              <tr>
                <td colSpan='3'>검색어가 없습니다.</td>
              </tr>
              }
            </tbody>
          </table>
        </div>
       </div>
    );
  }
}

FavouriteSearchWords.propTypes = {
  id: PropTypes.string,
  pData: PropTypes.array,
};

FavouriteSearchWords.defaultProps = {
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
)(FavouriteSearchWords);