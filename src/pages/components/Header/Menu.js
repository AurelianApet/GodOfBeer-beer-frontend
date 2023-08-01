import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside'
import PropTypes from 'prop-types';
import $ from 'jquery';
import cn from 'classnames';
import _ from 'lodash';

const SHORTCUTMENU_MARGIN_LEFT1 = 210;
const SHORTCUTMENU_MARGIN_LEFT2 = 150;
const SHORTCUTMENU_MARGIN_LEFT3 = 250;
const MENUARROW_MARGIN = 154;

class Menu extends Component {
    constructor(props) {
        super(props);
        this.selectedMenuItemColumnCount = 0;
    }
    componentDidUpdate () {
        this.resetMenuPosition();
    }

    resetMenuPosition = () => {
        const { pShortcutMenus } = this.props;
        let isSpecialMenu = true; // in case top child menu items are all linkable.
        _.map(pShortcutMenus, (menuItem) => {
            if (menuItem.childs && menuItem.childs.length > 0) {
                isSpecialMenu = false;
            }
        })
        const columnCount = isSpecialMenu ? 1 : pShortcutMenus.length;
        const parentOffset = $('.highlightParent').offset();
        switch (columnCount) {
            case 1:
                if (parentOffset) $('.shortcut-menu').css('left', parentOffset.left - SHORTCUTMENU_MARGIN_LEFT1);
                break;
            case 2:
                if (parentOffset) $('.shortcut-menu').css('left', parentOffset.left / 2 - SHORTCUTMENU_MARGIN_LEFT2);
                break;
            default:
                if (parentOffset) $('.shortcut-menu').css('left', parentOffset.left / 2 - SHORTCUTMENU_MARGIN_LEFT3);
                break;
        }
        if (parentOffset) $('.menu-arrow').css('left', parentOffset.left - MENUARROW_MARGIN);
    }

    /**
     *  handle section in local
     */
    handleClickOutside() {
        this.props.pHandleMenuEndClick();
    } 

    /**
     *  render view
     */ 
    renderParentMenu = (obj, indexInfo) => {
        const { pCatagory, pDefaultCatagory, isOpen } = this.props;
        let index = indexInfo + 1;
        let catagory = pDefaultCatagory;
        if (pCatagory !== 0) {
          catagory = pCatagory;
        }
        return (
          <li key={index}>
            <div
              onClick={this.props.pHandleMenuClick.bind(this, obj, index)}
              className={cn("sf-with-ul", index === catagory ? "highlightParent" : "")}
            >
              {obj.title}
              <span className="sf-sub-indicator">
                <i className={cn((isOpen && index === catagory) ? "fa fa-angle-down" : "fa fa-angle-up")}></i>
              </span>
            </div>
          </li>
        )
    }
    renderMenuItem = (obj, index, level) => {
        const hasChilds = obj.childs && obj.childs.length > 0;
        let shortcutMenuLevel = "";

        if (obj.hide){
            return;
        }
        if (obj.url) {
            shortcutMenuLevel = "shortcut-menu-hover";
        }

        switch (level) {
            case 0:
                if (obj.url) {
                    shortcutMenuLevel += " shortcut-menu-slevel";
                }
                else {
                    shortcutMenuLevel += " shortcut-menu-col";
                }
                break;
            case 1:
                shortcutMenuLevel += " shortcut-menu-level1";
                break;
            default:
                shortcutMenuLevel += " shortcut-menu-level2";
                break;
        }

        return (
            <div key={index} className={shortcutMenuLevel}>
                {
                    shortcutMenuLevel === "shortcut-menu-hover shortcut-menu-level2" && 
                    <div className="index-icon">
                        <i className="fa fa-caret-right" />
                    </div>
                }
                <div className="sf-with-ul">
                    <a href={obj.url} onClick={this.props.pHandleMenuItemClick.bind(this, obj)} className="sf-with-ul">{obj.title}</a>
                </div>
                {hasChilds &&
                    <div>
                    {
                        _.map(obj.childs, (item, index2) => {
                        return this.renderMenuItem(item, index2, level + 1);
                        })
                    }
                    </div>
                }
            </div>
        )
    }
     
    // main render
    render() {
        const { pShortcutMenus, pParentMenus, isAuthenticated, isOpen } = this.props;
        const menuArrow = "/assets/images/header/menu-arrow.png";

        return (
            <div className = "parentmenu">
                <ul className="nav navbar-nav sf-menu">
                    { isAuthenticated &&
                    _.map(pParentMenus, (item, index) => {
                        if (item.childs && item.childs.length === 0) {
                            return null;
                        }
                        return this.renderParentMenu(item, index);
                    })
                    }
                    { !isAuthenticated &&
                    <li>
                        <div className="sf-with-ul">
                        <i className="fa fa-spinner fa-pulse"/>
                        </div>
                    </li>
                    }
                </ul>
                { isOpen && pShortcutMenus && pShortcutMenus.length > 0 &&
                <div className="shortcut-menu">
                    { isAuthenticated &&
                        _.map(pShortcutMenus, (item, index) => {
                            return this.renderMenuItem(item, index, 0);
                        })
                    }
                    <span onClick={() => this.props.pHandleMenuEndClick()} className="menu-xlarge">
                        <i className="fa fa-close"/>
                    </span>
                </div> }
                { isOpen && <img src={menuArrow} className="menu-arrow" alt="menu arrow" /> }
            </div>
        )
    }
}

Menu.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    pParentMenus: PropTypes.array,
    pShortcutMenus:PropTypes.array,
    pDefaultCatagory: PropTypes.number.isRequired,
    pCatagory: PropTypes.number.isRequired,
    pHandleMenuClick: PropTypes.func.isRequired,
    pHandleMenuItemClick: PropTypes.func.isRequired,
    pHandleMenuEndClick: PropTypes.func.isRequired,
};
export default onClickOutside(Menu)