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

class InsertUserModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sIsShowEnableModal: true,
    }
    this.userData = {};
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

  handleChangedInput = (e) => {
    if (!e) return ;
    const { value, name } = e.target;
    _.set(this.userData, `${name}`, value);
  }

  render() {
    const { userData, columns, mode } = this.props;
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
          <h4>{mode === 0 ? '서브관리자 추가' : '서브관리자 편집'}</h4>
        </ModalHeader>
        <ModalBody className='enable-user-modal-body'>
          <div className='user-detail-table'>
            { 
              _.map( columns, ( columnItem, columnIndex ) => {
                return (
                  <div key={columnIndex} className='detail-item'>
                    <div className='detail-label'>{columnItem.title}</div>
                      <input 
                      type = {columnItem.name === 'oldPassword' 
                        ? 'password' : columnItem.name === 'newPassword'
                        ? 'password' : columnItem.name === 'password' 
                        ? 'password' : 'text'}
                      className='detail-content' 
                      name={columnItem.name} 
                      defaultValue={userData[columnItem.name]} 
                      onChange={this.handleChangedInput}></input>
                  </div>
                )
              })
            }
          </div>
          {
            <div className='user-detail-operation-buttons'>
              <div className='operation-button' onClick={this.props.handleInsertUserButton}>추가</div>
            </div>
          }
        </ModalBody>
      </Modal>
    );
  }
}

InsertUserModal.propTypes = {
  hasOperationButton: PropTypes.bool,
  columns: PropTypes.array,
  handleCloseModal: PropTypes.func,
  handleInsertUserButton: PropTypes.func,
  onRef: PropTypes.func,
  userData: PropTypes.object,
};

InsertUserModal.defaultProps = {
  hasOperationButton: true,
  columns: [],
  handleCloseModal: () => {},
  handleInsertUserButton: () => {},
  onRef: () => {},
  userData: {},
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(InsertUserModal);