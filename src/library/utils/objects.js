import _ from 'lodash';

const setValue = (obj, path, value) => {
  const keys = path.split('.');
  let o = obj;

  keys.map((key, i) => {
    if (i >= keys.length - 1) return false;
    o[key] = o[key] || {};
    o = o[key];
    return true;
  });

  o[keys[keys.length - 1]] = value;
};

export const getDeepValue = (obj, path) => {
  let o = obj;
  let p = path.replace(/\[(\w+)\]/g, '.$1');
  p = path.replace(/^\./, '');
  const keys = p.split('.');
  while (keys.length) {
    const n = keys.shift();
    if (n in o) {
      o = o[n];
    } else {
      return;
    }
  }
  return o;
};

export const setDeepValue = (obj, path, value) => {
  const newData = Object.assign({}, obj);
  setValue(newData, path, value);
  return newData;
};

export const copyObject = (source, param ) => {
  const srcObj = source || {};
  const forbiddenKeys = param || [];
  const isForbiddenKey = (aKey) => {
    if (forbiddenKeys.length === 0) return false;
    let isForbidden = false;
    _.map(forbiddenKeys, (keyItem, keyIndex) => {
      if (aKey === keyItem) isForbidden = true;
    });
    return isForbidden;
  }
  let copiedObj = {};
  for (let key in srcObj) {
    const value = srcObj[key] || null;
    if (typeof value === 'object') {
      _.set(copiedObj, key, copyObject(value, forbiddenKeys));
    } else {
      if (!isForbiddenKey(key)) {
        _.set(copiedObj, key, value);
      }
    }
  }
  return copiedObj;
}