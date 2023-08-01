import dateFns from 'date-fns';
import _ from 'lodash';

export const getCurrentDate = () => dateFns.format(new Date(), 'M/DD/YYYY');
export const formatCurrency = (x, decimalCount) => Number.parseFloat(x).toFixed(decimalCount).replace(/\d(?=(\d{3})+\.)/g, '$&,');
export const maskBankInformation = (val = '') => (val.length <= 4 ? val : `${val.substring(0, val.length - 4).replace(/[a-z\d]/gi, 'X')}${val.substring(val.length - 4, val.length)}`);

export const getDate = (date) => dateFns.format(date.toISOString(), 'YYYY/MM/DD');

export const getDateDash = (date) => dateFns.format(new Date(date), 'YYYY-MM-DD');

export const getPass6Month = (date = new Date()) => {
  let year = (new Date(date)).getFullYear();
  let month = (new Date(date)).getMonth() + 6;
  let day = (new Date(date)).getDay();
  let returnDay = new Date();
  returnDay.setFullYear(year + month / 12, month % 12, day);
  return returnDay;
}
export const getYesterday = (date = new Date()) => new Date((new Date(date)).getTime() - 86400000);
export const getDateZeroMillisecond = (date = new Date()) => {
  let today = new Date(date);
  let milli = today.getTime();
  return milli;
}

export const getPermissions = (aData = []) => {
    if (aData.length === 0) return {create: false, read: false, update: false, del: false, sign: {r: false, c: false, u: false, d: false,}};
    const pagePrefix = aData[0].pid.split("-")[0];
    let create = false;
    let read = false;
    let update = false;
    let del = false;
    let sign = {r: false, c: false, u: false, d: false, };
    _.map(aData, (item, index) => {
        if (item.pid === `${pagePrefix}-c`) {
            create = true;
            sign.c = item.permission.sign;
        }
        if (item.pid === `${pagePrefix}-r`) {
            read = true;
            sign.r = item.permission.sign;
        }
        if (item.pid === `${pagePrefix}-u`) {
            update = true;
            sign.u = item.permission.sign;
        }
    })
    return {create: create, read: read, update: update, del: del, sign: sign};
}

export const getGroup = (aGroups, aUser, aKind) => {
    let result = {};
    _.map(aGroups, (groupItem, groupIndex) => {
        let hasKind = false;
        _.map(groupItem.kind, (kindItem, kindIndex) => {
            if (Number(aKind) === Number(kindItem)) hasKind = true;
        })
        if (hasKind) {
            let hasUser = false;
            _.map(groupItem.members, (memberItem, memberIndex) => {
                if (aUser === memberItem.uid) hasUser = true;
            })
            if (hasUser) result = groupItem;
        }
    })
    return result;
}

const checkMenuItem = (menuItem, pid) => {
  const hasChilds = menuItem && menuItem.childs && menuItem.childs.length > 0 ? true : false;
  
  if (menuItem.pid === pid) {
      hasPage = true;
  }

  if (hasChilds) {
    _.map(menuItem.childs, (childItem) => {
      checkMenuItem(childItem, pid); 
    })
  }
}

let hasPage = false;
export const getPageFromMenus = (menus, pid) => {
  hasPage = false;
  _.map(menus, (subMeuns, key) => {
    _.map(subMeuns, (menuItem) => {
    checkMenuItem(menuItem, pid);
    });
  });
  return hasPage;
}

export const getQuerysFromPath = ( aQueryString ) => {
  let result = null;
  if ( aQueryString ) {
    result = {};
    const query = aQueryString[0] === '?'? aQueryString.substr( 1, aQueryString.length ) : aQueryString;
    const querySplited = query.split( '&' );
    _.map( querySplited, ( queryItem, queryIndex ) => {
      const queryItemSplited = queryItem.split( '=' );
      result[queryItemSplited[0] || ''] = queryItemSplited[1] || '';
    });
  }
  return result;
}