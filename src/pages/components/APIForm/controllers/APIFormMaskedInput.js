import React, { Component } from 'react';
import _ from 'lodash';
import MaskedInput from 'react-text-mask';
import cn from 'classnames';
import { MODE_READ } from '../../APIForm';

export class APIFormMaskedInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
     
    };
  }

  componentDidMount = () => {
    const { onRef, item, defaultData } = this.props;
    onRef( this );
    this.value = defaultData || item.defaultValue || '';
    this.setData( this.props );
  }

  componentWillReceiveProps = ( newProps ) => {
    if ( !_.isEqual( this.props, newProps ) ) {
      this.setData( newProps );
    }
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
  }

  setData = ( aProps ) => {
    const { item } = aProps;
    if ( item.value ) {
      this.value = item.value;
    }
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
    window.getElementFromId( `apiForm-MaskedInput-${item.name}` ).focus();
  }

  handleMaskedInputChange = ( e ) => {
    this.value = e.target.value;
    this.checkValidation();
    this.props.handleChange();
  }
  
  render() {
    const { mode, item, defaultData, index, mask, isErrBorder, tabIndex } = this.props;
    const { error } = this.state;
    if ( mode.mode !== MODE_READ ) {
      return (
        item.value?
          <MaskedInput 
            key={`apiForm-MaskedInput-${item.name}`}
            tabIndex={tabIndex}
            className={cn('apiForm-maskedInput', isErrBorder && !!error? 'apiform-error' : '')}
            placeholder={item.placeholder || ''}
            id={`apiForm-MaskedInput-${item.name}`}
            name={item.name}
            value={item.value}
            mask={mask}
            onChange={this.handleMaskedInputChange.bind( this )}
          />
        :
          <MaskedInput 
            key={`apiForm-MaskedInput-${item.name}`}
            tabIndex={tabIndex}
            className={cn('apiForm-maskedInput', isErrBorder && !!error? 'apiform-error' : '')}
            placeholder={item.placeholder || ''}
            id={`apiForm-MaskedInput-${item.name}`}
            name={item.name}
            mask={mask}
            disabled={item.disabled || false}
            onChange={this.handleMaskedInputChange.bind( this )}
            defaultValue={defaultData || item.defaultValue || ''}
          />
      );
    } else {
      return (
        <div key={index} className='apiform-content-view-div'>
          {defaultData || ''}
        </div>
      );
    }
  }
}

APIFormMaskedInput.propTypes = {
  
};

APIFormMaskedInput.defaultProps = {
  
};

export default APIFormMaskedInput;