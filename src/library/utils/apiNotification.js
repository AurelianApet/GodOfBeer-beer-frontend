import _ from 'lodash';

export const API_NOTIFICATION_NEWS = 'COL_NEWS';
export const API_NOTIFICATION_COMMAND = 'COL_COMMAND';
export const API_NOTIFICATION_MESSAGE = 'COL_MESSAGE';
export const API_NOTIFICATION_RESOURCE = 'COL_RESOURCE';
export const API_NOTIFICATION_DOCSEND = 'COL_DOCSEND';
export const API_NOTIFICATION_TIMETABLE = 'COL_TIMETABLE';
export const API_NOTIFICATION_TOADMIN = 'COL_TO_ADMIN';
export const API_NOTIFICATION_NEW_USER = 'COL_NEW_USER';

export const getAPINotifications = (aProps, aType) => {
  if (aProps && aProps.notifications && aProps.notifications[aType] && aProps.notifications[aType].data) {
    return aProps.notifications[aType].data;
  } else {
    return [];
  }
}

export const hasNewNotification = (aProps, aType, prevUnreadRows) => {
  const newNotifications = getAPINotifications(aProps, aType);
  let hasNew = false;
  _.map(newNotifications, (newItem) => {
    let found = false;
    _.map(prevUnreadRows, (item) => {
      if (item === newItem) {
        found = true;
      }
    })
    if (!found) { // obviously it has new notification
      hasNew = true;
    }
  })
  return hasNew;
}

export const readOneNotification = (aId, aType, aReduxFunc) => {
  if (aReduxFunc && aId && aType) {
    aReduxFunc({
      data: {
        objectId: aId,
        tableName: aType,
      },
      success: (res) => {
      },
      fail: (res) => {
      }
    })
  } else {
  }
}

export const readSomeNotifications = (aIds, aType, aReduxFunc) => {
  if (aReduxFunc && aIds && aType) {
    aReduxFunc({
      data: {
        ids: aIds,
        tableName: aType,
      },
      success: (res) => {
      },
      fail: (res) => {
      }
    })
  } else {
  }
}