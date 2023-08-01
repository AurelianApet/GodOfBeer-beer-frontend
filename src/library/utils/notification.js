import LANG from '../../language';
export const NOTIFICATION_TYPE_SUCCESS = 0;
export const NOTIFICATION_TYPE_WARNING = 1;
export const NOTIFICATION_TYPE_ERROR = 2;

export const pushNotification = (aType, aMessage, aPosition='tr') => {
  let level = 'success';
  switch (aType) {
    case NOTIFICATION_TYPE_SUCCESS:
      level = 'success';
      break;
    case NOTIFICATION_TYPE_WARNING:
      level = 'warning';
      break;
    case NOTIFICATION_TYPE_ERROR:
      level = 'error';
      break;
    default:
      break;
  }

  if (global.notificationSystem) {
    if (typeof aMessage === 'object') {
      aMessage = JSON.stringify(aMessage);
    }
    global.notificationSystem.addNotification({
      message: aMessage, 
      level: level,
      position: aPosition,
    });
  } 
}

export const processSuccessResponse = (msg) => {
  pushNotification(NOTIFICATION_TYPE_SUCCESS, msg);
};

export const processErrorResponse = (res, history = null, showNotification = true) => {
  let msg = LANG('LIBRARY_NOTIFICATION_ERROR_NOTACCESSABLE');
  if (!res) {
    return msg;
  }
  if (res && res.data && res.data.error) {
    msg = res.data.error;
  } else {
    if (res.status) {
      switch(res.status) {
        case 400:
          msg = LANG('LIBRARY_NOTIFICATION_ERROR_400');
          break;
        case 401: 
          msg = LANG('LIBRARY_NOTIFICATION_ERROR_401');
          localStorage.clear();
          if (history) {
            history.push('/');
          }
          break;
        case 402:
          msg = LANG('LIBRARY_NOTIFICATION_ERROR_402');
          break;
        case 403:
          msg = LANG('LIBRARY_NOTIFICATION_ERROR_403');
          break;
        case 404:
          msg = LANG('LIBRARY_NOTIFICATION_ERROR_404');
          break;
        case 406:
          msg = LANG('LIBRARY_NOTIFICAITON_ERROR_406');
          break;
        case 413:
          msg = LANG('LIBRARY_NOTIFICAITON_ERROR_413');
          break;
        case 422:
          msg = LANG('LIBRARY_NOTIFICATION_ERROR_422');
          break;
        case 500:
          msg = LANG('LIBRARY_NOTIFICATION_ERROR_500');
          break;
        default:
          msg = `${LANG('LIBRARY_NOTIFICATION_ERROR_DEFAULT')} ${res.status}`
          break;
      }
    } else {
      if (typeof res === 'object') {
        msg = res.message;
        if (msg === 'Network Error') {
          msg = LANG('LIBRARY_NOTIFICATION_ERROR_NOTACCESSABLE');
        }
      } else {
        msg = LANG('LIBRARY_NOTIFICATION_ERROR_UNKNOWN');
      }
    }
  }
  if (showNotification) {
    if (typeof msg === 'object') {
      msg = JSON.stringify(msg);
    }
    console.log("----------------------------");
    console.log(res);
    pushNotification(NOTIFICATION_TYPE_ERROR, LANG('LIBRARY_NOTIFICATION_ERROR_PREFIX') + msg);
  }
  return msg;
};