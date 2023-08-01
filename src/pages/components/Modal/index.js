import React, { Component } from 'react'
import ReactModal from 'react-modal';
import cn from 'classnames';
import PropTypes from 'prop-types';

const STYLE = {
  overlay : {
    position: null,
    top: null,
    left: null,
    right: null,
    bottom: null,
    backgroundColor: null
  },
  content : {
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
    height: '100vh',
    border: 'none',
    background: 'none',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '0',
    outline: 'none',
    padding: '0'
  }
};

export class ModalHeader extends Component {
  render() {
    return (
      <div className={cn('modal-header', this.props.className)}>
        <div className="modal-title">
          {this.props.children}
        </div>
        {this.props.toggle &&
          <div className="close" onClick={this.props.toggle}>
            <span>×</span>
          </div>
        }
      </div>
    )
  }
}

export class ModalBody extends Component {
  render() {
    return (
      <div className={cn('modal-body', this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}

export class ModalFooter extends Component {
  render() {
    return (
      <div className={cn('modal-footer', this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}

export class Modal extends Component {
  render() {
    const {...rest} = this.props;
    return (
      <ReactModal
        {...rest}
        className={cn('modal-dialog', this.props.className)}
        closeTimeoutMS={150}
        style={STYLE}
        ariaHideApp={false}
        onRequestClose={this.props.toggle}
      >
        <div className="modal-content">
          {this.props.children}
        </div>
      </ReactModal>
    )
  }
};

Modal.propTypes = {
  className: PropTypes.string,
  toggle: PropTypes.func.isRequired,
};

Modal.defaultProps = {
  className: ''
};

ModalHeader.propTypes = {
  className: PropTypes.string,
  toggle: PropTypes.func.isRequired,
};

ModalHeader.defaultProps = {
  className: ''
};