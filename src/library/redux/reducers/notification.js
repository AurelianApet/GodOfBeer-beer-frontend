// @flow
/**
 * @module Reducers/Auth
 * @desc Auth Reducer
 */

import { handleActions } from 'redux-actions';
import { NotificationConstants } from '../constants/notification';
import { requestPending, requestSuccess, requestFail } from '../../utils/fetch';

const initialState = {
    notifications: {
    },
};

export default handleActions({
  [requestPending(NotificationConstants.NOTIFICATION_FETCH_ALL)]: state => ({
    ...state,
  }),
  [requestSuccess(NotificationConstants.NOTIFICATION_FETCH_ALL)]: (state, action) => ({
    ...state,
    notifications: action.payload.notifications,
  }),
  [requestFail(NotificationConstants.NOTIFICATION_FETCH_ALL)]: (state, action) => ({
    ...state,
  }),

  [requestPending(NotificationConstants.NOTIFICATION_DELETE_ONE_NOTITYLIST)]: state => ({
    ...state,
  }),
  [requestSuccess(NotificationConstants.NOTIFICATION_DELETE_ONE_NOTITYLIST)]: (state, action) => ({
    ...state,
    notifications: action.payload.notifications,
  }),
  [requestFail(NotificationConstants.NOTIFICATION_DELETE_ONE_NOTITYLIST)]: (state, action) => ({
    ...state,
  }),

  [requestPending(NotificationConstants.NOTIFICATION_DELETE_SEVERAL_NOTIFYLIST)]: state => ({
    ...state,
  }),
  [requestSuccess(NotificationConstants.NOTIFICATION_DELETE_SEVERAL_NOTIFYLIST)]: (state, action) => ({
    ...state,
    notifications: action.payload.notifications,
  }),
  [requestFail(NotificationConstants.NOTIFICATION_DELETE_SEVERAL_NOTIFYLIST)]: (state, action) => ({
    ...state,
  }),
}, initialState);
