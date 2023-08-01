import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import DateRangePicker from '../../../components/DateRange';

class FavouriteUsers extends Component {

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
    let result = {};
    _.map( pData, ( dataItem, dataIndex ) => {
      result[dataIndex] = [];
      _.map( dataItem, ( item, index ) => {
        let count = 0;
        _.map( item.dates, ( dateItem, dateIndex ) => {
          const startDate = new Date( sStartDate );
          const endDate = new Date( sEndDate );
          const crrDate = new Date( dateItem );
          if ( moment( startDate ).isSameOrBefore( moment( crrDate ) ) && moment( endDate ).isSameOrAfter( moment( crrDate ) ) ) {
            count++;
          }
        });
        if ( count ) {
          result[dataIndex].push({
            title: item.title,
            count,
          });
        }
      })
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

  renderFavouriteItem = ( aData, aKey, aTitle ) => {
    const targetData = _.get( aData, aKey ) || [];
    const orderedData = _.orderBy( targetData, ['count', 'title'], ['desc', 'adc'] );
    return (
      <div className='favourite-users-item'>
        <div className='favourite-users-title'>{aTitle}</div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>조회대상</th>
              <th>조회수</th>
            </tr>
          </thead>
          <tbody>
            {orderedData.length > 0?_.map( orderedData, ( dataItem, dataIndex ) => {
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
              <td colSpan='3'>조회한 대상이 없습니다.</td>
            </tr>
            }
          </tbody>
        </table>
      </div>
    )
  }

  render() {
    const { id } = this.props;
    const { sStartDate, sEndDate } = this.state;
    const data = this.getDataForRender();
    return (
      <div id={id} className='container-component-favourite-users'>
        <div className='favourite-users-header'>
          <div/>
          <DateRangePicker
            className='statistic-daterange'
            onApply={this.handleChangeDateRange}
            hasDefaultRange={true}
            startDate={sStartDate}
            endDate={sEndDate}
          />
        </div>
        <div className='favourite-users-container'>
          {this.renderFavouriteItem( data, 'beer', '맥주' )}
          {this.renderFavouriteItem( data, 'brewery', '브루어리' )}
          {this.renderFavouriteItem( data, 'pub', '매장' )}
        </div>
      </div>
    );
  }
}

FavouriteUsers.propTypes = {
  id: PropTypes.string,
  pData: PropTypes.object,
};

FavouriteUsers.defaultProps = {
  id: '',
  pData: {},
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(FavouriteUsers);