import _ from 'lodash';
import ko from './lang/ko';
import en from './lang/en';
import cn from './lang/cn';

export const LANG_KO = 'korean';
export const LANG_EN = 'english';
export const LANG_CN = 'chinese';

global.language = LANG_KO;

const get = (id) => {
  let lang = {};
  switch (global.language) {
    case LANG_KO:
      lang = ko;
      break;
    case LANG_EN:
      lang = en;
      break;
    case LANG_CN:
      lang = cn;
      break;
    default:
      lang = {};
      break;
  }
  return _.get(lang, id) || id;
}

export const setLanguage = (lang) => {
  global.language = lang;
}

export default get; 