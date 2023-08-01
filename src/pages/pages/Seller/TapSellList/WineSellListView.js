import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import moment from 'moment';
import DateRangePicker from '../../../components/DateRange';
import {executeQuery} from '../../../../library/utils/fetch';
import {maskNumber, numberUnmask} from '../../../../library/utils/masks';
import BeerTable, { MODE_DATA, TYPE_NUMBER, TYPE_NO , TYPE_DATE} from '../../../components/BeerTable';

class WineSellListView extends Component {

  constructor(props) {
    super(props);
    let startDateOfMonth = new Date();
    startDateOfMonth.setDate(1);
    let endDateOfMonth = new Date();
    endDateOfMonth.setMonth(endDateOfMonth.getMonth() + 1);
    endDateOfMonth.setDate(1);
    endDateOfMonth.setDate(endDateOfMonth.getDate() - 1);
    this.state = {
        sStartDate: moment(startDateOfMonth).format('YYYY-MM-DD'),
        sEndDate: moment(endDateOfMonth).format('YYYY-MM-DD'),
        sWineList: [],
        sTotalAmount: 0
    }
  }

  componentDidMount = () => {
      const {sStartDate, sEndDate} = this.state;
      this.getWineInfo(sStartDate, sEndDate);
  }

  getWineInfo = (startdate, enddate) => {
    const userId = _.get(this.props, 'user._id') || '';
    executeQuery({
        method: 'post',
        url: `/tap/tap-sellbeer`,
        data: {
            id : userId,
            start_date: startdate,
            end_date: enddate
        },
        success: (res) => {
            const beerList = _.get(res, 'beerList') || [];
            const totalAmount = _.get(res, 'totalAmount') || 0;
            this.setState({
                sWineList: beerList,
                sTotalAmount: totalAmount,
                sStartDate: startdate,
                sEndDate: enddate,
            })
        },
        fail: (err) => {

        }
    })
  }
  
  handleChangeDateRange = (aStartDate, aEndDate) => {
    const startDate = moment(aStartDate).format('YYYY-MM-DD');
    const endDate = moment(aEndDate).format('YYYY-MM-DD');
    this.getWineInfo(startDate, endDate);
};

render() {
    const {sWineList, sTotalAmount, sStartDate, sEndDate} = this.state;
    return (
      <div className='container-page-pubmanager'>
        <div className = 'container-page-pubmanager-background'>
            <div>
                <div className='period-statistic-header seller-statistic-header'>
                <div className='seller-statistic-title'></div>
                    <DateRangePicker
                        className='statistic-daterange'
                        onApply={this.handleChangeDateRange}
                        hasDefaultRange={true}
                        startDate={sStartDate}
                        endDate={sEndDate}
                    />
                </div>
            </div>
          {
            <BeerTable
              onRef={(ref) => {this.beerTable = ref}}
              mode={MODE_DATA}
              pData={sWineList}
              pColumns={[
                {
                  type: TYPE_NO,
                  title: 'NO.'
                },
                {
                  name: 'product_name',
                  title: 'Name',
                  className: 'pub-detail-show',
                  clickFunc: this.pubDetailShow
                },
                {
                  name: 'amount',
                  title: '판매수량', 
                  type: TYPE_NUMBER
                },
              ]}
            />
          }
          <div className='row'>
              <div className='col-md-offset-8 col-md-4'>
                <div className = 'pub-data-info-title'>합계&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{sTotalAmount} kegs</div>              
              </div>
          </div>
        </div>
      </div>
    );
  }
}

WineSellListView.propTypes = {
};

WineSellListView.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(WineSellListView);