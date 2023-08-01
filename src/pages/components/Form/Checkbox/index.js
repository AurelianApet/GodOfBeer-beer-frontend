import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const Checkbox = (props) => {
  const handleOnChange = () => {
    if (props.isDisabled) return false;
    const { onChange, type, value, isChecked } = props;
    onChange(type === 'checkbox' ? !isChecked : value);
  };

  const { isChecked, className, errorMessage, isDisabled, type, label, name, id, value, ...rest } = props;

  const locHasLabel = label !== '';
  return (
    <div className="chk_container">
      <div className={cn("chk_checkbox", !locHasLabel ? 'withoutLabel' : '')}>
        <input
          {...rest}
          className="chk_input"
          type={type}
          name={name}
          onChange={handleOnChange}
          disabled={isDisabled}
          value={value}
          checked={isChecked}
          id={id}
        />
        { locHasLabel && <label className={cn(className, 'chk_label')} htmlFor={id}>
          {label}
        </label> }
      </div>
      {!!errorMessage && <div className="chk_error">{errorMessage}</div> }
    </div>
  );
};

Checkbox.propTypes = {
  onChange: PropTypes.func,
  isChecked: PropTypes.bool,
  isDisabled: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
};

Checkbox.defaultProps = {
  onChange: () => {},
  isChecked: false,
  isDisabled: false,
  label: '',
  name: '',
  type: 'checkbox',
  value: 'on',
  className: '',
  errorMessage: '',
};

export default Checkbox;
