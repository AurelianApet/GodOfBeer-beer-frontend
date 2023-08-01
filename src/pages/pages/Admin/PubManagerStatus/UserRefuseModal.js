import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { 
  Modal, 
  ModalHeader, 
  ModalBody 
} from '../../../components/Modal';

const DETAIL_COLUMNS = [
  {
    name: 'realName',
    title: '담당자',
  },
  {
    name: 'storeName',
    title: '업체명',
  },
  {
    name: 'bus_id',
    title: '사업자번호',
  },
  {
    name: 'callNumber',
    title: '핸드폰번호',
  },
  {
    name: 'pubManagerType',
    title: '관리자형태',
  },
];

class UserRefuseModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sIsShowEnableModal: true,
    }
  }

  componentDidMount = () => {
    const { onRef } = this.props;
    onRef( this );
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
  }

  handleCloseModal = () => {
    this.setState({
      sIsShowEnableModal: false,
    });
    this.props.handleCloseModal();
  }

  handleChangeRefuseReason = ( e ) => {
    if ( !e ) {
      return;
    }
    const value = e.target.value;
    this.refuseReason = value;
  }

  render() {
    const { userData, columns, hasOperationButton } = this.props;
    const { sIsShowEnableModal } = this.state;
    return (
      <Modal
        isOpen={sIsShowEnableModal}
        toggle={this.handleCloseModal}
        className='enable-user-modal'
      >
        <ModalHeader 
          toggle={this.props.handleCloseModal} 
          className='enable-user-modal-header'
        >
          <h4>사용차단</h4>
        </ModalHeader>
        <ModalBody className='enable-user-modal-body'>
          <div className='user-detail-table'>
            {_.map( columns, ( columnItem, columnIndex ) => {
              const value = columnItem.data? columnItem.data( userData ) : _.get( userData, columnItem.name ) || '';
              return (
                <div key={columnIndex} className='detail-item'>
                  <div className='detail-label'>{columnItem.title}</div>
                  <div className='detail-content'>{value}</div>
                </div>
              )
            })}
            {hasOperationButton &&
              <div className='detail-item'>
                <div className='detail-label'>차단사유</div>
                <div className='detail-content'>
                  <input 
                    name='refuseReasen'
                    onChange={this.handleChangeRefuseReason}
                  />
                </div>
              </div>
            }
          </div>
          {
            <div className='user-detail-operation-buttons'>
              <div className='operation-button' onClick={this.props.handleClickEnableUserButton}>차단</div>
            </div>
          }
        </ModalBody>
      </Modal>
    );
  }
}

UserRefuseModal.propTypes = {
  hasOperationButton: PropTypes.bool,
  columns: PropTypes.array,
  handleCloseModal: PropTypes.func,
  handleClickEnableUserButton: PropTypes.func,
  onRef: PropTypes.func,
};

UserRefuseModal.defaultProps = {
  hasOperationButton: true,
  columns: DETAIL_COLUMNS,
  handleCloseModal: () => {},
  handleClickEnableUserButton: () => {},
  onRef: () => {},
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(UserRefuseModal);