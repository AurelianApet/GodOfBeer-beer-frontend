import {NotificationConstants } from '../constants/notification';
import { createAction } from 'redux-actions';

// Notification
export const fetchAllNotification = createAction(NotificationConstants.NOTIFICATION_FETCH_ALL);
export const deleteOneNotifyList = createAction(NotificationConstants.NOTIFICATION_DELETE_ONE_NOTITYLIST);