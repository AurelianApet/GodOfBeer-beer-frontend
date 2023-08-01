import React, { Component }     from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { 
  Modal, 
  ModalHeader, 
  ModalBody 
} from '../../../components/Modal';
import APIForm, { 
	MODE_CREATE, MODE_READ,
  TYPE_INPUT,
  TYPE_SELECT,
	ERROR_BORDER,
} from '../../../components/APIForm';
import FileUploadPublic from '../../../components/FileUploadPublic';
import { pushNotification, NOTIFICATION_TYPE_SUCCESS } from '../../../../library/utils/notification';

export class UpdateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
        sIsVisible: true,
        sFormMode: MODE_READ,
        sUserImage: '',
        sUserImageFromFileUpload: '',
        sProviderUsers: [{value:'', title: ''}],
        sUserId: null,
    }
  }

  componentDidMount = () => {
    const userId = _.get( this.props, 'user._id' ) || '';
    this.setState({
      sUserId: userId,
    });
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
  // handle function
  handleSaveUpdatedBrewery = () => {
    this.apiForm.handleSubmitForm();
  }

  handleCancelUpdatedBrewery = () => {
    this.closeUpdateModal();
  }

	handleGetPhoto = ( aFiles ) => {
		const url = _.get( aFiles, '[0].url' ) || '';
		this.setState({
			sUserImageFromFileUpload: url,
			sUserImage: url,
		})
  }
  
  handleContentChange = ( e ) => {
    if ( !e ) return;
    this.content = e.target.value;
  }
  // render function
  
	renderUserImage = ( funcHandleClick ) => {
		const { sUserImage, sUserImageFromFileUpload } = this.state;
		return (
			<img 
        src={sUserImage || sUserImageFromFileUpload || '/assets/images/producer/user-profile-not-found.jpeg'} 
        onError={(e) => {e.target.src = '/assets/images/producer/user-profile-not-found.jpeg'}}
				onClick={funcHandleClick} 
				alt=''
			/>
		);
	}
  
  render() {
    const { pMode, pId, user } = this.props;
    const { sIsVisible, sUserImage, sUserImageFromFileUpload, sContent, sProviderUsers } = this.state;
    return (
      <div className='container-update-modal'>
        <Modal
          isOpen={sIsVisible}
          toggle={this.closeUpdateModal}
          className='update-modal'
        >
          <ModalHeader 
            toggle={this.closeUpdateModal} 
            className='update-modal-header'
          >
          <div className='update-modal-title'>{pMode === MODE_CREATE? '수입사 추가' : '상세보기' }</div>
          </ModalHeader>
          <ModalBody className='update-modal-body'>
            <div className='update-form'>
              <div className='update-form-first-row'>
                <FileUploadPublic
                  title='대표이미지등록'
                  pMaxFileCount={1}
                  pIsCustomCallback={true}
                  pFileFilter={/^(image\/bmp|image\/gif|image\/jpg|image\/jpeg|image\/png)$/i}
                  pButtonCustomRender={this.renderUserImage}
                  pHandleUploadDone={this.handleGetPhoto}
                />
                <APIForm
                  onRef={(ref) => {this.apiForm = ref}}
                  pMode={{
                    mode: pMode,
                  }}
                  pFormInfo={
                    [
                      [{
                        name: 'name',
                        type: TYPE_INPUT,
                        title: {
                          string: '양조장 이름'
                        },
                      }],
                      [{
                        name: 'country',
                        type: TYPE_INPUT,
                        title: {
                          string: '국가'
                        },
                      }],
                      [{
                        name: 'city',
                        type: TYPE_INPUT,
                        title: {
                          string: '도시'
                        },
                      }],
                      [{
                        name: 'userID',
                        type: pMode === MODE_CREATE?TYPE_INPUT : TYPE_SELECT,
                        title: {
                            string: '관리회원',
                        },
                        value: pMode === MODE_CREATE?user.realName : sProviderUsers,
                      }],
                    ]
                  }
                  pAPIInfo={{
                    select: {
                      queries: [{
                        method: 'get',
                        url: `/brewery/fetchone?id=${pId}`,
                      },
                      {
                        method: 'get',
                        url: '/user/fetchlist?role=ROLE_PROVIDER'     
                      }],
                      callback: ( res, funcSetValues ) => {
                        const result = _.get( res, '[0].brewery[0]' ) || {};
                        result.userID = result.uid._id || '';
                        this.content = result.content || '';

                        let users = _.get( res, '[1].users' ) || [];
                        let providers = [{value: user._id, title: user.userID}];
                        _.map(users, (auser, index)=>{
                          providers.push({value: auser._id, title: auser.userID});
                        });
                        
                        this.setState({
                          sProviderUsers: providers,
                          sUserImage: result.image || '',
                          sContent: result.content || '',
                        });
                        funcSetValues( result );
                      },
                    },
                    create: {
                      queries: [{
                        method: 'post',
                        url: '/brewery/create',
                        data: ( formData ) => {
                          formData.image = sUserImageFromFileUpload || sUserImage;
                          formData.content = this.content;
                          formData.uid = user._id;
                          formData.role = user.role;
                          formData.type = "abroad";
                          return formData;
                        }
                      }],
                      callback: ( res, func ) => {
                        pushNotification(NOTIFICATION_TYPE_SUCCESS, '양조장 저장에 성공했습니다');
                        this.closeUpdateModal( true );
                      },
                    },
                    update: {
                      queries: [{
                        method: 'put',
                        url: `/brewery/updateone/${pId}`,
                        data: ( formData ) => {
                          formData.image = sUserImageFromFileUpload || sUserImage;
                          formData.content = this.content;
                          formData.role = user.role;
                          formData.type = "abroad";
                          return formData;
                        }
                      }],
                      callback: ( res ) => {
                        pushNotification(NOTIFICATION_TYPE_SUCCESS, '양조장 저장에 성공했습니다');
                        this.closeUpdateModal( true );
                      }
                    },
                  }}
                  pThemeInfo={{
                    error: {
                      errorStyle: ERROR_BORDER,
                        showAll: false,
                        errColor: '#ff0000',
                    }
                  }}
                />
              </div>
              <div className='update-form-second-row'>
                <div className='content-title'>양조장설명</div>
                <div className='content-textarea'>
                  <textarea
                    defaultValue={sContent}
                    onChange={this.handleContentChange}
                  />
                </div>
              </div>
            </div>
            <div className='update-modal-operation-buttons'>
              <div className='update-modal-save-button' onClick={this.handleSaveUpdatedBrewery}>저장</div>
              <div className='update-modal-cancel-button' onClick={this.handleCancelUpdatedBrewery}>취소</div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

UpdateModal.propTypes = {
  pMode: PropTypes.number,
  handleModalClose: PropTypes.func,
};

UpdateModal.defaultProps = {
  pMode: MODE_READ,
  handleModalClose: () => {},
};


export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(UpdateModal);
