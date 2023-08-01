import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import {maskNumber, numberUnmask} from '../../../../library/utils/masks';
import {executeQuery} from '../../../../library/utils/fetch';

import BeerTable, { MODE_DATA, TYPE_NO , TYPE_DATE, TYPE_NUMBER} from '../../../components/BeerTable';
import DateRangePicker from '../../../components/DateRange';

class TapSellListView extends Component {

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
        sType: 0,
        sDetailTapList: [],
        sTapId: 0,
        sTapName: ''
    }
  }

  componentDidMount = () => {
  }

  pubDetailShow = (value, dataItem, columnItem) => {
      const {sType, sStartDate, sEndDate} = this.state;
      if(sType === 0) {
        this.getTapList(dataItem.id, sStartDate, sEndDate);
      }
  }

  getTapList = (tap_id, startdate, enddate) => {
    const userId = _.get(this.props, 'user._id') || '';
    console.log(userId + " " + tap_id + " " + startdate + " " + enddate);
    executeQuery({
        method: 'post',
        url: `/tap/tap-selldetail`,
        data: {
            user_id : userId,
            tap_id: tap_id,
            startdate: startdate,
            enddate: enddate
        },
        success: (res) => {
            const taplist = _.get(res, 'taplist') || [];
            const tapName = _.get(res, 'tapName') || '';
            this.setState({
                sDetailTapList: taplist,
                sTapId: tap_id,
                sStartDate: startdate,
                sEndDate: enddate,
                sTapName: tapName,
                sType: 1
            })
        },
        fail: (err) => {

        }
    })
  }

  handleChangeDateRange = (aStartDate, aEndDate) => {
      const {sTapId} = this.state;
      const startDate = moment(aStartDate).format('YYYY-MM-DD');
      const endDate = moment(aEndDate).format('YYYY-MM-DD');
      this.getTapList(sTapId, startDate, endDate);
  };
  
  render() {
    const {sTapList} = this.props;
    const {sType, sDetailTapList, sStartDate, sEndDate, sTapName} = this.state;
    let taplist = [];
    if(sType === 0) {
        taplist = sTapList;
    }
    else {
        taplist = sDetailTapList;
    }
    let totalCapacity = 0, totalPrice = 0;
    for(let i = 0 ; i < taplist.length ; i ++) {
        totalCapacity += taplist[i].sell_capacity;
        totalPrice += taplist[i].sell_price;
    }
    const totalText = maskNumber(totalCapacity) + " ml/ " + maskNumber(totalPrice) + "원";
    return (
      <div className='container-page-pubmanager'>
        <div className = 'container-page-pubmanager-background'>
            <div>
                {
                    sType === 1 &&
                    <div className='period-statistic-header seller-statistic-header'>
                    <div className='seller-statistic-title'>{sTapName}&nbsp;&nbsp;&nbsp;상세내역</div>
                        <DateRangePicker
                            className='statistic-daterange'
                            onApply={this.handleChangeDateRange}
                            hasDefaultRange={true}
                            startDate={sStartDate}
                            endDate={sEndDate}
                        />
                    </div>
                }
            </div>
          {
            <BeerTable
              onRef={(ref) => {this.beerTable = ref}}
              mode={MODE_DATA}
              pData={taplist}
              pColumns={[
                {
                  type: TYPE_NO,
                  title: 'NO.'
                },
                {
                  name: 'name',
                  title: 'Name',
                  className: 'pub-detail-show',
                  clickFunc: this.pubDetailShow
                },
                {
                  name: 'start_date',
                  title: '판매시작일', 
                },
                {
                  name: 'sell_period',
                  title: '판매기간', 
                },
                {
                  name: 'cup_sell_cnt',
                  title: '정량판매', 
                  type: TYPE_NUMBER
                },
                {
                  name: 'ml_sell_cnt',
                  title: 'ml판매', 
                  type: TYPE_NUMBER
                },
                {
                  name: 'out_capacity',
                  title: '추출', 
                  type: TYPE_NUMBER
                },
                {
                  name: 'cancel_capacity',
                  title: '취소', 
                  type: TYPE_NUMBER
                },
                {
                  name: 'sell_capacity',
                  title: '판매', 
                  type: TYPE_NUMBER
                },
                {
                  name: 'sell_price',
                  title: '판매금액', 
                  type: TYPE_NUMBER
                },
              ]}
            />
          }
          <div className='row'>
              <div className='col-md-offset-8 col-md-4'>
                <div className = 'pub-data-info-title'>합계&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{totalText}</div>              
              </div>
          </div>
        </div>
      </div>
    );
  }
}

TapSellListView.propTypes = {
};

TapSellListView.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(TapSellListView);