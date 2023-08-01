import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';

// Following function has been originally created by JHW.
// I(vdg) really don't know why it is needed??? ^_^


class HtmlContainer extends Component {

  insertTxtTo = (aStrs, aFindStr, aText, aEdgeStr) => {
    const { pIsHtml } = this.props;
    if ( !pIsHtml ) {
      return aStrs;
    }
    let target = [];
    target = aStrs.split(aFindStr);
    let tmpStr = "";
    _.map(target, (item, index) => {
      if (index !== 0) {
        tmpStr = tmpStr + aFindStr;
        const tmp = item.indexOf(aEdgeStr);
        tmpStr = tmpStr + item.substr(0, tmp);
        if (item.indexOf(aText) === -1 || item.indexOf(aText) > item.indexOf(aEdgeStr)) {
          tmpStr = tmpStr + " " + aText;
        }
        tmpStr = tmpStr + item.substr(tmp, item.length - 1);
      } else {
        tmpStr = tmpStr + item.substr(0, item.length);
      }
    })
    return tmpStr;
  }

  render() {
    const { pData, className, pIsHtml, pKeepPreTag } = this.props;

    if (!pData) {
      return null;
    }
    let data = this.insertTxtTo(pData, "font-family", " !important", ";");
    let htmlContent = data;
    if (!pIsHtml) {
      htmlContent = window.htmlToText(data.toString());
    }
    if ( pKeepPreTag ) {
      htmlContent = `<pre>${htmlContent}</pre>`
    }
    return (
      <div
        className={cn("html-container", className)}
        dangerouslySetInnerHTML={{ __html: htmlContent}}
      />
    );
  }
}

HtmlContainer.propTypes = {
  pData : PropTypes.string,
  className : PropTypes.string,
  pIsHtml : PropTypes.bool,
  pBoldFontSize: PropTypes.string,
};

HtmlContainer.defaultProps = {
  pData : "",
  className : "",
  pIsHtml : true,
  pBoldFontSize: '',
};

export default HtmlContainer;
