import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import MaskedInput from 'react-text-mask';

class Input extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false,
      isRequired: false,
      isNotificationShowing: false,
    };
  }

  handleFocus = () => {
    this.setState({
      isFocused: true,
    });
  }

  handleBlur = (e) => {
    const { value } = e.target;
    const { isRequired } = this.props;
    if (value) {
      this.setState({ isRequired: false });
    } else {
      this.setState({ isRequired });
    }
    !isRequired && this.setState({ isFocused: false });
  }

  handleMouseEnter = () => {
    this.setState({ isNotificationShowing: true });
  }

  handleMouseLeave = () => {
    this.setState({ isNotificationShowing: false });
  }

  handleCloseBtn = () => {
    if (this.props.pHandleCloseBtnClick !== null) {
      this.props.pHandleCloseBtnClick();
    }
  }

  handleClickInput = (e) => {
    e.stopPropagation();
  }

  render() {
    const { className, labelClassName, notification, isMasked, isBadgeVisible, errorMessage, preIcon, customPlaceHolder, label, placeHolder, value = '', hasError, hasValue, isDisabled, isRequired, readOnly, isErrorVisible, isValidateRequired, maxLength, searchInputStatus, pHandleCloseBtnClick, isErrorPlaceHolder, ...restProps } = this.props;
    const { isFocused, isNotificationShowing } = this.state;

    let realErrorMessage = errorMessage;
    if ( isValidateRequired === true && realErrorMessage.toString() === "" ) realErrorMessage = "";
    let realPlaceHolder = placeHolder;
    if (isErrorPlaceHolder && realErrorMessage !== "") realPlaceHolder = realErrorMessage;

    return (
      <div className={cn('component-input-container', { inputLabel: true, 'has-value': isFocused || value.length || isDisabled || hasError, required: this.state.isRequired || hasError }, labelClassName)}>
        <div className="input-label">
          {
            label &&
              <span>
                {label}
                {
                  isBadgeVisible && !isDisabled &&
                  <em>
                    {isRequired && errorMessage === 'The input field is required' && 'Required'}
                    {isRequired && errorMessage !== 'The input field is required' && hasError && 'Error'}
                    {!isRequired && errorMessage !== 'The input field is required' && hasError && 'Error'}
                    {isRequired && !hasError && '*'}
                    {!isRequired && !hasError && ''}
                  </em>
                }
              </span>
          }
          {
            isMasked ?
              <MaskedInput
                id="tableSearchInputText"
                className={cn(className, 'form-control')}
                value={value}
                mask={isMasked}
                disabled={isDisabled}
                placeholder={(isFocused) ? placeHolder : ''}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                onChange={this.handleInputChange}
                ref={(el) => { this.autocomplete = el; }}
                readOnly={readOnly}
                maxLength={maxLength}
                {...restProps}
              />
            :
              <input
                id="tableSearchInputText"
                className={cn(className, 'form-control', (isErrorPlaceHolder && realErrorMessage !== "")? "form-control-error" : "")}
                value={value}
                disabled={isDisabled}
                placeholder={realPlaceHolder}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                onChange={this.handleInputChange}
                ref={(el) => { this.autocomplete = el; }}
                readOnly={readOnly}
                maxLength={maxLength}
                onClick={this.handleClickInput}
                {...restProps}
              />
          }
          {
            searchInputStatus === 1 &&
            <div className="inputClose" onClick={this.handleCloseBtn}>
              <i className="fa fa-search closeBtn"></i>
            </div>
          }
          {
            searchInputStatus === 2 &&
            <div className="inputClose" onClick={this.handleCloseBtn}>
              <i className="fa fa-close closeBtn"></i>
            </div>
          }
          {
            preIcon &&
              <i className={cn(preIcon, "input-icon", (!!hasError)? "input-icon-red" : "input-icon-gray", (!!value)? "input-icon-entered" : "" )}></i>
          }
          {
            customPlaceHolder &&
              <label className={cn("username", (!!value)? "username-entered" : "")}>{customPlaceHolder}</label>
          }
          {
            notification &&
            <div className={cn('tooltip', isNotificationShowing && 'active')}>
              <i
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
              >i
              </i>
              <div>{notification}</div>
            </div>
          }
          {
            isErrorPlaceHolder && realErrorMessage !== "" &&
            <i className="fa fa-info input-alert"/>
          }
        </div>
        {
          isValidateRequired === true && isErrorVisible && !readOnly && !isErrorPlaceHolder && <div className="inputError">{realErrorMessage}</div>
        }
      </div>
    );
  }
}

Input.propTypes = {
  isRequired: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  value: PropTypes.string,
  max: PropTypes.number,
  maxLength: PropTypes.number,
  isDisabled: PropTypes.bool,
  label: PropTypes.node,
  hasError: PropTypes.bool,
  hasValue: PropTypes.bool,
  errorMessage: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func,
  isBadgeVisible: PropTypes.bool,
  placeHolder: PropTypes.string,
  isMasked: PropTypes.any,
  notification: PropTypes.string,
  readOnly: PropTypes.bool,
  isErrorVisible: PropTypes.bool,
  isValidateRequired: PropTypes.bool,
  preIcon: PropTypes.string,
  customPlaceHolder: PropTypes.string,
  searchInputStatus: PropTypes.number,
  isErrorPlaceHolder: PropTypes.bool,
  pHandleCloseBtnClick: PropTypes.func,
};

Input.defaultProps = {
  isRequired: false,
  className: '',
  labelClassName: '',
  value: '',
  isDisabled: false,
  label: null,
  hasError: false,
  errorMessage: '',
  type: 'text',
  max: 0,
  maxLength: 100,
  isBadgeVisible: false,
  placeHolder: '',
  isMasked: false,
  notification: '',
  onChange: () => {},
  hasValue: false,
  readOnly: false,
  isErrorVisible: true,
  isValidateRequired: true,
  preIcon: '',
  customPlaceHolder: '',
  searchInputStatus: 0,
  isErrorPlaceHolder: false,
  pHandleCloseBtnClick: () => {},
};

export default Input;
