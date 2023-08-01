import _ from 'lodash';

let foundMenuItem = null;
const defaultPermission = {
  read: false,
  create: false,
  update: false,
  delete: false,
};

const checkMenuItem = (menuItem, path) => {
  const hasChilds = menuItem && menuItem.childs && menuItem.childs.length > 0;
  if (path.indexOf(menuItem.url) >= 0) {
    foundMenuItem = menuItem;
  }
  if (hasChilds) {
    _.map(menuItem.childs, (childItem) => {
      checkMenuItem(childItem, path); 
    })
  }
}
export const getPageInfo = (menus, path) => {
  if(!menus)
    return null;

  foundMenuItem = null;
  _.map(menus, (subMenus) => {
    _.map(subMenus, (menuItem)=>{
      checkMenuItem(menuItem, path);
    })
  });

  if (foundMenuItem) {    
    return {
      pid: foundMenuItem.pid,
      permission: foundMenuItem.permission || defaultPermission
    }
  }
  return null;
}

export const getPagePermission = (menus, pagePath) => {
  const pageInfo = getPageInfo(menus, pagePath);
  if (!pageInfo) {
    return defaultPermission;
  }
  return pageInfo.permission;
}