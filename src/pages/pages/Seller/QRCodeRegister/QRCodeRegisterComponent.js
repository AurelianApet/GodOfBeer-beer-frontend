import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import MaskedInput from 'react-text-mask';

import { Modal, ModalHeader, ModalBody } from '../../../components/Modal';
import { pushNotification, NOTIFICATION_TYPE_ERROR, NOTIFICATION_TYPE_SUCCESS } from '../../../../library/utils/notification';
import { executeQuery } from '../../../../library/utils/fetch';
import Loading from '../../../components/Loading';

class QRCodeRegisterComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sTags: {},
      sCheckedTags: {},
      sIsShowAddTagModal: false,
      sFetchStatus: false,
    }
    this.tags = {};
    this.addedTags = {};
    this.decodedTags = {};
    this.modified = false;
  }

  componentDidMount = () => {
    const { data, pubId } = this.props;
    if ( data ) {
      this.pubId = pubId
      this.getDataFromProps( data );
    } else {
      this.getPubInfo();
    }
  }

  getDataFromProps = ( aData ) => {
    _.map( aData, ( codeItem, codeIndex ) => {
      if ( codeIndex === 0 ) {
        this.addedTags.from = codeItem.tag;
      }
      if ( codeIndex === aData.length - 1 ) {
        this.addedTags.to = codeItem.tag;
      }
      this.tags[codeItem.tag] = codeItem.code;
    });
    this.setState({
      sTags: this.tags,
      sFetchStatus: true,
    });
  }

  getPubInfo = () => {
    this.tags = {};
    if ( this.props.id ) {
      executeQuery({
        method: 'get',
        url: `/pub/fetchone?uid=${this.props.id}`,
        success: ( res ) => {
          const result = _.get( res, 'pub[0]' ) || {};
          this.pubId = result._id;
          const qrcodes = result.barcodes || [];
          _.map( qrcodes, ( codeItem, codeIndex ) => {
            if ( codeIndex === 0 ) {
              this.addedTags.from = codeItem.tag;
            }
            if ( codeIndex === qrcodes.length - 1 ) {
              this.addedTags.to = codeItem.tag;
            }
            this.tags[codeItem.tag] = codeItem.code;
          });
          this.setState({
            sTags: this.tags,
            sFetchStatus: true,
          });
        },
        fail: ( err, res ) => {

        }
      })
    }
  }

  validateAddedTags = () => {
    const fromTag = this.addedTags.from || '';
    const toTag = this.addedTags.to || '';
    if ( !fromTag || !toTag ) return false;
    const fromNumber = Number( fromTag.slice( 1 ) );
    const toNumber = Number( toTag.slice( 1 ) );
    if ( ( !fromNumber && fromNumber !== 0 ) || ( !toNumber && toNumber !== 0 ) ) return false;
    const fromCharCode = fromTag.charCodeAt( 0 );
    const toCharCode = toTag.charCodeAt( 0 );
    if ( fromCharCode <= toCharCode ) {
      this.decodedTags = {
        from: {
          charCode: fromCharCode,
          number: fromNumber,
        },
        to: {
          charCode: toCharCode,
          number: toNumber,
        },
      };
    } else {
      this.decodedTags = {
        from: {
          charCode: toCharCode,
          number: toNumber,
        },
        to: {
          charCode: fromCharCode,
          number: fromNumber,
        },
      };
    }
    return true;
  }

  handleClickAddTagButton = () => {
    this.setState({
      sIsShowAddTagModal: true,
    })
  }

  handleCloseAddTagModal = () => {
    this.setState({
      sIsShowAddTagModal: false,
    })
  }

  handleCancelNewTags = () => {
    this.addedTags = {};
    this.setState({
      sIsShowAddTagModal: false,
    })
  }

  handleAddNewTags = () => {
    if ( !this.validateAddedTags() ) {
      pushNotification( NOTIFICATION_TYPE_ERROR, '태그를 정확히 입력하세요.' );
      return;
    }
    let newTags = {};
    for ( let char = this.decodedTags.from.charCode; char <= this.decodedTags.to.charCode; char++ ) {
      let startNumber = 0, endNumber = 99;
      if ( char === this.decodedTags.from.charCode ) {
        startNumber = this.decodedTags.from.number;
      } 
      if ( char === this.decodedTags.to.charCode ) {
        endNumber = this.decodedTags.to.number;
      }
      for ( let number = startNumber; number <= endNumber; number++ ) {
        const crrChar = String.fromCharCode( char );
        const crrNumber = number < 10? `0${number}` : number;
        const fullTag = `${crrChar}${crrNumber}`;
        newTags[fullTag] = this.tags[fullTag] || '';
      }
    }
    this.decodedTags = {};
    _.map( newTags, ( tagItem, tagIndex ) => {
      if ( !this.tags[tagIndex] ) {
        this.tags[tagIndex] = tagItem;
      }
    });
    let tagArray = [];
    _.map( this.tags, ( tagItem, tagIndex ) => {
      const charCode = tagIndex.charCodeAt( 0 );
      const number = Number( tagIndex.slice( 1 ) );
      const content = tagItem || '';
      tagArray.push({
        charCode,
        number,
        content,
      });
    });
    const orderedTagArray = _.orderBy( tagArray, ['charCode', 'number'], ['asc', 'asc'] );
    let orderedTags = {};
    _.map( orderedTagArray, ( tagItem, tagIndex ) => {
      const crrChar = String.fromCharCode( tagItem.charCode );
      const crrNumber = tagItem.number < 10? `0${tagItem.number}` : tagItem.number;
      const fullTag = `${crrChar}${crrNumber}`;
      orderedTags[fullTag] = tagItem.content || '';
    })
    this.tags = orderedTags;
    this.modified = true;
    this.setState({
      sTags: this.tags,
      sIsShowAddTagModal: false,
      sCheckedTags: {},
    })
  }

  handleClickRemoveTagButton = () => {
    const { sCheckedTags } = this.state;
    let newTags = {};
    _.map( this.tags, ( tagItem, tagIndex ) => {
      if ( !sCheckedTags[tagIndex] ) {
        newTags[tagIndex] = tagItem;
      }
    });
    if ( !_.isEqual( this.tags, newTags ) ) {
      this.modified = true;
    }
    this.tags = newTags;
    this.setState({
      sTags: newTags,
    })
  }

  handleChangeAddedTags = ( e ) => {
    if ( !e ) return;
    const name = e.target.name;
    const value = e.target.value;
    this.addedTags[name] = value.toUpperCase();
  }

  handleChangeTagContent = ( aTag, e ) => {
    if ( !e ) return;
    this.modified = true;
    const value = e.target.value;
    this.tags[aTag] = value;
  }

  handleSaveQRCodes = () => {
    if ( !this.modified ) return;
    let finalData = [];
    _.map( this.tags, ( tagItem, tagIndex ) => {
      finalData.push({
        tag: tagIndex,
        code: tagItem,
      });
    })
    executeQuery({
      method: 'put',
      url: `/pub/updatecode/${this.pubId}`,
      data: {
        barcodes: finalData,
      },
      success: ( res ) => {
        pushNotification( NOTIFICATION_TYPE_SUCCESS, '성공적으로 저장되었습니다.' );
        this.modified = false;
        this.setState({
          sTags: this.tags,
        });
      },
      fail: ( err, res ) => {}
    });
  }

  handleClickTagItem = ( aTag ) => {
    let { sCheckedTags } = this.state;
    const crrState = sCheckedTags[aTag] || false;
    _.set( sCheckedTags, aTag, !crrState );
    this.setState({
      sCheckedTags,
    })
  }

  renderTagItem = ( aTag, aContent ) => {
    const { sCheckedTags } = this.state;
    return (
      <div key={aTag} className='qrcode-tag-item'>
        <div className='qrcode-tag-name'>
          <i className={sCheckedTags[aTag]? 'fa fa-check-square-o' : 'fa fa-square-o'} onClick={this.handleClickTagItem.bind( this, aTag )}/>
          {aTag}
        </div>
        <div className='qrcode-tag-content'>
          <input
            defaultValue={aContent}
            onChange={this.handleChangeTagContent.bind( this, aTag )}
          />
        </div>
      </div>
    )
  }

  renderTags = () => {
    const { sTags } = this.state;
    let resultHtml = [];
    let firstColumnHtml = [];
    let secondColumnHtml = [];
    let index = 0;
    _.map( sTags, ( tagItem, tagIndex ) => {
      if ( index % 2 ) {
        secondColumnHtml.push( this.renderTagItem( tagIndex, tagItem ) );
      } else {
        firstColumnHtml.push( this.renderTagItem( tagIndex, tagItem ) );
      }
      index++;
    });
    resultHtml.push(
      <div key='qrcode-tags-first-column' className='qrcode-tags-first-column'>{firstColumnHtml}</div>
    );
    resultHtml.push(
      <div key='qrcode-tags-second-column' className='qrcode-tags-second-column'>{secondColumnHtml}</div>
    );
    return resultHtml;
  }

  render() {
    const { sIsShowAddTagModal, sFetchStatus } = this.state;
    const tagMask = [/[A-Z]|[a-z]/, /\d/, /\d/];
    if ( sFetchStatus ) {
      return (
        <div className='container-page-qrcode-register'>
          <div className='qrcode-register-header'>
            <div className='qrcode-save-button' onClick={this.handleSaveQRCodes}>저장</div>
            <div className='add-qrcode-tag-button' onClick={this.handleClickAddTagButton}>추가</div>
            <div className='remove-qrcode-tag-button' onClick={this.handleClickRemoveTagButton}>삭제</div>
          </div>
          <div className='qrcode-container'>
            {this.renderTags()}
          </div>
          {sIsShowAddTagModal &&
            <Modal
              isOpen={sIsShowAddTagModal}
              toggle={this.handleCloseAddTagModal}
              className='modal-add-new-tag'
            >
              <ModalHeader 
                toggle={this.handleCloseAddTagModal} 
                className='modal-add-new-tag-header'
              >
                <h4>태그추가</h4>
              </ModalHeader>
              <ModalBody className='modal-add-new-tag-body'>
                <div className='tag-inputer-container'>
                  <MaskedInput
                    mask={tagMask}
                    name='from'
                    defaultValue={this.addedTags.from || ''}
                    placeholder='알파벳+숫자 2자리'
                    onChange={this.handleChangeAddedTags}
                  />
                  ~
                  <MaskedInput
                    mask={tagMask}
                    name='to'
                    defaultValue={this.addedTags.to || ''}
                    placeholder='알파벳+숫자 2자리'
                    onChange={this.handleChangeAddedTags}
                  />
                </div>
                <div className='tag-operation-buttons'>
                  <div className='add-new-tag-button' onClick={this.handleAddNewTags}>추가</div>
                  <div className='cancel-new-tag-button' onClick={this.handleCancelNewTags}>취소</div>
                </div>
              </ModalBody>
            </Modal>
          }
        </div>
      );
    } else {
      return (
        <div className="loading-wrapper"> 
          <Loading />
        </div>
      )
    }
  }
}

QRCodeRegisterComponent.propTypes = {
  pubId: PropTypes.string,
  data: PropTypes.array,
};

QRCodeRegisterComponent.defaultProps = {
  pubId: '',
  data: null,
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(QRCodeRegisterComponent);