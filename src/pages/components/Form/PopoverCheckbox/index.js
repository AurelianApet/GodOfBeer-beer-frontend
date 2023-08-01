import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Popover } from 'reactstrap';
import cn from 'classnames';

import { Button } from 'components/Button';

class PopoverCheckbox extends Component {
  state = {
    show: false,
    isButtonDisabled: false,
  };

  handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop < e.target.getBoundingClientRect().height + 50;
    if (bottom) {
      this.setState({
        isButtonDisabled: false,
      });
    }
  }

  handleChange = () => {
    const { isChecked, onChange } = this.props;
    if (isChecked) {
      onChange(false);
    } else {
      this.setState({
        show: !this.state.show,
      });
    }
  }

  handleAcceptButton = (e) => {
    e.preventDefault();
    const { onChange, type, value, isChecked, isDisabled } = this.props;
    if (isDisabled) return false;

    onChange(type === 'checkbox' ? !isChecked : value);
    this.setState({
      show: false,
    });
  }

  toggle = () => {
    this.setState({
      show: !this.state.show,
    });
  }

  render() {
    // eslint-disable-next-line
    const { isChecked, className, errorMessage, isDisabled, type, label, name, id, value, children, ...rest } = this.props;
    const { show } = this.state;
    return (
      <div className="popover-container">
        <div className="checkbox">
          <Popover
            isOpen={show}
            placement="top"
            target={id}
            className="popover"
            title={this.props.title}
            toggle={this.toggle}
          >
            <div className="scrollBar" onScroll={this.handleScroll}>
              {children}
            </div>
            <div className="small-12 mt-1" style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                color="primary"
                onClick={this.handleAcceptButton}
                isDisabled={this.props.isButtonDisabled && this.state.isButtonDisabled}
              >
                I Agree
              </Button>
            </div>
          </Popover>
          <input
            className="input"
            type={type}
            name={name}
            onChange={this.handleChange}
            checked={isChecked}
            id={id}
          />
          <label className={cn(className, 'label')} htmlFor={id}>
            {label.map((item, index) => <Fragment key={index}>{item}</Fragment>)}
          </label>
        </div>
        {!!errorMessage && <div className="error">{errorMessage}</div> }
      </div>
    );
  }
}

PopoverCheckbox.propTypes = {
  onChange: PropTypes.func,
  isChecked: PropTypes.bool,
  isDisabled: PropTypes.bool,
  label: PropTypes.array,
  name: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  isButtonDisabled: PropTypes.bool,
  title: PropTypes.string,
};

PopoverCheckbox.defaultProps = {
  onChange: () => {},
  isChecked: false,
  isDisabled: false,
  label: [],
  name: '',
  type: 'checkbox',
  value: 'on',
  className: '',
  errorMessage: '',
  isButtonDisabled: true,
  title: '',
};

export default PopoverCheckbox;
