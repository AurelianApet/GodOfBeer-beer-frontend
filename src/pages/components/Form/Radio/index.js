import React, { Component }  from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export class Radio extends Component {
  render() {
    const {className, selectedValue, onChange} = this.context.radioGroup
    const IsChecked = this.props.value === selectedValue ? true : false
    return (
      <div className={cn('ctlRadio', className)}>
        <div onClick={onChange.bind(null, this.props.value)}>
          <input
            type='radio'
            onChange={onChange.bind(null, this.props.value)}
            checked={IsChecked}
          />
          {this.props.label}
        </div>
      </div>
    )
  }
}

Radio.contextTypes = {
  radioGroup: PropTypes.object.isRequired
}

export class RadioGroup extends Component {
  getChildContext() {
    const {name, selectedValue, onChange} = this.props
    return {
      radioGroup: {
        name, selectedValue, onChange
      }
    }
  }

  render() {
    const {Component, name, selectedValue, onChange, children, className, ...rest} = this.props
    return(
      <Component role="radiogroup" className={cn('ctlRadioGroup', className)} {...rest}>
        <div>{name}</div>
        {children}
      </Component>
    )
  }
}

RadioGroup.defaultProps = {
  Component: 'div'
}

RadioGroup.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  selectedValue: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired,
    PropTypes.bool.isRequired,
  ]),
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  Component: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.func.isRequired,
    PropTypes.object.isRequired,
  ])
}

RadioGroup.childContextTypes = {
  radioGroup: PropTypes.object.isRequired
}