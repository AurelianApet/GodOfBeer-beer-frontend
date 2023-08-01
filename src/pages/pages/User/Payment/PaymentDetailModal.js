import React, { Component }     from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';

import { 
  Modal, 
  ModalHeader, 
  ModalBody 
} from '../../../components/Modal';
import { maskNumber } from '../../../../library/utils/masks';

export class UpadateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sIsVisible: true,
    }
  }

  componentDidMount = () => {
  }

  closeUpdateModal = ( aState, e ) => {
    if ( e ) {
      e.preventDefault();
    }
    this.setState({ 
      sIsVisible: false 
    });
    this.props.handleModalClose( false, aState );
  }
  
  render() {
    const { sIsVisible } = this.state;
    const { pPubData } = this.props;
    const orderMenus = _.get(pPubData, 'menuIds') || [];
   
    let totalSum = 0;
    return (
      <div className='container-detail-modal'>
        <Modal
          isOpen={sIsVisible}
          toggle={this.closeUpdateModal}
          className='detail-modal'
        >
          <ModalHeader 
            toggle={this.closeUpdateModal} 
            className='detail-modal-header'
          >
            <div className='detail-modal-title'>{ '결제상세보기(영수증)' }</div>
          </ModalHeader>
          <ModalBody className='detail-modal-body'>
            <div className='detail-form'>
              <div>매장명: {_.get(pPubData, 'pubId.name') || ''}</div>
              <div>사업자: {_.get(pPubData, 'pubId.uid.businessNumber') || ''}</div>
              <div>결제일: {moment(new Date(_.get(pPubData, 'updatedAt'))).format('YYYY-MM-DD HH:MM')}</div>
              <table>
                <thead>
                  <tr className="menu-title">
                    <td>메뉴</td>
                    <td>수량</td>
                    <td style={{textAlign:'right'}}>금액</td>
                  </tr>
                </thead>
                <tbody>
                {
                  _.map(orderMenus, (item, storeIndex) => {
                    if ( item.type === 'beer' ) {
                      totalSum += item.price * item.amount;
                      return (
                        <tr key={`beerStore ${storeIndex}`}>
                          <td>{item.name}</td>
                          <td>{item.amount}</td>
                          <td style={{textAlign:'right'}}>{maskNumber(item.price)}</td>
                        </tr>
                      )
                    }
                  })
                }
                {
                  _.map(orderMenus, (item, storeIndex) => {
                    if ( item.type === 'food' ) {
                      totalSum += item.price * item.amount;
                      return (
                        <tr key={`footStore ${storeIndex}`}>
                          <td>{item.name}</td>
                          <td>{item.amount || 1}</td>
                          <td style={{textAlign:'right'}}>{maskNumber(item.price)}</td>
                        </tr>
                      )
                    }
                  })
                }
                <tr className = "total-sum">
                  <td>합계</td>
                  <td></td>
                  <td style={{textAlign:'right'}}>{maskNumber(totalSum)}</td>
                </tr>
                <tr>
                  <td>신용카드</td>
                  <td></td>
                  <td style={{textAlign:'right'}}>{maskNumber(_.get(pPubData, 'paidMoney') || '')}</td>
                </tr>
                </tbody>
              </table>
              {
                _.get(pPubData, 'paymentType') === 'CARD' &&
                <div>
                  <div>{`카드종류: ${_.get(pPubData, 'cardKind') || ''}`}</div>
                  <div>{`카드번호: ${_.get(pPubData, 'cardNumber') || ''}`}</div>
                  <div>{`할부개월: ${_.get(pPubData, 'monthlyPay')? (_.get(pPubData, 'monthlyPay') + '개월') : '일시불'}`}</div>
                  <div>{`승인번호: ${_.get(pPubData, 'approvalNumber') || ''}`}</div>
                </div>
              }
            </div>
            <div className='detail-modal-operation-buttons'>
              <div className='detail-modal-save-button' onClick={this.closeUpdateModal}>확인</div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

UpadateModal.propTypes = {
  pPubId : PropTypes.string,
  handleModalClose: PropTypes.func,
};

UpadateModal.defaultProps = {
  pPubId: '',
  handleModalClose: () => {},
};


export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(UpadateModal);
