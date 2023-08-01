import { AuthConstants } from '../constants/auth';
import { createAction } from 'redux-actions';

export const signIn = createAction(AuthConstants.AUTH_SIGN_IN);
export const signOut = createAction(AuthConstants.AUTH_SIGN_OUT);
export const register = createAction(AuthConstants.AUTH_REGISTER);
export const loginWithToken = createAction(AuthConstants.AUTH_LOGIN_WITH_TOKEN);
export const checkUserData = createAction(AuthConstants.AUTH_CHECK_USER_DATA);
