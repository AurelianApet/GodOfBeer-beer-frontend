import _ from 'lodash';
import moment from 'moment';

function dateSort(originalData, { columnName, direction }) {
  const filteredData = [...originalData];
  filteredData.sort((a, b) => {
    const aMoment = moment(a[columnName], 'MMM DD, YYYY h:mm a');
    const bMoment = moment(b[columnName], 'MMM DD, YYYY h:mm a');
    if (aMoment < bMoment) {
      return (direction === 'asc') ? -1 : 1;
    }
    if (aMoment > bMoment) {
      return (direction === 'asc') ? 1 : -1;
    }
    return 0;
  });
  return filteredData;
}

function pageFilter(originalData, pageLength, itemOffset) {
  const filteredData = [...originalData];
  const pageOffset = itemOffset === 0 ? 0 : itemOffset / pageLength;
  const filteredDataChunk = _.chunk(filteredData, pageLength);

  return (filteredDataChunk[pageOffset] === undefined) ? [] : filteredDataChunk[pageOffset];
}

function textFilter(originalData, columnName, key, condition) {
  let filteredData = [];
  let pattern = '';
  switch (condition) {
    case 0: // Begin with
      filteredData = originalData.filter((item) => {
        pattern = new RegExp(`^${key.toString().toLowerCase()}`);
        return pattern.test(item[columnName].toString().toLowerCase());
      });
      break;
    case 1: // Contains
      filteredData = originalData.filter((item) => {
        pattern = new RegExp(key.toString().toLowerCase());
        return pattern.test(item[columnName].toString().toLowerCase());
      });
      break;
    case 2: // Doesn't contain
      filteredData = originalData.filter((item) => {
        pattern = new RegExp(key.toString().toLowerCase());
        return !pattern.test(item[columnName].toString().toLowerCase());
      });
      break;
    case 3: // Ends with
      filteredData = originalData.filter((item) => {
        pattern = new RegExp(`${key.toString().toLowerCase()}$`);
        return pattern.test(item[columnName].toString().toLowerCase());
      });
      break;
    case 4: // Equals
      filteredData = originalData.filter(item => item[columnName].toString().toLowerCase() === key.toString().toLowerCase());
      break;
    case 5: // Doesn't equals
      filteredData = originalData.filter(item => !(item[columnName].toString().toLowerCase() === key.toString().toLowerCase()));
      break;
    default:
      break;
  }
  return filteredData;
}

function dateFilter(originalData, columnName, key, condition) {
  let filteredData = [];
  let date = '';
  let validKey;
  if (typeof key === 'string' || key instanceof String) {
    validKey = moment(key);
  } else {
    validKey = key;
  }
  switch (condition) {
    case 0: // Equals
      filteredData = originalData.filter((item) => {
        date = moment(item[columnName], 'MMM DD, YYYY h:mm a');
        return date.toDate().getTime() === validKey.toDate().getTime();
      });
      break;
    case 1: // Doesn't equal
      filteredData = originalData.filter((item) => {
        date = moment(item[columnName], 'MMM DD, YYYY h:mm a');
        return !(date.toDate().getTime() === validKey.toDate().getTime());
      });
      break;
    case 2: // Is Less than
      filteredData = originalData.filter((item) => {
        date = moment(item[columnName], 'MMM DD, YYYY h:mm a');
        return (date.toDate().getTime() < validKey.toDate().getTime());
      });
      break;
    case 3: // Is Less than or equal to
      filteredData = originalData.filter((item) => {
        date = moment(item[columnName], 'MMM DD, YYYY h:mm a');
        return (date.toDate().getTime() <= validKey.toDate().getTime());
      });
      break;
    case 4: // Is greater than
      filteredData = originalData.filter((item) => {
        date = moment(item[columnName], 'MMM DD, YYYY h:mm a');
        return (date.toDate().getTime() > validKey.toDate().getTime());
      });
      break;
    case 5: // Is greater than or equal to
      filteredData = originalData.filter((item) => {
        date = moment(item[columnName], 'MMM DD, YYYY h:mm a');
        return (date.toDate().getTime() >= validKey.toDate().getTime());
      });
      break;
    default:
      break;
  }
  return filteredData;
}

function checkFilter(originalData, columnName, key) {
  let filteredData = [];
  filteredData = originalData.filter((item) => {
    if (key === 'checked') {
      return item[columnName];
    } else if (key === 'unchecked') {
      return !item[columnName];
    }
    return true;
  });
  return filteredData;
}

function tagFilter(originalData, columnName, key) {
  const data = [...originalData];
  return data.filter((item) => {
    const tags = item[columnName];
    let finalResult = false;
    for (let i = 0; i < key.length; i++) {
      const pattern = new RegExp(key[i].toString().toLowerCase());
      let result = false;
      for (let j = 0; j < tags.length; j++) {
        result = result || pattern.test(tags[j].toString().toLowerCase());
      }
      finalResult = finalResult || result;
    }
    return finalResult;
  });
}

function tagTextFilter(originalData, columnName, key, condition) {
  let filteredData = [];
  let pattern = '';
  const keyString = key.join('');
  switch (condition) {
    case 0: // Begin with
      filteredData = originalData.filter((item) => {
        pattern = new RegExp(`^${keyString.toString().toLowerCase()}`);
        const itemString = item[columnName].join(' ');
        return pattern.test(itemString.toString().toLowerCase());
      });
      break;
    case 1: // Contains
      filteredData = originalData.filter((item) => {
        pattern = new RegExp(keyString.toString().toLowerCase());
        const itemString = item[columnName].join(' ');
        return pattern.test(itemString.toString().toLowerCase());
      });
      break;
    case 2: // Doesn't contain
      filteredData = originalData.filter((item) => {
        pattern = new RegExp(keyString.toString().toLowerCase());
        const itemString = item[columnName].join(' ');
        return !pattern.test(itemString.toString().toLowerCase());
      });
      break;
    case 3: // Ends with
      filteredData = originalData.filter((item) => {
        pattern = new RegExp(`${keyString.toString().toLowerCase()}$`);
        const itemString = item[columnName].join(' ');
        return pattern.test(itemString.toString().toLowerCase());
      });
      break;
    case 4: // Equals
      filteredData = originalData.filter((item) => {
        const itemString = item[columnName].join(' ');
        return (itemString.toString().toLowerCase() === keyString.toString().toLowerCase());
      });
      break;
    case 5: // Doesn't equals
      filteredData = originalData.filter((item) => {
        const itemString = item[columnName].join(' ');
        return !(itemString.toString().toLowerCase() === keyString.toString().toLowerCase());
      });
      break;
    default:
      break;
  }
  return filteredData;
}

export function tableFilter(originalData, { pageLength, pageOffset, keys, sorting }, hasHeaderTag = false) {
  let inputFilteredData = [...originalData];
  if (hasHeaderTag) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key.type === 'htag') {
        if (key.data.length !== 0) {
          inputFilteredData = tagFilter(originalData, key.columnName, key.data);
        }
      }
    }
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    switch (key.type) {
      case 'text':
        if (key.data !== '') {
          inputFilteredData = textFilter(inputFilteredData, key.columnName, key.data, key.conditionIndex);
        }
        break;
      case 'multi-text':
        if (key.data !== '') {
          inputFilteredData = textFilter(inputFilteredData, key.columnName, key.data, key.conditionIndex);
        }
        break;
      case 'date':
        if (key.data) {
          inputFilteredData = dateFilter(inputFilteredData, key.columnName, key.data, key.conditionIndex);
        }
        break;
      case 'check':
        if (key.data !== 'both') {
          inputFilteredData = checkFilter(inputFilteredData, key.columnName, key.data);
        }
        break;
      case 'tag':
        if (key.data.length !== 0) {
          inputFilteredData = tagTextFilter(inputFilteredData, key.columnName, key.data, key.conditionIndex);
        }
        break;
      case 'tag-text':
        if (key.data.length !== 0) {
          inputFilteredData = tagTextFilter(inputFilteredData, key.columnName, key.data, key.conditionIndex);
        }
        break;
      default:
    }
  }
  let sortedData = inputFilteredData;
  if (sorting && sorting.columnName) {
    sortedData = (sorting.columnName === 'date') ?
      dateSort(inputFilteredData, sorting) :
      _.orderBy(inputFilteredData, [sorting.columnName], [sorting.direction]);
  }
  const rowCount = sortedData.length;
  const filteredData = pageFilter(sortedData, pageLength, pageOffset);
  return { filteredData, rowCount };
}
