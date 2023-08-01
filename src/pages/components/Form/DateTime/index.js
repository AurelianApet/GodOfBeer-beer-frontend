import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Datetime from 'react-datetime';
import 'moment/locale/ko';
import LANG from '../../../../language';

export const VIEW_MODE_YEARS = "years";
export const VIEW_MODE_MONTHS = "months";
export const VIEW_MODE_DAYS = "days";
export const VIEW_MODE_TIME = "time";

class DateTimeComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false,
      isRequired: false,
    };
  }

  handleFocus = () => {
    this.setState({
      isFocused: true,
    });
  }

  handleBlur = (value) => {
    const { isRequired } = this.props;
    if (value) {
      this.setState({ isRequired: false });
    } else {
      this.setState({ isRequired });
    }
    !isRequired && this.setState({ isFocused: false });
  }

  render() {
    const { defaultValue, name, className, labelClassName, isForwardLabelFlag, isBadgeVisible, errorMessage, label, placeHolder, value = '', hasError, isDisabled, isRequired, onChange, dateFormat, timeFormat, viewMode } = this.props;
    const { isFocused } = this.state;
    return (
      <div className={cn({ 'has-value': isFocused || value.length || isDisabled || hasError, required: this.state.isRequired || hasError }, labelClassName)}>
        <div className="datetime-label">
          {isForwardLabelFlag && label !=="" && 
            <span className="label-title">
              {label}
              {isBadgeVisible && !isDisabled && <em>{isRequired ? 'Required' : 'Optional'}</em>}
            </span>
          }
          {
            <Datetime
              defaultValue={placeHolder === '' ? defaultValue : ''}
              dateFormat={dateFormat}
              timeFormat={timeFormat}
              className={`${className}`}
              value={value || ''}
              inputProps={{ readOnly: true, name: name, placeholder: placeHolder }}
              disabled={isDisabled}
              viewMode={viewMode}
              onChange={onChange.bind(this, {target: {name: name}})}
              closeOnSelect={true}
            />
          }
          {!isForwardLabelFlag && label !== "" &&
            <span className="back-span">
              {label}
              {isBadgeVisible && !isDisabled && <em>{isRequired ? 'Required' : 'Optional'}</em>}
            </span>
          }
        </div>
        <div className="error">{errorMessage}</div>
      </div>
    );
  }
}

DateTimeComponent.propTypes = {
  name: PropTypes.string,
  isRequired: PropTypes.bool,
  isForwardLabelFlag: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  value: PropTypes.string,
  viewMode: PropTypes.string,
  isDisabled: PropTypes.bool,
  label: PropTypes.node,
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string,
  onChange: PropTypes.func,
  isBadgeVisible: PropTypes.bool,
  placeHolder: PropTypes.string,
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  dateFormat: PropTypes.string,
  timeFormat: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.bool,
  ])
};

DateTimeComponent.defaultProps = {
  name: 'datetime_',
  isRequired: false,
  isForwardLabelFlag: true,
  className: '',
  labelClassName: '',
  value: '',
  viewMode: VIEW_MODE_DAYS,
  isDisabled: false,
  label: null,
  hasError: false,
  errorMessage: '',
  isBadgeVisible: false,
  placeHolder: '',
  defaultValue: '',
  timeFormat: 'HH:mm:ss',
  dateFormat: 'YYYY' + LANG('BASIC_YEAR') + 'M' + LANG('BASIC_MONTH') + 'D' + LANG('BASIC_DATE'),
  onChange: () => {},
};

export default DateTimeComponent;
