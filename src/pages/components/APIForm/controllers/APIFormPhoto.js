import React, { Component } from 'react';
import cn from 'classnames';

import { MODE_READ } from '../../APIForm';
import FileUploadPublic from '../../FileUploadPublic';
import LANG from '../../../../language';

export class APIFormPhoto extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sDefaultData: '',
      sIsRound: false,
    };
  }

  componentDidMount = () => {
    const { defaultData, onRef } = this.props;
    onRef( this );
    this.value = defaultData || '';
    this.setState({
      sDefaultData: defaultData,
    })
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
  }

  handleGetPhoto = ( aFiles ) => {
    if ( aFiles && aFiles[0] ) {
      this.setState({
        sDefaultData: aFiles[0].url || '',
      });
      this.value = aFiles[0].url || '';
      this.props.handleChange();
    }
  }

  handleToogleRound = () => {
    this.setState(
      prev => ({
        sIsRound: !prev.sIsRound,
      })
    );
  }

  renderPhoto = ( funcHandleClick ) => {
    const { sDefaultData, sIsRound } = this.state;
    return (
      <div className='apiform-photo-container'>
        <div className='apiform-photo-edit-button'>
          <i className={cn('fa', sDefaultData? 'modify-photo fa-edit' : 'fa-user userIcon')} onClick={funcHandleClick} />
          { sDefaultData && 
            <i className='fa fa-magic toogle-round-button' onClick={this.handleToogleRound} />
          }
        </div>
        <img src={sDefaultData} className={cn('photo-img', sIsRound? 'photo-img-round' : '' )} alt='' />
      </div>
    );
  }
  
  render() {
    const { item, mode, index } = this.props;
    const { sDefaultData } = this.state;
    if ( mode.mode !== MODE_READ ) {
      return (
        <div 
          key={`apiForm-photo-${item.name}`} 
          className={cn( sDefaultData? 'container-photo-attachment' : 'container-photo-attachment-nothing' )}
        >
          <FileUploadPublic
            title={item.title || LANG( 'PAGE_ADMIN_SERVICE_STAFFLIST_PHOTO_INPUT' )}
            pMaxFileCount={1}
            pIsCustomCallback={true}
            pFileFilter={/^(image\/bmp|image\/gif|image\/jpg|image\/jpeg|image\/png)$/i}
            pButtonCustomRender={this.renderPhoto}
            pHandleUploadDone={this.handleGetPhoto}
          />
        </div>
      );
    } else {
      return (
        <div key={index} className='apiform-content-view-div container-photo-attachment-nothing'>
          {sDefaultData?
            <img src={sDefaultData} alt='' />
          :
            <i className='fa fa-user userIcon' />
          }
        </div>
      )
    }
  }
}

APIFormPhoto.propTypes = {
  
};

APIFormPhoto.defaultProps = {
  
};

export default APIFormPhoto;