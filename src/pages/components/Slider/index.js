import React from 'react';
import PropTypes from 'prop-types';
import RangeSlider from 'react-rangeslider';

export const Slider = ({ className, handleChange, value, name, ...rest }) => {
  const handleOnChange = (sliderValue) => {
    handleChange(sliderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  return (
    <RangeSlider
      value={value}
      name={name}
      orientation="vertical"
      onChange={handleOnChange}
      {...rest}
    />
  );
};

Slider.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
  name: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  handleChange: PropTypes.func,
};

Slider.defaultProps = {
  className: '',
  value: 0,
  name: '',
  min: 0,
  max: 100,
  step: 1,
  handleChange: () => {},
};

export default Slider;
