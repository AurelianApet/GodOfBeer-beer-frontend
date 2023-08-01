import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { 
  Modal, 
  ModalHeader, 
  ModalBody 
} from '../../../components/Modal';
import APIForm, { 
	MODE_CREATE, MODE_UPDATE,
	TYPE_INPUT, TYPE_TEXTAREA,
	ERROR_NOTIFICATION,
} from '../../../components/APIForm';
import SearchInputer from '../../../components/SearchInputer';

import { executeQuery } from '../../../../library/utils/fetch';
import { confirmAlertMsg } from '../../../../library/utils/confirmAlert';
import LANG from '../../../../language';

import NoticeItem from './NoticeItem';

class NoticeManage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sNoticeData: [],
      sOriginNoticeData: [],
      sIsShowEditModal: false,
      sEditItem: null,
      sUserId: '',
    }
  }

  componentDidMount = () => {
    this.getNoticeData();
  }

  getNoticeData = () => {
    executeQuery({
      method: 'get',
      url: '/notice/fetchall',
      success: ( res ) => {
        const userId = _.get( this.props, 'user._id' ) || '';
        const result = res.notice || [];
        this.setState({
          sNoticeData: result,
          sOriginNoticeData: result,
          sUserId: userId,
        });
      },
      fail: ( err, res ) => {

      }
    })
  }

  handleCloseModal = ( aState ) => {
    this.setState({
      sIsShowEditModal: false,
      sEditItem: null,
    });
    if ( aState ) {
      this.getNoticeData();
    }
  }

  handleSearchWordInputed = ( aData ) => {
    this.setState({
      sNoticeData: aData,
    })
  }

  handleClickAddNew = () => {
    this.setState({
      sIsShowEditModal: true,
    })
  }

  handleSaveNotice = () => {
    this.apiForm.handleSubmitForm();
  }

  handleCancelNotice = () => {
    this.handleCloseModal();
  }

  handleEditNoticeItem = ( aItem ) => {
    this.setState({
      sIsShowEditModal: true,
      sEditItem: aItem,
    });
  }

  handleDeleteNoticeItem = ( aItem ) => {
    const { location: { pathname } } = this.props;
		let confirmParam = {
			title: LANG('BASIC_DELETE'),
			detail: LANG('BASIC_ALERTMSG_DELETE_NOTICE'),
			confirmTitle: LANG('BASIC_ALERTMSG_YES'),
			noTitle: LANG('BASIC_ALERTMSG_NO'),
			confirmFunc: this.processDeleteNoticeItem.bind( this, aItem ),
		};
		confirmAlertMsg(confirmParam, pathname);
  }

  processDeleteNoticeItem = ( aItem ) => {
    executeQuery({
      method: 'delete',
      url: `notice/${aItem._id || ''}`,
      success: ( res ) => {
        this.getNoticeData();
      },
      fail: ( err, res ) => {

      }
    })
  }

  renderEditModal = () => {
    const { sIsShowEditModal, sEditItem, sUserId } = this.state;
    const editId = _.get( sEditItem, '_id' ) || '';
    return (
      <Modal
        isOpen={sIsShowEditModal}
        toggle={this.handleCloseModal}
        className='edit-notice-modal'
      >
        <ModalHeader 
          toggle={this.handleCloseModal} 
          className='edit-notice-modal-header'
        >
        </ModalHeader>
        <ModalBody className='edit-notice-modal-body'>
          <APIForm
            onRef={(ref) => {this.apiForm = ref}}
            pMode={{
              mode: sEditItem? MODE_UPDATE : MODE_CREATE,
            }}
            pFormInfo={[
              [{
                name: 'title',
                type: TYPE_INPUT,
                title: {
                  string: '제목'
                },
                valid: {
                  required: {
                    isRequired: true,
                    errMsg: '제목을 입력해주세요.'
                  },
                },
              }],
              [{
                name: 'content',
                type: TYPE_TEXTAREA,
                title: {
                  string: '본문'
                },
                valid: {
                  required: {
                    isRequired: true,
                    errMsg: '본문을 입력해주세요.'
                  },
                },
              }],
            ]}
            pAPIInfo={{
              select: {
                queries: [{
                  method: 'get',
                  url: `/notice/fetchone?id=${editId}`,
                }],
                callback: ( res, funcSetValues ) => {
                  const result = _.get( res, '[0].notice[0]' ) || {};
                  funcSetValues( result );
                },
              },
              create: {
                queries: [{
                  method: 'post',
                  url: '/notice/create',
                  data: ( formData ) => {
                    formData.uid = sUserId || '';
                    return formData;
                  }
                }],
                callback: ( res, func ) => {
                  this.handleCloseModal( true );
                },
              },
              update: {
                queries: [{
                  method: 'put',
                  url: `/notice/updateone/${editId}`,
                  data: ( formData ) => {
                    formData.uid = sUserId || '';
                    return formData;
                  }
                }],
                callback: ( res ) => {
                  this.handleCloseModal( true );
                }
              },
            }}
            pThemeInfo={{
              error: {
                errorStyle: ERROR_NOTIFICATION,
                  showAll: false,
                  errColor: '#ff0000',
              }
            }}
          />
          <div className='edit-notice-modal-operation-buttons'>
            <div className='edit-notice-modal-save-button' onClick={this.handleSaveNotice}>저장</div>
            <div className='edit-notice-modal-cancel-button' onClick={this.handleCancelNotice}>취소</div>
          </div>
        </ModalBody>
      </Modal>
    )
  }

  renderNoticeManageContent = () => {
    const { sNoticeData } = this.state;
    return (
      <div className='notice-manage-content'>
        {_.map( sNoticeData, ( noticeItem, noticeIndex ) => {
          return (
            <NoticeItem
              key={noticeIndex}
              pData={noticeItem}
              pHandleEdit={this.handleEditNoticeItem}
              pHandleDelete={this.handleDeleteNoticeItem}
            />
          )
        })}
      </div>
    )
  }

  render() {
    const { sOriginNoticeData, sIsShowEditModal } = this.state;
    return (
      <div className='container-page-notice-manage'>
        <div className='notice-manage-search-inputer'>
          <SearchInputer
            pData={sOriginNoticeData}
            pHandleSearch={this.handleSearchWordInputed}
          />
        </div>
        <div className='notice-manage-add-new-button'>
          <div className='add-new-button' onClick={this.handleClickAddNew}>글쓰기</div>
        </div>
        {this.renderNoticeManageContent()}
        {sIsShowEditModal && this.renderEditModal()}
      </div>
    );
  }
}

NoticeManage.propTypes = {
};

NoticeManage.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(NoticeManage);