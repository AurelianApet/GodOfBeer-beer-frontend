import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import cn from 'classnames';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../Modal';
import HtmlContainer from '../HtmlContainer';

import { CELL_TYPE_DATE, CELL_TYPE_DATETIME, CELL_TYPE_HTML, CELL_TYPE_MULTILINE } from '../Table';

let showDatas = [];
let cIndex = 0;
let cData = {};

const renderData = (aData, aIndex, aIsHeaderData) => {
  let value = _.get(cData, aData.key);
  switch (aData.type) {
    case CELL_TYPE_DATE:
      value = moment(_.get(cData, aData.key)).format('YYYY-MM-DD');
      break;
    case CELL_TYPE_DATETIME:
      value = moment(_.get(cData, aData.key)).format('YYYY-MM-DD HH:mm:ss');
      break;
    default:
      break;
  }
  if (aIsHeaderData) {
    return (
      <div key={aIndex} className={cn(aData.className? aData.className : '')}>
          <HtmlContainer
            pData={value}
            pBoldFontSize="29px"
            pIsHtml={false}
          />
      </div>
    )
  }
  return (
    <div key={aIndex} className={cn(aData.className? aData.className : '')}>
      {aData.icon && <i className={`fa fa-${aData.icon}`} />}
      {aData.type !== CELL_TYPE_MULTILINE && aData.type !== CELL_TYPE_HTML && value}
      {aData.type === CELL_TYPE_MULTILINE && <pre>{value}</pre>}
      {aData.type === CELL_TYPE_HTML && <HtmlContainer pData={value} />}
    </div>
  )
}

export class SlideShow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sStatus: false,
    };  
  }

  componentWillMount() {
    const { pData, showIndex } = this.props;
    cIndex = showIndex;
    showDatas = pData;
    cData = showDatas[cIndex];
    document.addEventListener('keydown', this.handleKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }

  validateFooterData = () => {
    const { pFooterData } = this.props;
    let result = false;
    _.map(pFooterData, (itemFooter, indexFooter) => {
      const value = _.get(cData, itemFooter.key);
      if(value.length !== 0) result = true;
    })
    return result;
  }

  handleKeyDown = e => {
    if (e.key === 'ArrowLeft') {
      this.handlePrev();
    } else if (e.key === 'ArrowRight') {
      this.handleNext();
    }
  }

  handlePrev = (e) => {
    const { sStatus } = this.state;
    cIndex = (cIndex + showDatas.length - 1) % showDatas.length;
    cData = showDatas[cIndex];
    this.setState({ sStatus: !sStatus})
    if (this.props.pHandleSlideChange) {
      this.props.pHandleSlideChange(cIndex);
    }
  }

  handleNext = (e) => {
    const { sStatus } = this.state;
    cIndex = (cIndex + 1) % showDatas.length;
    cData = showDatas[cIndex];
    this.setState({ sStatus: !sStatus})
    if (this.props.pHandleSlideChange) {
      this.props.pHandleSlideChange(cIndex);
    }
  }

  render() {
    const { pData, pHeaderData, pBodyData, pFooterData, pFooterClassName, className, pHeaderClassName, showIndex, staticContext, pHandleSlideChange, pHeaderCustomRender, pBodyCustomRender, pFooterCustomRender, ...restProps } = this.props;
    return (
      <Modal
        className={cn(className, 'slideshow-modal-dialog')}
        {...restProps}
      >
        {pData && showDatas &&
          <div className="next-prev-buttons">
            <div className="prev-button" onClick={this.handlePrev.bind(this)}>
              <i className="fa fa-chevron-left" />
            </div>
            <div className="next-button" onClick={this.handleNext.bind(this)}>
              <i className="fa fa-chevron-right" />
            </div>
          </div>
        }
        {pData && showDatas &&
          <div className="modal-page">
            {cIndex + 1} / {showDatas.length}
          </div>
        }
        <ModalHeader
          className={pHeaderClassName}
          {...restProps}
        >
          {pHeaderCustomRender !== null &&
            pHeaderCustomRender(showDatas, cData, cIndex)
          }
          {pHeaderCustomRender === null &&
            _.map(pHeaderData, (item, index) => {
              let value = _.get(cData, item.key);
              if (item.customRender) {
                return item.customRender(value, index, item.key)
              } else {
                return renderData(item, index, true);
              }
            })
          }
        </ModalHeader>
        <ModalBody>
          {pBodyCustomRender !== null &&
            pBodyCustomRender(showDatas, cData, cIndex)
          }
          {pBodyCustomRender === null &&
            _.map(pBodyData, (item, index) => {
              const value = _.get(cData, item.key);
              if (item.customRender) {
                return item.customRender(value, index, item.key)
              } else {
                return renderData(item, index + 100, false);
              }
            })
          }
        </ModalBody>
        {this.validateFooterData() &&
          <ModalFooter className={pFooterClassName}>
            {pFooterCustomRender !== null &&
              pFooterCustomRender(showDatas, cData, cIndex)
            }
            {pFooterCustomRender === null &&
              _.map(pFooterData, (item, index) => {
                const value = _.get(cData, item.key);
                if (item.customRender) {
                  return item.customRender(value, index, item.key)
                } else {
                  return renderData(item, index + 200);
                }
              })
            }
        </ModalFooter>
        }
      </Modal>
    );
  }
}

SlideShow.propTypes = {
  pHandleSlideChange: PropTypes.func,
  pHeaderCustomRender: PropTypes.func,
  pBodyCustomRender: PropTypes.func,
  pFooterCustomRender: PropTypes.func,
};

SlideShow.defaultProps = {
  pHeaderCustomRender: null,
  pBodyCustomRender: null,
  pFooterCustomRender: null,
}