// @flow
/**
 * @module Reducers/Auth
 * @desc Auth Reducer
 */

import {handleActions} from 'redux-actions';
import {SearchConstants} from "../constants/search";

const initialState = {
    searchWord: '',
    copyright: "Copyright God of Beer 2021",
    data: {
        beer: [],
        brewery: [],
        pub: []
    },
};

export default handleActions({
    [SearchConstants.SET_SEARCH_WORD]: (state, action) => ({
        ...state,
        searchWord: action.payload.searchWord
    }),
    [SearchConstants.SET_COPYRIGHT]: (state, action) => ({
        ...state,
        copyright: action.payload.copyright
    }),
}, initialState);
