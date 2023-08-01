import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import _ from 'lodash';

import { EMOTICON } from '../../pages/Socialnet/Chatting/emotiConstants';

export const DIRECTION_LEFT = 1;
export const DIRECTION_RIGHT = 2;
export const DIRECTION_TOP = 3;
export const DIRECTION_BOTTOM = 4;

export const ALIGN_HORIZONTAL = 1;
export const ALIGN_VERTICAL = 2;
export const ALIGN_MATRIX = 3;
export const ALIGN_LEFT = 4;
export const ALIGN_CENTER = 5;
export const ALIGN_RIGHT = 6;

export const ACTION_CLICK = 1;
export const ACTION_DOUBLECLICK = 2;
export const ACTION_HOVER = 3;

class DorpDownList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sShowList: false,
    };
  }

  componentDidMount = () => {
		document.addEventListener('mousedown', this.handleClickOutside);
  }

	componentWillUnmount() {
		this.mounted = false;
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

	setWrapperRef = (node) => {
		this.wrapperRef = node;
	}

	handleClickOutside = (event) => {
		if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
			this.handleCloseList();
		}
  }

  handleClickContainer = () => {
    const { pTheme } = this.props;
    const action = pTheme.action || ACTION_HOVER;
    if ( action !== ACTION_HOVER ) {
      this.setState( prev => ({
        sShowList: !prev.sShowList,
      }));
    }
  }
  
  handleShowList = () => {
    this.setState({
      sShowList: true,
    });
  }

  handleCloseList = () => {
    this.setState({
      sShowList: false,
    });
  }

  handleClickItem = ( aItem, e ) => {
    if ( e ) {
      e.stopPropagation();
    }
    const { pController } = this.props;
    const { sShowList } = this.state;
    if ( !sShowList ) return;
    this.setState({
      sShowList: false,
    });
    if ( pController.handleClickItem ) {
      pController.handleClickItem( aItem );
    }
  }

  replaceAll = (templateString, wordToReplace, replaceWith) => {
    const regex = new RegExp(wordToReplace,"g");
    const replacedString = templateString.replace(regex, replaceWith);
    return replacedString;
  }
  
  renderEmoticon = (aContent) => {
    let htmlContent = aContent;
    _.map(EMOTICON, (emoticon) => {
      let replaceWith = `<img style="width: 1.3rem;" src="${emoticon.img}" title="${emoticon.detail}">`;
      htmlContent = this.replaceAll(htmlContent, emoticon.name, replaceWith);
    })
    return (
      <div
        className="message-content"
        dangerouslySetInnerHTML={{ __html: htmlContent}}
      />
    );
  }

  renderDropDownListItem = ( aItem, aIndex ) => {
    let className = aItem.className || '';
    if ( aItem.align === ALIGN_RIGHT ) {
      className += ' right-item';
    } else if ( aItem.align === ALIGN_CENTER ) {
      className += ' center-item';
    } else {
      className += ' left-item';
    }
    const title = _.get( aItem, 'data.title' ) || '';
    return (
      <div 
        key={aIndex} 
        onClick={this.handleClickItem.bind( this, aItem )}
        className={cn('drop-list-item', className)}
      >
        { aItem.customRender?
            aItem.customRender( aItem )
          :
            this.renderEmoticon(title)
        }
      </div>
    )
  }

  renderDropDownList = () => {
    const { pContent, pTheme } = this.props;
    const { sShowList } = this.state;
    const itemAlign = _.get( pTheme, 'itemAlign' ) || ALIGN_VERTICAL;
    let itemAlignClass = itemAlign === ALIGN_HORIZONTAL? 'drop-down-list-container-horizontal' : '';
    itemAlignClass = itemAlign === ALIGN_MATRIX? 'drop-down-list-container-matrix' : itemAlignClass;
    const buttonElement = window.getElementFromId('drop-down-list-button');
    const buttonElementHeight = buttonElement.innerHeight() || 0;
    let style = pTheme.vDirection === DIRECTION_TOP? {bottom: buttonElementHeight + 10} : {top: buttonElementHeight + 10};
    let className = pTheme.vDirection === DIRECTION_TOP? 'top-list' : 'bottom-list';
    if ( pTheme.hDirection === DIRECTION_LEFT ) {
      className += ' left-list';
      style.right = 0;
    } else {
      className += ' right-list';
      style.left = 0;
    }
    return (
      <div 
        className={cn('drop-down-list-container', className, sShowList? 'show-list' : '', itemAlignClass)}
        style={style}
      >
        <div className='arrow-div' />
        { _.map( pContent, ( contentItem, contentIndex ) => {
            return this.renderDropDownListItem( contentItem, contentIndex )
          })
        }
      </div>
    )
  }

  render() {
    const { pTitle, pTheme } = this.props;
    const className = pTheme.className || '';
    const action = pTheme.action || ACTION_HOVER;
    const titleCustomRender = pTitle.customRender || null;
    const titleString = pTitle.string || '';
    return (
      <div 
        ref={this.setWrapperRef}
        className={cn('component-drop-down-list', className)}
        onMouseEnter={action === ACTION_HOVER? this.handleShowList : () => {}}
        onMouseLeave={action === ACTION_HOVER? this.handleCloseList : () => {}}
      >
        <span
          id='drop-down-list-button'
          className='drop-down-list-button'
          onClick={this.handleClickContainer}
        >
          { titleCustomRender?
              titleCustomRender()
            :
              titleString
          }
        </span>
        { this.renderDropDownList() }
      </div>
    );
  }
}

DorpDownList.propTypes = {
  pTitle: PropTypes.object,
  pContent: PropTypes.array,
  pTheme: PropTypes.object,
  pController: PropTypes.object,
};

DorpDownList.defaultProps = {
  pTitle: {
    string: '',
    customRender: () => {},
  },
  pContent: [],
  pTheme: {
    className: '',
    hDirection: DIRECTION_RIGHT,
    vDirection: DIRECTION_BOTTOM,
    itemAlign: ALIGN_VERTICAL,
    matrixCols: 1,
    action: ACTION_HOVER,
  },
  pController: {
    handleClickItem: () => {},
  },
};

export default DorpDownList