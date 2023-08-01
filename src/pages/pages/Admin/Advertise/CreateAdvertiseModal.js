import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {
    Modal,
    ModalHeader,
    ModalBody
} from '../../../components/Modal';
import FileUpload from "../../../components/Form/FileUpload";
import {appConfig} from "../../../../appConfig";
import {NOTIFICATION_TYPE_ERROR, pushNotification} from "../../../../library/utils/notification";
import DateTimeComponent, {VIEW_MODE_DAYS, VIEW_MODE_MONTHS} from "../../../components/Form/DateTime";
import FileList from "../../../components/Form/FileList";

class CreateAdvertiseModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sIsShowEnableModal: true,
        };

        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const date1 = new Date().getDate();

        this.advertiseData = {
            startAt: year + '-' + (month < 10 ? '0' + month: month) + '-' + (date1 < 10 ? '0' + date1 : date1),
            ...this.props.advertiseData
        };
    }

    componentDidMount = () => {
        const {onRef} = this.props;
        onRef(this);
    };

    componentWillUnmount = () => {
        this.props.onRef(null);
    };

    handleCloseModal = () => {
        this.setState({
            sIsShowEnableModal: false,
        });
        this.props.handleCloseModal();
    };

    handleChangedInput = (e) => {
        if (!e) return;
        const {value, name} = e.target;
        _.set(this.advertiseData, `${name}`, value);
    };


    handleUploadBanner = ( uploadedFiles ) => {
        console.log(uploadedFiles);
        if ( uploadedFiles.length > 0 ) {
            let basicUrl = appConfig.apiUrl.substr( 0, appConfig.apiUrl.lastIndexOf( '/' ) + 1 );
            let fileItem = uploadedFiles[0];
            let fileName = fileItem.name || '';
            let fileType = fileName.substr( fileName.lastIndexOf( '.' ) + 1, fileName.length );
            let url = basicUrl + fileItem._id + '.' + fileType;
            _.set(this.advertiseData, `bannerUrl`, url);
        }
    };

    handleUploadDetail = ( uploadedFiles ) => {
        console.log(uploadedFiles);
        if ( uploadedFiles.length > 0 ) {
            let basicUrl = appConfig.apiUrl.substr( 0, appConfig.apiUrl.lastIndexOf( '/' ) + 1 );
            let fileItem = uploadedFiles[0];
            let fileName = fileItem.name || '';
            let fileType = fileName.substr( fileName.lastIndexOf( '.' ) + 1, fileName.length );
            let url = basicUrl + fileItem._id + '.' + fileType;
            _.set(this.advertiseData, `detailUrl`, url);
        }
    };

    handleChangeMonthStatisticDate = ( aTarget, aDate ) => {
        const date = new Date( aDate );
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const date1 = date.getDate();
        _.set(this.advertiseData, `startAt`, year + '-' + (month < 10 ? '0' + month: month) + '-' + (date1 < 10 ? '0' + date1 : date1));
    };

    handleBannerChange = (aFiles) => {
        console.log('handle-banner-change');
        this.fileUploadBanner.processSubmit();
    };

    handleDetailChange = (aFiles) => {
        console.log('handle-banner-change');
        this.fileUploadDetail.processSubmit();
    };

    handleSave = () => {
        if ( !this.advertiseData.name ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '광고명을 입력해주세요.' );
            return;
        }
        if ( !this.advertiseData.ownerName ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '광고주를 입력해주세요.' );
            return;
        }
        if ( !this.advertiseData.startAt ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '시작일을 입력해주세요.' );
            return;
        }
        if ( !this.advertiseData.period ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '광고기간을 입력해주세요.' );
            return;
        }
        if ( !this.advertiseData.managerName ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '담당자를 입력해주세요.' );
            return;
        }
        if ( !this.advertiseData.phoneNumber ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '전화번호를 입력해주세요.' );
            return;
        }
        if ( !this.advertiseData.bannerUrl ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '배너이미지를 선택해주세요.' );
            return;
        }
        if ( !this.advertiseData.detailUrl ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '상세이미지를 선택해주세요.' );
            return;
        }
        if ( !this.advertiseData.linkUrl ) {
            pushNotification( NOTIFICATION_TYPE_ERROR, '연결url을 입력해주세요.' );
            return;
        }

        this.props.handleCreateButton(this.advertiseData);
    };

    handleRemoveDetailImage() {
        _.set(this.advertiseData, `detailUrl`, '');
    }

    handleRemoveBannerImage() {
        _.set(this.advertiseData, `bannerUrl`, '');
        console.log('remove-banner-image:', this.advertiseData);
    }

    renderAdvertiseImage = ( aItem ) => {
        return <img src={aItem} alt='' />
    };

    render() {
        const {advertiseData, columns, mode} = this.props;
        const {sIsShowEnableModal} = this.state;
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const date = new Date().getDate();
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
                    <h4>{mode === 0 ? '광고추가' : '광고편집'}</h4>
                </ModalHeader>
                <ModalBody className='enable-user-modal-body create-advertise-modal'>
                    <div className='user-detail-table'>
                        {
                            _.map(columns, (columnItem, columnIndex) => {
                                if (columnItem.title === '배너이미지') {
                                    return (
                                        <div className='detail-item' key={columnIndex}>
                                            <div className='detail-label'>{columnItem.title}</div>
                                            <div className={'detail-content'}>
                                                <form>
                                                    {advertiseData[columnItem.name] &&
                                                    <FileList
                                                        pFiles={[advertiseData[columnItem.name]]}
                                                        downloadAvailable={false}
                                                        pHandleDelete={this.handleRemoveBannerImage.bind(this)}
                                                        pIconCustomRender={this.renderAdvertiseImage.bind(this)}
                                                    />
                                                    }
                                                    <FileUpload
                                                        url='/files/upload/public'
                                                        className='food-menu-image-fileUpload-dropzone'
                                                        ref={ref => {
                                                            this.fileUploadBanner = ref;
                                                        }}
                                                        handleUploadDone={this.handleUploadBanner}
                                                        onChange={this.handleBannerChange}
                                                        pMaxFileCount={1}
                                                        pFileFilter={/^(image\/bmp|image\/gif|image\/jpg|image\/jpeg|image\/png)$/i}
                                                    />
                                                </form>
                                            </div>
                                        </div>

                                    )
                                } else if (columnItem.title === '상세이미지') {
                                    return (
                                        <div className='detail-item' key={columnIndex}>
                                            <div className='detail-label'>{columnItem.title}</div>
                                            <div className={'detail-content'}>
                                                <form>
                                                    {advertiseData[columnItem.name] &&
                                                    <FileList
                                                        pFiles={[advertiseData[columnItem.name]]}
                                                        downloadAvailable={false}
                                                        pHandleDelete={this.handleRemoveDetailImage.bind(this)}
                                                        pIconCustomRender={this.renderAdvertiseImage.bind(this)}
                                                    />
                                                    }
                                                    <FileUpload
                                                        url='/files/upload/public'
                                                        className='food-menu-image-fileUpload-dropzone'
                                                        ref={ref => {
                                                            this.fileUploadDetail = ref;
                                                        }}
                                                        handleUploadDone={this.handleUploadDetail}
                                                        onChange={this.handleDetailChange}
                                                        pMaxFileCount={1}
                                                        dropzoneClass='dropzone-two'
                                                        pFileFilter={/^(image\/bmp|image\/gif|image\/jpg|image\/jpeg|image\/png)$/i}
                                                    />
                                                </form>
                                            </div>
                                        </div>
                                    )
                                } else if (columnItem.title === "시작일") {
                                    return (
                                        <div className='detail-item' key={columnIndex}>
                                            <div className='detail-label'>{columnItem.title}</div>
                                            <div className={'detail-content'}>
                                                <DateTimeComponent
                                                    onChange={this.handleChangeMonthStatisticDate}
                                                    timeFormat={false}
                                                    dateFormat={'YYYY-MM-DD'}
                                                    defaultValue={advertiseData["startAt"] ? new Date(advertiseData["startAt"]).toISOString().slice(0, 10) : `${year}-${month < 10 ? '0' + month : month}-${date < 10 ? '0' + date : date}`}
                                                    viewMode={VIEW_MODE_DAYS}
                                                />
                                            </div>
                                        </div>
                                    )
                                } else if (columnItem.title === '상태') {
                                    return (
                                        <div key={columnIndex} className='detail-item'>
                                            <div className='detail-label'>{columnItem.title}</div>
                                            <select className={'detail-content'}
                                                    defaultValue={advertiseData[columnItem.name]} name={columnItem.name} onChange={this.handleChangedInput}>
                                                <option value={1}>게재</option>
                                                <option value={2}>정지</option>
                                            </select>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div key={columnIndex} className='detail-item'>
                                            <div className='detail-label'>{columnItem.title}</div>
                                            <input
                                                type={columnItem.name === 'oldPassword'
                                                    ? 'password' : columnItem.name === 'newPassword'
                                                        ? 'password' : columnItem.name === 'password'
                                                            ? 'password' : 'text'}
                                                className='detail-content'
                                                name={columnItem.name}
                                                defaultValue={advertiseData[columnItem.name]}
                                                onChange={this.handleChangedInput}/>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>

                    <div className='footer-button'>
                        <div className='user-detail-operation-buttons'>
                            <div className='operation-button' onClick={() => {this.props.handleCloseModal()}}>취소</div>
                        </div>

                        <div className='user-detail-operation-buttons'>
                            <div className='operation-button' onClick={() => {this.handleSave()}}>{mode === 0 ? '추가' : '저장'}</div>
                        </div>
                    </div>

                </ModalBody>
            </Modal>
        );
    }
}

CreateAdvertiseModal.propTypes = {
    hasOperationButton: PropTypes.bool,
    columns: PropTypes.array,
    handleCloseModal: PropTypes.func,
    handleCreateButton: PropTypes.func,
    onRef: PropTypes.func,
    advertiseData: PropTypes.object,
};

CreateAdvertiseModal.defaultProps = {
    hasOperationButton: true,
    columns: [],
    handleCloseModal: () => {
    },
    handleCreateButton: () => {
    },
    onRef: () => {
    },
    advertiseData: {},
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(CreateAdvertiseModal);
