import React, { Component } from 'react';
import _ from 'lodash';
import cn from 'classnames';

import { MODE_READ } from '../../APIForm';

export class APIFormButtonRadio extends Component {
  constructor(props) {
    super(props);

    this.state = {
     
    };
  }

  componentDidMount = () => {
    const { onRef } = this.props;
    onRef( this );
    this.setData( this.props );
  }

  componentWillReceiveProps = ( newProps ) => {
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
  }

  setData = ( aProps ) => {
    const { defaultData, item } = aProps;
    this.value = defaultData || item.defaultValue || '';
    this.setState({
      sValue: defaultData || item.defaultValue || '',
    });
    this.checkValidation();
  }

  checkValidation = () => {
    const { item, parent } = this.props;
    const validationResult = parent.checkItemValidate( this.value, item );
    this.setState({
      error: validationResult.error,
    });
  }

  getFocus = () => {
    const { item } = this.props;
    window.getElementFromId( `apiForm-button-radio-${item.name}` ).focus();
  }

  handleRadioChange = ( aValue ) => {
    const { item, mode } = this.props;
    if ( mode.mode === MODE_READ || item.disabled ) {
      return;
    }
    const name = item.name;
    this.value = aValue;
    this.checkValidation();
    this.props.handleChange( name, aValue );
    this.setState({
      sValue: aValue,
    })
  }
  
  render() {
    const { item, tabIndex } = this.props;
    const {  sValue } = this.state;
    const checkedStyle = _.get( item, 'style.checked' ) || {};
    const uncheckedStyle = _.get( item, 'style.unchecked' ) || {};
    return (
      <div 
        key={`apiForm-button-radio-${item.name}`} 
        className='apiform-button-radio-content'
        tabIndex={tabIndex}
        id={`apiForm-button-radio-${item.name}`}
      >
        {_.map( item.value, ( valueItem, valueIndex ) => {
          return (
            <div 
              key={valueIndex} 
              className={cn('button-radio-item', valueItem.value === sValue? 'button-radio-item-checked' : '')}
              style={valueItem.value === sValue? checkedStyle : uncheckedStyle}
              onClick={this.handleRadioChange.bind( this, valueItem.value )}
            >
              {valueItem.title}
            </div>
          )
        })}
      </div>
    );
  }
}

APIFormButtonRadio.propTypes = {
  
};

APIFormButtonRadio.defaultProps = {
  
};

export default APIFormButtonRadio;