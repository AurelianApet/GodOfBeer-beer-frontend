import { call, put, takeEvery } from 'redux-saga/effects';
import { push } from 'react-router-redux';

import { AuthConstants } from '../constants/auth';

import { request, requestSuccess, requestFail } from '../../utils/fetch';
import { appConfig } from '../../../appConfig';

function* signIn(action) {
  if (action.payload.isSuccessed) {
    yield put({
      type: requestSuccess(AuthConstants.AUTH_SIGN_IN),
      payload: action.payload.data,
    });
  } else {
    yield put({
      type: requestFail(AuthConstants.AUTH_SIGN_IN),
      payload: action.payload,
    });
  }
}

function* checkUserData(action) {
  yield call(request({
    type: AuthConstants.AUTH_CHECK_USER_DATA,
    method: 'POST',
    apiUrl: appConfig.apiUrl + '/auth/login',
  }), action);
}

function* register(action) {
  yield call(request({
    type: AuthConstants.AUTH_REGISTER,
    method: 'POST',
    apiUrl: appConfig.apiUrl + '/auth/register',
  }), action);
}

function* signOut(action) {
  yield call(request({
    type: AuthConstants.AUTH_SIGN_IN,
    method: 'POST',
    apiUrl: appConfig.apiUrl + '/auth/logout',
  }), action);
  localStorage.clear();
  yield put(push('/'));
}

function* loginWithToken(action) {
  yield call(request({
    type: AuthConstants.AUTH_LOGIN_WITH_TOKEN,
    method: 'GET',
    apiUrl: appConfig.apiUrl + '/auth/is-authenticated',
  }), action);
}

export default function* () {
  yield takeEvery(AuthConstants.AUTH_SIGN_IN, signIn);
  yield takeEvery(AuthConstants.AUTH_SIGN_OUT, signOut);
  yield takeEvery(AuthConstants.AUTH_REGISTER, register);
  yield takeEvery(AuthConstants.AUTH_LOGIN_WITH_TOKEN, loginWithToken);
  yield takeEvery(AuthConstants.AUTH_CHECK_USER_DATA, checkUserData);
}
