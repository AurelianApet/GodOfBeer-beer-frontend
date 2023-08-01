import React from 'react';
import PropTypes from 'prop-types';

export const ButtonLink = ({ className, isDisabled, children, onClick, ...rest }) => (
  <div
    className={className}
    onClick={!isDisabled ? onClick : undefined}
    {...rest}
  >
    {children}
  </div>
);

ButtonLink.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  isDisabled: PropTypes.bool,
};

ButtonLink.defaultProps = {
  className: '',
  onClick: () => {},
  children: null,
  isDisabled: false,
};

export default ButtonLink;
