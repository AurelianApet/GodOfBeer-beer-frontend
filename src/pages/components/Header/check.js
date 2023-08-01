import _ from 'lodash';

import { pushNotification, NOTIFICATION_TYPE_ERROR, NOTIFICATION_TYPE_SUCCESS } from '../../../library/utils/notification';
import { executeQuery } from '../../../library/utils/fetch';

export const checkUserIDDuplication = ( aUserID ) => {
  if ( !aUserID ) {
    return;
  }
  executeQuery({
    method: 'get',
    url: '/auth/duplicate-id',
    params: {
      userID: aUserID,
    },
    success: ( res ) => {
      const duplicated = res.duplicated || false;
      const notificationMsg = duplicated? '이미 가입된 아이디입니다. 다시 입력하세요.' : '사용 가능한 아이디입니다.';
      pushNotification( duplicated? NOTIFICATION_TYPE_ERROR : NOTIFICATION_TYPE_SUCCESS, notificationMsg );
    },
    fail: ( err, res ) => {
      const errMsg = _.get( err, 'data.error' ) || '서버와의 통신에 실패하였습니다. 관리자에게 문의해주세요.';
      pushNotification( NOTIFICATION_TYPE_ERROR, errMsg );
    }
  })
}

export const checkBusinessNumberDuplication = ( aBusinessNumber,aCallBack ) => {
  if ( !aBusinessNumber ) {
    return;
  }
  executeQuery({
    method: 'get',
    url: '/auth/duplicate-businessnumber',
    params: {
      businessNumber: aBusinessNumber,
    },
    success: ( res ) => {
      const duplicated = res.duplicated || false;
      const notificationMsg = duplicated? '이미 등록된 번호입니다. 다시 입력하세요.' : '사용 가능한 번호입니다.';
      pushNotification( duplicated? NOTIFICATION_TYPE_ERROR : NOTIFICATION_TYPE_SUCCESS, notificationMsg );
      aCallBack( !duplicated );
    },
    fail: ( err, res ) => {
      const errMsg = _.get( err, 'data.error' ) || '서버와의 통신에 실패하였습니다. 관리자에게 문의해주세요.';
      pushNotification( NOTIFICATION_TYPE_ERROR, errMsg );
      aCallBack( false );
    }
  })
}

export const checkNickNameDuplication = ( aNickName, aCallBack ) => {
  if ( !aNickName ) {
    return;
  }
  executeQuery({
    method: 'get',
    url: '/auth/duplicate-nickname',
    params: {
      nickName: aNickName,
    },
    success: ( res ) => {
      const duplicated = res.duplicated || false;
      const notificationMsg = duplicated? '이미 등록된 닉네임입니다. 다시 입력하세요.' : '사용 가능한 닉네임입니다.';
      pushNotification( duplicated? NOTIFICATION_TYPE_ERROR : NOTIFICATION_TYPE_SUCCESS, notificationMsg );
      aCallBack( true );
    },
    fail: ( err, res ) => {
      const errMsg = _.get( err, 'data.error' ) || '서버와의 통신에 실패하였습니다. 관리자에게 문의해주세요.';
      pushNotification( NOTIFICATION_TYPE_ERROR, errMsg );
      aCallBack( false );
    }
  })
}

export const sendPhoneNumber = ( aNumber, aCallBack ) => {
  executeQuery({
    method: 'post',
    url: '/auth/phone-verify',
    data: {
      phoneNumber: aNumber,
    },
    success: ( res ) => {
      pushNotification( NOTIFICATION_TYPE_SUCCESS, '성공적으로 발송하였습니다.' );
      aCallBack( res.vId );
    },
    fail: ( err, res ) => {
      const errMsg = _.get( err, 'data.error' ) || '서버와의 통신에 실패하였습니다. 관리자에게 문의해주세요.';
      pushNotification( NOTIFICATION_TYPE_ERROR, errMsg );
      aCallBack( null );
    }
  })
}

export const sendAuthNo = ( aData, aCallBack ) => {
  executeQuery({
    method: 'post',
    url: '/auth/check-verifycode',
    data: aData || {},
    success: ( res ) => {
      pushNotification( NOTIFICATION_TYPE_SUCCESS, '인증확인' );
      aCallBack( res.verify );
    },
    fail: ( err, res ) => {
      pushNotification( NOTIFICATION_TYPE_ERROR, '인증실패' );
      aCallBack( false );
    }
  })
}

export const sendEmailAuth = ( aEmail, aCallBack ) => {
  if ( !aEmail ) {
    return;
  }
  executeQuery({
    method: 'post',
    url: '/auth/email-verify',
    data: {
      email: aEmail,
    },
    success: ( res ) => {
      pushNotification( NOTIFICATION_TYPE_SUCCESS, '성공적으로 발송하였습니다.' );
      aCallBack( res.vId );
    },
    fail: ( err, res ) => {
      const errMsg = _.get( err, 'data.error' ) || '서버와의 통신에 실패하였습니다. 관리자에게 문의해주세요.';
      pushNotification( NOTIFICATION_TYPE_ERROR, errMsg );
      aCallBack( null );
    }
  })
}