import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import _ from 'lodash';

import FileUpload from '../Form/FileUpload';
import LANG from '../../../language';

import {appConfig} from '../../../appConfig';

class FileUploadPublic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sFileUploadContainerShow: false,
        };
    }

    componentDidMount = () => {
        this.props.onRef(this);
    };

    componentWillReceiveProps = (newProps) => {
    };

    componentWillUnmount() {
        this.props.onRef(null);
    }

    handleClickFileUpload = () => {
        this.setState({
            sFileUploadContainerShow: true,
        })
    };

    handleConfirmUpload = () => {
        this.fileUpload.processSubmit();
    };

    handleUploadDone = (uploadedFiles) => {
        const {pHandleUploadDone, pIsCustomCallback} = this.props;
        if (pIsCustomCallback) {
            let resultFiles = [];
            const basicUrl = appConfig.apiUrl.substr(0, appConfig.apiUrl.lastIndexOf('/') + 1);
            _.map(uploadedFiles, (fileItem, fileIndex) => {
                const fileName = fileItem.name || '';
                const fileType = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
                let tmpItem = fileItem;
                tmpItem.url = basicUrl + fileItem._id + '.' + fileType;
                resultFiles.push(tmpItem);
            });
            pHandleUploadDone(resultFiles);
        } else {
            pHandleUploadDone(uploadedFiles);
        }
        this.handleCloseFileUploadPublicContainer();
    };

    handleCloseFileUploadPublicContainer = (e) => {
        if (e) e.stopPropagation();
        this.setState({
            sFileUploadContainerShow: false,
        });
    };

    render() {
        const {className, title, pMaxFileCount, pButtonCustomRender, pFileFilter, url, pHasButton} = this.props;
        const {sFileUploadContainerShow} = this.state;
        return (
            <div className={cn(className, 'container-component-fileUpload-public')}>
                {pButtonCustomRender ?
                    pButtonCustomRender(this.handleClickFileUpload)
                    :
                    pHasButton && <button onClick={this.handleClickFileUpload}>Click</button>
                }
                {sFileUploadContainerShow &&
                <div className='container-fileUpload-background'>
                    <div className='container-fileUpload'>
                        <div className='fileUpload-title'>{title}</div>
                        <div className='fileUpload-button-div'>
                            <button type="button" onClick={this.handleConfirmUpload}>
                                <span>{LANG('COMP_FILEUPLOAD_PUBLIC_CONFIRM')}</span>
                            </button>
                            <button type="button" onClick={this.handleCloseFileUploadPublicContainer}>
                                <span>{LANG('COMP_FILEUPLOAD_PUBLIC_CANCEL')}</span>
                            </button>
                        </div>
                        <div className='container-fileUpload-form'>
                            <form>
                                <FileUpload
                                    className='fileUpload-dropzone'
                                    url={url}
                                    ref={ref => {
                                        this.fileUpload = ref;
                                    }}
                                    handleUploadDone={this.handleUploadDone}
                                    pMaxFileCount={pMaxFileCount}
                                    pFileFilter={pFileFilter}
                                />
                            </form>
                        </div>
                    </div>
                </div>
                }
            </div>
        )
    }
}

FileUploadPublic.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    title: PropTypes.string,
    url: PropTypes.string,
    pIsCustomCallback: PropTypes.bool,
    pHasButton: PropTypes.bool,
    pMaxFileCount: PropTypes.number,
    pFileFilter: PropTypes.object,
    pButtonCustomRender: PropTypes.func,
    pHandleUploadDone: PropTypes.func,
    onRef: PropTypes.func,
};

FileUploadPublic.defaultProps = {
    id: 'fileUploaderPublic',
    name: 'fileUploaderPublic',
    className: '',
    title: LANG('COMP_FILEUPLOAD_PUBLIC_TITLE'),
    url: '/files/upload/public',
    pIsCustomCallback: false,
    pHasButton: true,
    pMaxFileCount: null,
    pFileFilter: null,
    pButtonCustomRender: null,
    pHandleUploadDone: () => {
    },
    onRef: () => {
    },
};

export default FileUploadPublic;
