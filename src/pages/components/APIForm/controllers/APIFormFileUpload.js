import React, { Component } from 'react';
import _ from 'lodash';

import FileList from '../../Form/FileList';
import FileUpload from '../../Form/FileUpload';
import { MODE_READ } from '../../APIForm';

export class APIFormFileUpload extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
    this.mounted = false;
    this.fileUploadValue = [];
  }

  componentDidMount = () => {
    const { onRef } = this.props;
    onRef( this );
    this.setData( this.props );
  }

  componentWillReceiveProps = ( newProps ) => {
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
  }

  setData = ( aProps ) => {
    const { defaultData } = aProps;
    this.value = [];
    this.fileListFiles = [];
    if ( defaultData ) {
      _.map( defaultData, ( dataItem, dataIndex ) => {
        this.value.push( dataItem );
        this.fileListFiles.push( dataItem );
      });
    }
    this.mounted = true;
    this.checkValidation();
  }
  
  checkValidation = () => {
    const { item, parent } = this.props;
    let value = [];
    _.map( this.value, ( item, index ) => {
      value.push( item );
    });
    const validationResult = parent.checkItemValidate( value, item );
    this.setState({
      error: validationResult.error,
    });
  }

  getFocus = () => {

  }

  handleFileModified = ( aItem, aFiles  ) => {
    this.fileListFiles = aFiles;
    if ( this.fileListFiles ) {
      this.value = this.fileListFiles;
      this.value.splice(0, 0, this.fileUploadFiles);
    } else {
      this.value = this.fileUploadFiles;
    }
    this.checkValidation();
    this.props.handleChange();
  }

  handleFileUploadChange = ( aFiles ) => {
    this.fileUploadFiles = aFiles;
    if ( this.fileListFiles ) {
      this.value = this.fileListFiles;
      this.value.splice(0, 0, this.fileUploadFiles);
    } else {
      this.value = this.fileUploadFiles;
    }
    this.checkValidation();
    this.props.handleChange();
  }

  processSubmit = () => {
    this.fileUpload.processSubmit();
  }
  
  render() {
    const { mode, item, handleUploadDone, isErrBorder, tabIndex } = this.props;
    const { error } = this.state;
    let fileListFiles = [];
    _.map( this.fileListFiles, ( item, index ) => {
      const id = _.get( item, '_id' );
      const name = _.get( item, 'name' );
      if ( !!id && !!name ) {
        fileListFiles.push(item);
      }
    });
    let resultHtml = [];
    if ( this.mounted ) {
      resultHtml.push(
        <FileList
          onRef={ ( ref ) => {this.fileList = ref}}
          key={`apiForm-fileList-${item.name}`}
          pFiles={fileListFiles}
          pHandleDelete={this.handleFileModified.bind( this, item.name )}
          isEditable={mode.mode !== MODE_READ}
        />
      );
      if ( mode.mode !== MODE_READ ) {
        resultHtml.push(
          <FileUpload
            key={`apiFor-fileUpload-${item.name}`}
            tabIndex={tabIndex}
            className={isErrBorder && !!error? 'apiform-error' : ''}
            onChange={this.handleFileUploadChange}
            ref={ref => {this.fileUpload = ref;}}
            handleUploadDone={handleUploadDone.bind( this, item.name )}
          />
        );
      }
    }
    return resultHtml
  }
}

APIFormFileUpload.propTypes = {
  
};

APIFormFileUpload.defaultProps = {
  
};

export default APIFormFileUpload;