import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup } from 'reactstrap';
import cn from 'classnames';

const FormGroupComponent = ({ className, children, error }) => (
  <FormGroup className={cn(className, 'mb-0 pb-0')} data-error={error}>
    {children}
  </FormGroup>
);

FormGroupComponent.propTypes = {
  children: PropTypes.node.isRequired,
  error: PropTypes.string,
  className: PropTypes.string,
};

FormGroupComponent.defaultProps = {
  error: '',
  className: '',
};

export default FormGroupComponent;
