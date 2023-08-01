// import { refreshToken } from './login';
import { AuthConstants } from '../redux/constants/auth';

// eslint-disable-next-line
export const refreshTokenMiddleware = ({ dispatch }) => next => async (action) => {
  if (action.type !== AuthConstants.AUTH_SIGN_OUT && localStorage.getItem('expiryTime') !== null) {
    const expiryTime = localStorage.getItem('expiryTime');

    if (expiryTime < Date.now()) {
      const delta = Date.now() - expiryTime;
      if (delta > 3600 * 1000) { // Web browser had been closed
        return next({ type: AuthConstants.AUTH_SIGN_OUT });
      }
      if (localStorage.getItem('isTokenRefreshing') === 'true') {
        const timer = setInterval(() => {
          if (localStorage.getItem('isTokenRefreshing') === 'false') {
            clearInterval(timer);
            return next(action);
          }
        }, 1000);
      } else {
        localStorage.setItem('isTokenRefreshing', 'true');
      }
    } else {
      return next(action);
    }
  } else {
    return next(action);
  }
};
