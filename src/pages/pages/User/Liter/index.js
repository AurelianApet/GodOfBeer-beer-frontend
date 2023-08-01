import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import BeerTable, { MODE_DATA, TYPE_DATETIME, TYPE_NUMBER } from '../../../components/BeerTable';
import { executeQuery } from '../../../../library/utils/fetch';
import _ from 'lodash';
import { compose } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import Loading from '../../../components/Loading';
import { maskNumber } from '../../../../library/utils/masks';

class Liter extends Component {
	constructor(props) {
		super(props)
		this.state = {
      sData: [],
      sMonth: 0,
      sYear: 0,
      sFetchStatus: false,
    };
    this.columns = [
      {
        title: '날짜',
        name: 'updatedAt',
        type:TYPE_DATETIME
      },
      {
        title: '매장',
        name: 'pubId.name',
      },
      {
        title: '적립',
        name: 'save',
        type: TYPE_NUMBER,
        thousandNumber: true,
      },
      {
        title: '누적 리터리지',
        name: 'storedSave',
        type: TYPE_NUMBER,
        thousandNumber: true,
      },
    ]
  }
  
  componentDidMount = () => {
    this.getPaymentData(this.props);
  }

  componentWillReceiveProps = (newProps) => {
    this.getPaymentData(newProps)
  }

  getPaymentData = (aProps) => {
    const userId = _.get( aProps, 'user._id' ) || '';
    if (userId) {
      executeQuery({
        method: 'get',
        url: `/payment/fetchlist?uid=${userId}`,
        success: (res) => {
          const result = _.get(res, 'payments') || [];
          let sortResult = _.orderBy(result, ['updatedAt'], ['asc']);
          let storedSave = 0;
          let filteredResult = [];
          _.map(sortResult, (paymentItem, paymentIndex) => {
            paymentItem.save = 0;
            _.map(paymentItem.menuIds, (beerItem, beerIndex) => {
              if (beerItem.bottleType === 'Draft') {
                paymentItem.save += beerItem.capacity * beerItem.amount;
              }
            })
            storedSave += paymentItem.save;
            paymentItem.storedSave = storedSave;
            if ( paymentItem.save ) {
              filteredResult.push( paymentItem );
            }
          })
          const finalSortResult = _.orderBy(filteredResult, ['updatedAt'], ['desc']);
          this.setState({ 
            sData: finalSortResult,
            sFetchStatus: true,
          });
          this.getStoredData();
        },
        fail: (err, res) => {
  
        }
      })
    }
  }

  getStoredData = () => {
    const { sData } = this.state;
    let monthArray = [];
    let yearArray = [];
    let monthBeforeNow = new Date();
    let yearBeforeNow = new Date();
    monthBeforeNow.setMonth( monthBeforeNow.getMonth() - 1 );
    yearBeforeNow.setFullYear( yearBeforeNow.getFullYear() - 1 );
    _.map( sData , (item, index) => {
      const date = new Date(_.get(item, 'updatedAt'));
      if (moment(date).isAfter(monthBeforeNow)) {
        monthArray.push(item.storedSave);
      }
      if (moment(date).isAfter(yearBeforeNow)) {
        yearArray.push(item.storedSave);
      }
    })
    this.setState({ 
      sMonth: monthArray[0],
      sYear: yearArray[0]
     })
  }

	/**
	 * handle functinos
	 **/

	/**
	 * process functions
	 **/


	/**
	 * render functions
	 **/
	render() {
    const { sData, sYear, sMonth, sFetchStatus } = this.state;
    const userName = _.get( this.props, 'user.realName' ) || '';
    if (sFetchStatus) {
      return (
        <div>
          <div className="container-page-user-liter">
            <div className="total-liter-user-interface">
              <div className="liter-content-title"><span>{userName}님의 리터리지</span></div>
              <div className="liter-content">
                <div className="store-liter-show-point align-center"><span>{maskNumber(_.get(sData, '[0].storedSave') || '0')}ml</span></div>
                <div className="total-liter-content">
                  <div className="align-center">
                    <span>Total</span>
                    <span>This year</span>
                    <span>This month</span>
                  </div>
                  <div className="align-center">
                    <span>{maskNumber(_.get(sData, '[0].storedSave') || '0')}</span>
                    <span>{maskNumber(sYear)}</span>
                    <span>{maskNumber(sMonth)}</span>
                  </div>
                </div>
              </div>
            </div>
            <BeerTable
              onRef={(ref) => {this.beerTable = ref}}
              mode={MODE_DATA}
              pColumns={this.columns}
              pData={sData}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="loading-wrapper"> 
          <Loading />
        </div>
      )
    }
	}
}

Liter.propTypes = {
};

Liter.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(Liter);