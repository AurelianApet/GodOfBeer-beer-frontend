import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { downloadFile } from '../../../../library/utils/fileDownload';
import { removeFromArray } from '../../../../library/utils/array';

class FileList extends Component {

  constructor(props) {
    super(props);
    const { pFiles } = this.props;
    this.value = pFiles;
    this.state = {
      sFiles: pFiles,
    };  
  }

  componentDidMount = () => {
    const { onRef } = this.props;
    onRef( this );
  }

  componentWillMount = () => {
    const { onRef } = this.props;
    onRef( null );
  }

  handleDelete = (item, e) => {
    const { sFiles } = this.state;
    if(item) {
      this.setState({
        sFiles: removeFromArray(sFiles, '_id', item._id),
      });
      this.value = sFiles;
      this.props.pHandleDelete(removeFromArray(sFiles, '_id', item._id));
    }
  }

  handleDownload = (item, e) => {
    downloadFile(item._id);
  }

  render() {
    const { isEditable, pIconCustomRender, downloadAvailable } = this.props;
    const { sFiles } = this.state;
    return (
      <div className="file-list-div">
        <ul className="file-list-container">
          { 
            _.map(sFiles, (item, index) => {
              return (
                <li key={index} className="file-list-item">
                  {pIconCustomRender? pIconCustomRender(item) : <span>{item.name}</span>}
                  {downloadAvailable && <i className="fa fa-download" onClick={this.handleDownload.bind(this, item)}/>}
                  {isEditable && <i className="fa fa-trash-o" onClick={this.handleDelete.bind(this, item)}/>}
                </li>
              )
            })
          }
        </ul>
      </div>
    );
  }
}

FileList.propTypes = {
  isEditable: PropTypes.bool,
  downloadAvailable: PropTypes.bool,
  pFiles: PropTypes.array,
  pHandleDelete: PropTypes.func,
  pIconCustomRender: PropTypes.func,
  onRef: PropTypes.func,
};

FileList.defaultProps = {
  isEditable: true,
  downloadAvailable: true,
  pFiles: [],
  pHandleDelete: () => {},
  pIconCustomRender: null,
  onRef: () => {},
};

export default FileList;
