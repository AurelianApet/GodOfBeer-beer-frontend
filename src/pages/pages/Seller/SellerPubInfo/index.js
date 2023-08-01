import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import MaskedInput from 'react-text-mask';

import { executeQuery } from '../../../../library/utils/fetch';
import { findFromArray, findIndexFromArray } from '../../../../library/utils/array';
import { pushNotification, NOTIFICATION_TYPE_ERROR, NOTIFICATION_TYPE_SUCCESS } from '../../../../library/utils/notification';
import Loading from '../../../components/Loading';
import FileUploadPublic from '../../../components/FileUploadPublic';

const DAY_STRING = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const DAY_STRING_SHORT = ['월', '화', '수', '목', '금', '토', '일'];

class PubInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sPubInfo: {},
      sRest: {},
      sPubImages: [],
      sFetchStatus: false,
    }
    this.pubContent = '';
  }

  componentDidMount = () => {
    this.getData();
  }

  getData = () => {
    const userId = _.get( this.props, 'user._id' ) || '';
    if ( userId ) {
      executeQuery({
        method: 'get',
        url: `/pub/fetchone?uid=${userId}`,
        success: ( res ) => {
          const result = _.get( res, 'pub[0]' ) || {};
          this.serviceTimeTable = result.businessTime || [];
          let restResult = {};
          _.map( this.serviceTimeTable, ( item, index ) => {
            const day = item.day;
            restResult[day] = item.rest || false;
          });
          this.pubContent = result.content;
          this.setState({
            sFetchStatus: true,
            sPubInfo: result,
            sRest: restResult,
            sPubImages: result.pubImages,
          })
        },
        fail: ( err, res ) => {

        }
      })
    } else {
      setTimeout(() => {
        this.getData();
      }, 100);
    }
  }

  validateServiceTime = () => {
    const { sPubImages } = this.state;
    let result = false;
    _.map( this.serviceTimeTable, ( item, index ) => {
      if ( typeof item === 'object' ) {
        _.map( item, ( subItem, subIndex ) => {
          if ( subItem ) {
            result = true;
            return;
          }
        });
      } else {
        if ( item ) {
          result = true;
        }
      }
    });
    if(result) {
      if(sPubImages.length > 0) {
        return 0;
      }
      else {
        return 2;
      }
    }
    else {
      return 1;
    }
  }

  handleChangeServiceTimeTable = ( aDay, aType, e ) => {
    if ( !e ) return;
    const index = findIndexFromArray( this.serviceTimeTable, 'day', aDay );
    const value = e.target.value || '';
    if ( index || index === 0 ) {
      _.set( this.serviceTimeTable, `[${index}].${aType}`, value );
    } else {
      let newServiceTimeTable = {day: aDay};
      newServiceTimeTable[aType] = value;
      this.serviceTimeTable.push( newServiceTimeTable );
    }
  }

  handleChangeServiceTimeRest = ( aDay, e ) => {
    if ( !e ) return;
    let { sRest } = this.state;
    const index = findIndexFromArray( this.serviceTimeTable, 'day', aDay );
    const value = sRest[aDay] || false;
    if ( index || index === 0 ) {
      _.set( this.serviceTimeTable, `[${index}].rest`, !value );
      sRest[aDay] = !value;
      this.setState({
        sRest,
      })
    } else {
      const newServiceTimeTable = {day: aDay, rest: true};
      sRest[aDay] = true;
      this.serviceTimeTable.push( newServiceTimeTable );
      this.setState({
        sRest,
      })
    }
  }

  handleSavePubInfo = () => {
    const { sPubInfo, sPubImages } = this.state;
    const validation = this.validateServiceTime();
    if ( validation === 0 ) {
      executeQuery({
        method: 'put',
        url: `/pub/updateone/${sPubInfo._id}`,
        data: {
          businessTime: this.serviceTimeTable,
          content: this.pubContent,
          pubImages: sPubImages,
        },
        success: ( res ) => {
          pushNotification( NOTIFICATION_TYPE_SUCCESS, '저장에 성공했습니다.' );
        },
        fail: ( err, res ) => {
          pushNotification( NOTIFICATION_TYPE_ERROR, '저장에 실패했습니다.' );
        }
      });
    }
    else if(validation === 1) {
      pushNotification( NOTIFICATION_TYPE_ERROR, '영업시간을 정확히 입력하세요.' );
    }
    else {
      pushNotification( NOTIFICATION_TYPE_ERROR, '사진을 추가하세요.' );
    }
  }

  handleContentChanged = (e) => {
    this.pubContent = e.target.value;
  }

  handleGetPhoto = ( aFiles ) => {
    let { sPubImages } = this.state;
    const files = aFiles || [];
    _.map( files, ( fileItem, fileIndex ) => {
      const url = fileItem.url || '';
      sPubImages.push( url );
    });
    this.setState({
      sPubImages,
    });
  }

  handleClickAddPubImages = () => {
    if ( this.fileUploadPublic ) {
      this.fileUploadPublic.handleClickFileUpload();
    }
  }

  handleRemoveSubImage = ( aIndex ) => {
    let { sPubImages } = this.state;
    sPubImages.splice( aIndex, 1 );
    this.setState({
      sPubImages,
    })
  }

  renderServiceTimeRest = ( aServiceTimeItem, aDay ) => {
    const { sRest } = this.state;
    return (
      <i
        className={sRest[aDay]? 'fa fa-check-square-o' : 'fa fa-square-o'}
        onClick={this.handleChangeServiceTimeRest.bind( this, aDay )}
      />
    )
  }

  renderServiceTimeItem = ( aServiceTimeItem, aType, aDay ) => {
    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/];
    return (
      <MaskedInput
        mask={timeMask}
        defaultValue={aServiceTimeItem[aType] || ''}
        onChange={this.handleChangeServiceTimeTable.bind( this, aDay, aType )}
      />
    )
  }

  renderPubServiceTimeTable = () => {
    const { isMobileDimension } = this.props;
    const dayString = isMobileDimension? DAY_STRING_SHORT : DAY_STRING;
    return (
      <table>
        <thead>
          <tr>
            <th>요일</th>
            <th>시작시간</th>
            <th>종료시간</th>
            <th>휴무</th>
          </tr>
        </thead>
        <tbody>
          {_.map( dayString, ( dayItem, dayIndex ) => {
            const crrValue = findFromArray( this.serviceTimeTable, 'day', dayIndex ) || {};
            return (
              <tr key={dayIndex}>
                <td>{dayItem}</td>
                <td>{this.renderServiceTimeItem( crrValue, 'startTime', dayIndex )}</td>
                <td>{this.renderServiceTimeItem( crrValue, 'endTime', dayIndex )}</td>
                <td>{this.renderServiceTimeRest( crrValue, dayIndex )}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  render() {
    const { sPubInfo, sFetchStatus, sPubImages } = this.state;
    const pubImage = _.get( this.props, 'user.image') || '/assets/images/beerTable/no_image.png';
    if ( sFetchStatus ) {
      return (
        <div className='container-page-pubinfo'>
          <div className='pub-main-info'>
            <div className='pub-main-image'>
              <img src={pubImage} alt=''/>
            </div>
            <div className='pub-name'>
              <span>{_.get( sPubInfo, 'name' ) || ''}</span>
            </div>
          </div>
          <div className='pub-sub-images'>
            <FileUploadPublic
              onRef={ ( ref ) => { this.fileUploadPublic = ref }}
              title='이미지등록'
              pIsCustomCallback={true}
              pHasButton={false}
              pFileFilter={/^(image\/bmp|image\/gif|image\/jpg|image\/jpeg|image\/png)$/i}
              pHandleUploadDone={this.handleGetPhoto}
            />
            <div className='pub-sub-images-title'>사진등록</div>
            <div className='pub-sub-images-add-remove-buttons'>
              <div className='add-remove-button' onClick={this.handleClickAddPubImages}>추가</div>
            </div>
            <div className='pub-sub-images-container'>
              {sPubImages.length === 0?
                '등록사진이 없습니다.'
              :
                _.map( sPubImages, ( subImageItem, subImageIndex ) => {
                  return (
                    <div key={subImageIndex} className='pub-sub-image-item'>
                      <i className='fa fa-close' onClick={this.handleRemoveSubImage.bind( this, subImageIndex )} />
                      <img key={subImageIndex} src={subImageItem} alt='' />
                    </div>
                  );
                })
              }
            </div>
          </div>
          <div className='pub-service-time'>
            <div className='pub-service-time-title'>영업시간</div>
            <div className='pub-service-time-table'>
              {this.renderPubServiceTimeTable()}
            </div>
          </div>
          <div className = 'pub-content'>
            <div className = 'pub-content-title'>매장소개</div>
            <textarea className = 'pub-content-input' defaultValue = {this.pubContent} onChange = {this.handleContentChanged}/>
          </div>
          <div className='pub-info-operation-button'>
            <div className='pub-service-time-save-button' onClick={this.handleSavePubInfo}>저장</div>
          </div>
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

PubInfo.propTypes = {
};

PubInfo.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(PubInfo);