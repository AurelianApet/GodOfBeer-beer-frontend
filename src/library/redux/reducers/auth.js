// @flow
/**
 * @module Reducers/Auth
 * @desc Auth Reducer
 */

import { handleActions } from 'redux-actions';
import { AuthConstants } from '../constants/auth';
import { requestPending, requestSuccess, requestFail } from '../../utils/fetch';

const initialState = {
  admin: null,
  user: null,
  menus: null,
  groups: null,
  isAuthenticated: false,
};

export default handleActions({
  [requestPending(AuthConstants.AUTH_SIGN_IN)]: state => ({
    ...state,
  }),
  [requestSuccess(AuthConstants.AUTH_SIGN_IN)]: (state, action) => ({
    ...state,
    user: action.payload.user,
    menus: action.payload.menu,
    groups: action.payload.groups,
    admin: action.payload.admin,
    isAuthenticated: true,
  }),
  [requestFail(AuthConstants.AUTH_SIGN_IN)]: (state, action) => ({
    ...state,
    user: null,
    menus: null,
    groups: null,
    admin: null,
    isAuthenticated: false,
  }),
  [requestSuccess(AuthConstants.AUTH_CHECK_USER_DATA)]: (state, action) => ({
    ...state,
    user: action.payload.user,
    menus: action.payload.menu,
    groups: action.payload.groups,
    admin: action.payload.admin,
    isAuthenticated: true,
  }),
  [requestFail(AuthConstants.AUTH_CHECK_USER_DATA)]: (state, action) => ({
    ...state,
    // user: action.payload.user,
    // menus: action.payload.menu,
    // isAuthenticated: true,
  }),
  [requestPending(AuthConstants.AUTH_LOGIN_WITH_TOKEN)]: state => ({
    ...state,
  }),
  [requestSuccess(AuthConstants.AUTH_LOGIN_WITH_TOKEN)]: (state, action) => ({
    ...state,
    user: action.payload.user,
    menus: action.payload.menu,
    groups: action.payload.groups,
    admin: action.payload.admin,
    isAuthenticated: true,
  }),
  [requestFail(AuthConstants.AUTH_LOGIN_WITH_TOKEN)]: (state, action) => ({
    ...state,
    user: null,
    menus: null,
    groups: null,
    admin: null,
    isAuthenticated: false,
  }),
}, initialState);
