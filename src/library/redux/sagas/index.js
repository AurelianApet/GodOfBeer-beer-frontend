import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import notificationSaga from './notificationSaga';

export default function* () {
  yield all([
    authSaga(),
    notificationSaga(),
  ]);
}
