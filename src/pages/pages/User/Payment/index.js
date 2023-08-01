import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import BeerTable, { MODE_DATA, TYPE_DATETIME } from '../../../components/BeerTable';
import PaymentDetailModal from './PaymentDetailModal';
import { executeQuery } from '../../../../library/utils/fetch';
import _ from 'lodash';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Loading from '../../../components/Loading';

class Payment extends Component {
	constructor(props) {
		super(props)
		this.state = {
      sIsShowDetailModal: false,
      sFetchStatus: false,
      sData: [],
      sPubData: '',
    };
    this.paymentColumns = [
      {
        title: '날짜',
        name: 'updatedAt',
        type:TYPE_DATETIME
      },
      {
        title: '매장',
        name: 'pubId.name',
        clickFunc: this.handleClickShowDetail,
        className: 'payment-show-detail'
      },
      {
        title: '결제구분',
        name: 'paymentType',
        customRender: this.renderPaymentType
      },
      {
        title: '결제금액',
        name: 'paidMoney',
        thousandNumber: true,
      },
      {
        title: '포인트',
        name: 'usedPoint',
      },
    ]
  }
  
  componentDidMount = () => {
    this.getPaymentData(this.props);
  }

  componentWillReceiveProps = (newProps) => {
    this.getPaymentData(newProps)
  }

  renderPaymentType = (value, dataItem, columnItem) => {
    if ( value === 'CASH' ) {
      return (
      <span>{'현금결제'}</span>
      );
    } else if ( value === 'CARD' ) {
      return (
      <span>{'카드결제'}</span>
      );
    }
  }

  getPaymentData = (aProps) => {
    const userId = _.get( aProps, 'user._id' ) || '';
    if (userId) {
      executeQuery({
        method: 'get',
        url: `/payment/fetchlist?uid=${userId}`,
        success: (res) => {
          const result = _.get(res, 'payments') || [];
          this.setState({ 
            sData: result,
            sFetchStatus: true,
           });
        },
        fail: (err, res) => {
  
        }
      })
    }
  }


	/**
	 * handle functions
	 **/
  handleClickShowDetail = ( value, dataItem, columnItem ) => {
    this.setState({ 
      sIsShowDetailModal: true,
      sPubData: dataItem,
     });
  }

  handleModalShowChange = ( aState ) => {
		this.setState({
			sIsShowDetailModal: aState,
		});
	}

	/**
	 * render functions
	 **/
	render() {
    const { sData, sIsShowDetailModal, sFetchStatus, sPubData } = this.state;
    if (sFetchStatus) {
      return (
        <div>
          <div className="container-page-user-payment">
            <div className="payment-table-title">결제정보</div>
            <BeerTable
              onRef={(ref) => {this.beerTable = ref}}
              mode={MODE_DATA}
              pColumns={this.paymentColumns}
              pData={sData}
            />
          </div>
          {
            sIsShowDetailModal &&
            <PaymentDetailModal
              pPubData = {sPubData}
              handleModalClose={this.handleModalShowChange}
            />
          }
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

Payment.propTypes = {
};

Payment.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(Payment);