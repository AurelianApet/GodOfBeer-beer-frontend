import { SearchConstants } from '../constants/search';
import { createAction } from 'redux-actions';

export const setSearchWord = createAction(SearchConstants.SET_SEARCH_WORD);
export const setCopyright = createAction(SearchConstants.SET_COPYRIGHT);
