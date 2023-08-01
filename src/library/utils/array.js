import _ from 'lodash';
export const removeFromArray = (srcArray, path, value) => {
  let result = [];
  _.map(srcArray, (item, index) => {
    if (path) {
      if (_.get(item, path) !== value) {
        result.push(item);
      }
    } else {
      if (item !== value) {
        result.push(item);
      }
    }
  })
  return result;
}

export const removeItemFromArray = (srcArray, value) => {
  let result = [];
  _.map(srcArray, item => {
    if ( item !== value) {
      result.push(item);
    }
  })
  return result;
}

export const removeItemsFromArray = (srcArray, path, values) => {
  let result = [];
  _.map(srcArray, (item, index) => {
    let found = false;
    _.map(values, (value, index2) => {
      if (_.get(item, path) === value) {
        found = true;
      }
    });
    if (!found) {
      result.push(item);
    }
  });
  return result;
}

export const findFromArray = (srcArray, path, value) => {
  let found = null;
  _.map(srcArray, (item, index) => {
    if ( !path ) {
      if ( item === value ) {
        found = item;
      }
    } else {
      if (_.get(item, path) === value) {
        found = item;
      }
    }
  })
  return found;
}

export const findIndexFromArray = (srcArray, path, value) => {
  let found = null;
  _.map(srcArray, (item, index) => {
    if ( !path ) {
      if ( item === value ) {
        found = index;
      }
    } else {
      if (_.get(item, path) === value) {
        found = index;
      }
    }
  })
  return found;
}

export const findItemsFromArray = (srcArray, path, values) => {
  let result = [];
  _.map(srcArray, (item, index) => {
    _.map(values, (value, index2) => {
      if (_.get(item, path) === value) {
        result.push(item);
      }
    });
  });
  return result;
}

export const getItemsFromArray = (srcArray, path) => {
    let result = [];
    _.map(srcArray, (item, index) => {
        result.push(_.get(item, path));
    });
    return result;
}