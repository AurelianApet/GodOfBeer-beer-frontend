import React, { Component } from 'react';
import validate from 'web-form-validator';
import { setDeepValue } from '../../../library/utils/objects';

export default (schema, formData) => (WrappedComponent) => {
  class Validator extends Component {
    state = {
      values: formData || {},
      errors: {},
      isValid: true,
    }

    onChangeHandler = (name, value) => {
      const { errors } = this.state;
      let { values } = this.state;

      if (name.split('.').length > 1) {
        values = setDeepValue(Object.assign({}, values), name, value);
      } else {
        values[name] = value;
      }

      if (Object.prototype.hasOwnProperty.call(errors, name)) {
        delete errors[name];
      }

      this.setState({
        errors,
        values,
        isValid: Object.keys(errors).length === 0,
      });
    }

    // Use this method to set values on componentWillMount
    // if user already entered some data before
    setValues = (values) => {
      typeof values === 'object' && this.setState({ values });
    }

    setErrors = (errors = {}) => {
      const newErrors = { ...this.state.errors, ...errors };
      this.setState({ errors: newErrors });
    }

    resetErrors = () => {
      this.setState({
        isValid: true,
        errors: {},
      });
    }

    // User this methond on detele multiple errors e.g. ['password', 'passwordConfirmation']
    // to remove errors from all related inputs on changing the only one of them
    deleteErrors = (names = []) => {
      const { errors } = this.state;
      names.forEach(name => (
        delete errors[name]
      ));
      this.setState({
        errors,
        isValid: Object.keys(errors).length === 0,
      });
    }

    validateForm = (customSchema = schema) => {
      const values = { ...this.state.values };
      const { errors, isValid } = validate(customSchema, values);
      this.setState({ errors, isValid });
      return { isValid };
    }

    render() {
      const { errors, isValid } = this.state;
      return (
        <WrappedComponent
          validator={{
            validate: this.validateForm,
            setValues: this.setValues,
            setErrors: this.setErrors,
            deleteErrors: this.deleteErrors,
            resetErrors: this.resetErrors,
            onChangeHandler: this.onChangeHandler,
            values: this.state.values,
            errors,
            isValid,
          }}
          {...this.props}
        />
      );
    }
  }

  return Validator || null;
};
