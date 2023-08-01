import { call, takeEvery } from 'redux-saga/effects';

import { NotificationConstants } from '../constants/notification';

import { request } from '../../utils/fetch';
import { appConfig } from '../../../appConfig';

//notification
function* fetchAllNotification(action) {
    yield call(request({
        type: NotificationConstants.NOTIFICATION_FETCH_ALL,
        method: 'GET',
        apiUrl: appConfig.utilsUrl + '/notification/list',
    }), action);
}

function* deleteOneNotifyList(action) {
    yield call(request({
        type: NotificationConstants.NOTIFICATION_DELETE_ONE_NOTITYLIST,
        method: 'POST',
        apiUrl: appConfig.utilsUrl + '/notification/deleteone',
    }), action);
}

export default function* () {
    //notification
    yield takeEvery(NotificationConstants.NOTIFICATION_FETCH_ALL, fetchAllNotification);
    yield takeEvery(NotificationConstants.NOTIFICATION_DELETE_ONE_NOTITYLIST, deleteOneNotifyList);
}
