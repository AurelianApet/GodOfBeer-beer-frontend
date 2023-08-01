import {combineReducers} from 'redux';
import {AuthConstants} from '../constants/auth';
import auth from './auth';
import notification from './notification';
import search from './search';

const appReducer = combineReducers({
    auth,
    notification,
    search
});

export default (state, action) => {
    const myState = action.type === AuthConstants.AUTH_SIGN_OUT ? undefined : state;
    return appReducer(myState, action);
};
