import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SelEachItem extends Component {

  processDeleteItem = () => {
    if (this.props.pHandleCloseItem !== null) {
      const { pText, pId } = this.props;
      this.props.pHandleCloseItem(pText, pId);
    }
  }

  processClickItem = () => {
    if (this.props.pHandleClickItem !== null) {
      const { pText, pId } = this.props;
      this.props.pHandleClickItem(pText, pId);
    }
  }

  render() {
    return (
      <div className = "each-selected-item">
        <span className="delete-item" onClick={this.processDeleteItem}>
          <i className="fa fa-close"/>
        </span>
        <span className="each-seleceted-item-text" onClick={this.processClickItem}>{this.props.pText}</span>
      </div>
    )
  }
}

SelEachItem.propTypes = {
  pText: PropTypes.string,
  pId: PropTypes.string,

  pHandleCloseItem: PropTypes.func,
  pHandleClickItem: PropTypes.func
};

SelEachItem.defaultProps = {
  pText: '',
  pId: '',
  pHandleCloseItem: null,
  pHandleClickItem: null,
};

export default SelEachItem;