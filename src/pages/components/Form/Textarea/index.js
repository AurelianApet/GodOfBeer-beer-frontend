import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

class Textarea extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false,
      isRequired: false,
      isNotificationShowing: false,
    };
  }

  componentDidMount() {
    if (this.props.onRef) {
			this.props.onRef(this);
    }
  }

  componentWillUnmount() {
    if (this.props.onRef) {
			this.props.onRef(undefined);
    }
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

  render() {
    const { className, labelClassName, notification, isBadgeVisible, errorMessage, preIcon, label, placeHolder, value = '', hasError, hasValue, isDisabled, isRequired, readOnly, isErrorVisible, isValidateRequired, isErrorPlaceHolder, id, rows, maxLength, ...restProps } = this.props;
    const { isFocused, isNotificationShowing } = this.state;
     
    let realErrorMessage = errorMessage;
    if ( isValidateRequired === true && realErrorMessage.toString() === "" ) realErrorMessage = "";

    let realPlaceHolder = placeHolder;
    if (isErrorPlaceHolder && realErrorMessage !== "") realPlaceHolder = realErrorMessage;

    return (
      <div className={cn('component-textarea-container', { 'has-value': isFocused || value.length || isDisabled || hasError, required: this.state.isRequired || hasError }, labelClassName)}>
        <div className="textarea-label">
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
            <textarea
              id={id}
              className={cn(className, 'form-control', (isErrorPlaceHolder && realErrorMessage !== "")? "form-control-error" : "")}
              value={value}
              disabled={isDisabled}
              placeholder={realPlaceHolder}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              onChange={this.handleTextareaChange}
              ref={(el) => { this.autocomplete = el; }}
              readOnly={readOnly}
              maxLength={maxLength}
              {...restProps}
            />
          }
          {
            preIcon &&
              <i className={cn(preIcon, "textarea-icon", (!!hasError)? "textarea-icon-red" : "textareaicon-gray", (!!value)? "textarea-icon-entered" : "" )}></i>
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
          isValidateRequired === true && !readOnly && !isErrorPlaceHolder && <div className="textAreaError">{realErrorMessage}</div>
        }
      </div>
    );
  }
}

Textarea.propTypes = {
  isRequired: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  value: PropTypes.string,
  isDisabled: PropTypes.bool,
  label: PropTypes.node,
  hasError: PropTypes.bool,
  hasValue: PropTypes.bool,
  errorMessage: PropTypes.string,
  onChange: PropTypes.func,
  isBadgeVisible: PropTypes.bool,
  placeHolder: PropTypes.string,
  notification: PropTypes.string,
  readOnly: PropTypes.bool,
  isErrorVisible: PropTypes.bool,
  isValidateRequired: PropTypes.bool,
  preIcon: PropTypes.string,
  id: PropTypes.string,
  rows: PropTypes.string,
  maxLength: PropTypes.number,
  onRef: PropTypes.func,
};

Textarea.defaultProps = {
  isRequired: false,
  className: '',
  labelClassName: '',
  value: '',
  isDisabled: false,
  label: null,
  hasError: false,
  errorMessage: '',
  type: 'text',
  isBadgeVisible: false,
  placeHolder: '',
  notification: '',
  onChange: () => {},
  hasValue: false,
  readOnly: false,
  isErrorVisible: true,
  isValidateRequired: true,
  preIcon: '',
  id: '',
  rows: "3=6",
  maxLength: 1000,
};

export default Textarea;
