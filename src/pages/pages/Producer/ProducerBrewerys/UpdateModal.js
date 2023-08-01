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
    ERROR_BORDER, TYPE_BUTTON, ACTION_CUSTOM, BUTTON_NORMAL,
} from '../../../components/APIForm';
import FileUploadPublic from '../../../components/FileUploadPublic';
import { pushNotification, NOTIFICATION_TYPE_SUCCESS } from '../../../../library/utils/notification';

export class UpadateModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sIsVisible: true,
            sFormMode: MODE_READ,
            sUserId: null,
            sUserImage: '',
            sUserImageFromFileUpload: '',
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

    checkAddress = () => {
        window.onSearchAddressClick( 'apiForm-input-address', '', '', this.getAddressData );
    };

    getAddressData = ( aData ) => {
        this.address = aData || {};
    };

    render() {
        const { pMode, pId, user } = this.props;
        const { sIsVisible, sUserId, sUserImage, sUserImageFromFileUpload, sContent } = this.state;
        const userInfo = this.props.user || {};
        console.log(userInfo);
        const companyType = userInfo.companyType || '';
        const phoneNumber = userInfo.callNumber || '';
        const address = this.address ? this.address : userInfo.address || {};
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
                        <div className='update-modal-title'>{pMode === MODE_CREATE? '신규 양조장 추가' : '상세보기' }</div>
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
                                    pFormInfo={companyType === 'importer'?
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
                                        ]
                                        :
                                        [
                                            [{
                                                name: 'name',
                                                type: TYPE_INPUT,
                                                colSpan: 2,
                                                title: {
                                                    string: '양조장 이름'
                                                },
                                            }],
                                            [{
                                                name: 'address',
                                                type: TYPE_INPUT,
                                                disabled: true,
                                                data: ( input ) => {
                                                    return `${input.zonecode || ''} ${input.roadAddress || ''} ${input.buildingName || ''}`;
                                                },
                                                value: `${address.zonecode || ''} ${address.roadAddress || ''} ${address.buildingName || ''}`,
                                                title: {
                                                    string: '주소',
                                                },
                                            },{
                                                type: TYPE_BUTTON,
                                                action: {
                                                    type: ACTION_CUSTOM,
                                                    action: this.checkAddress
                                                },
                                                kind: BUTTON_NORMAL,
                                                className: "gray-button producer-address-btn",
                                                title: '주소검색',
                                            }],
                                            [{
                                                name: 'addressDetail',
                                                type: TYPE_INPUT,
                                                colSpan: 2,
                                                title: {
                                                    string: '상세주소'
                                                },
                                            }],
                                            [{
                                                name: 'callNumber',
                                                type: TYPE_INPUT,
                                                colSpan: 2,
                                                title: {
                                                    string: '전화번호',
                                                },
                                            }],
                                        ]
                                    }
                                    pAPIInfo={{
                                        select: {
                                            queries: [{
                                                method: 'get',
                                                url: `/brewery/fetchone?id=${pId}`,
                                            }],
                                            callback: ( res, funcSetValues ) => {
                                                const result = _.get( res, '[0].brewery[0]' ) || {};
                                                this.content = result.content || '';
                                                this.setState({
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
                                                    formData.uid = sUserId || '';
                                                    formData.companyType = companyType;
                                                    formData.image = sUserImageFromFileUpload || sUserImage;
                                                    formData.content = this.content;
                                                    formData.address = address;
                                                    formData.role = user.role;
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
                                                    formData.companyType = companyType;
                                                    formData.image = sUserImageFromFileUpload || sUserImage;
                                                    formData.content = this.content;
                                                    formData.address = address;
                                                    formData.role = user.role;
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

UpadateModal.propTypes = {
  pMode: PropTypes.number,
  handleModalClose: PropTypes.func,
};

UpadateModal.defaultProps = {
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
)(UpadateModal);
