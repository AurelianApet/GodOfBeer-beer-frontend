import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';

class Radio extends Component {

  constructor(props) {
    super(props);
    this.state = {
      values: [],
    };
    this.checked = -1;
  }

  componentDidMount() {
    document.addEventListener( 'keyup', this.handleKeyUp, false );
    const { values, defaultValue, onRef } = this.props;
    if ( defaultValue ) {
      this.handleChangeRadio( defaultValue );
    }
    this.setData(values, defaultValue);
    onRef( this );
  }

  componentWillReceiveProps(newProps) {

  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp, false);
    const { onRef } = this.props;
    onRef( null );
  }

  setData = (aValues, checkedValue) => {
    let tmpValue = [];
    _.map(aValues, (item, index) => {
      tmpValue.push({
        value: item.value,
        title: item.title,
        checked: item.value === checkedValue,
      });
      this.checked = item.value === checkedValue? index : this.checked;
    })
    this.setState({
      values: tmpValue,
    });
  }

  getFocus = () => {
    const { id } = this.props;
    window.getElementFromId( id ).focus();
  }

  handleKeyUp = ( e ) => {
    if ( !this.focused ) {
      return;
    }
    const { values } = this.state;
    let value;
    if (e.key === 'ArrowLeft') {
      if ( this.checked <= 0 ) {
        return;
      }
      if ( this.checked === -1 ) {
        value = values[values.length - 1].value;
        this.checked = values.length - 1;
      } else {
        value = values[this.checked - 1].value;
        this.checked = this.checked - 1;
      }
    } else if (e.key === 'ArrowRight') {
      if ( this.checked >= values.length - 1 ) {
        return;
      }
      if ( this.checked === -1 ) {
        value = values[0].value;
        this.checked = 0;
      } else {
        value = values[this.checked + 1].value;
        this.checked = this.checked + 1;
      }
    }
    if ( value ) {
      this.handleChangeRadio( value );
    }
  }

  handleChangeRadio = ( aValue ) => {
    const { onChange, name, isEditable } = this.props;
    if ( !isEditable ) {
      return;
    }
    const { values } = this.state;
    this.setData(values, aValue);
    onChange(aValue, name);
  }

  handleOnFocus = () => {
    this.focused = true;
  }

  handleOnBlur = () => {
    this.focused = false;
  }

  render() {
    const { name, id, className, tabIndex } = this.props;
    const { values } = this.state;
    return (
      <div 
        className={cn("component-radio", className)} 
        name={name} 
        id={id}
        tabIndex={tabIndex}
        onFocus={this.handleOnFocus}
        onBlur={this.handleOnBlur}
      >
        {
          _.map(values, (item, index) => {
            return (
              <div key={index} id={item.value.toString()} onClick={this.handleChangeRadio.bind(this, item.value)}>
                <i className={cn("fa", item.checked? "fa-dot-circle-o" : "fa-circle-o")} />
                <span>{item.title}</span>
              </div>
            )
          })
        }
      </div>
    );
  }
}

Radio.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  defaultVlaue: PropTypes.string,
  isEditable: PropTypes.bool,
  values: PropTypes.array,
  onChange: PropTypes.func,
  onRef: PropTypes.func,
};

Radio.defaultProps = {
  name: '',
  id: 'Radio',
  className: '',
  defaultValue: '',
  isEditable: true,
  values: [],
  onChange: () => {},
  onRef: () => {},
};

export default Radio