import React from 'react';
import PropTypes from 'prop-types';
import ReactLoading from 'react-loading-components';
import { Button as ButtonComponent } from 'reactstrap';

export const Button = (props) => {
  const { children, modifier, className, isDisabled, isLoading, onClick, ...rest } = props;

  return (
    <ButtonComponent
      className={className}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      {...rest}
    >
      {
        isLoading ?
          <div className="loadingWrapper">
            <ReactLoading type="three_dots" fill="#FFF" width={24} height={24} />
          </div>
        :
          children
      }
    </ButtonComponent>
  );
};

Button.propTypes = {
  className: PropTypes.string,
  modifier: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  isDisabled: PropTypes.bool,
  isLoading: PropTypes.bool,
};

Button.defaultProps = {
  className: '',
  modifier: 'primary',
  onClick: () => {},
  children: null,
  isLoading: false,
  isDisabled: false,
};

export default Button;
