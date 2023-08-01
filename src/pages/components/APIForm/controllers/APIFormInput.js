import React, { Component } from 'react';
import cn from 'classnames';
import { MODE_READ } from '../../APIForm';

export class APIFormInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  componentDidMount = () => {
    const { onRef, defaultData } = this.props;
    onRef( this );
    this.value = defaultData || '';
    this.setData( this.props );
  }

  componentWillReceiveProps = ( newProps ) => {
    this.setData( newProps );
    if ( this.input && newProps.defaultData ) {
      const { item, defaultData } = newProps;
      let defaultDataString = defaultData || '';
      if ( typeof defaultData === 'object' ) {
        defaultDataString = item.data? item.data( defaultData ) : JSON.stringify( defaultData );
      }
      this.input.value = defaultDataString;
    }
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
  }

  setData = ( aProps ) => {
    const { item, defaultData } = aProps;
    if ( item.value ) {
      this.value = item.value;
    }
    let defaultDataString = defaultData || '';
    if ( typeof defaultData === 'object' ) {
      defaultDataString = item.data? item.data( defaultData ) : JSON.stringify( defaultData );
    }
    this.setState({
      sDefaultData: defaultDataString || '',
    })
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
    window.getElementFromId( `apiForm-input-${item.name}` ).focus();
  }

  handleInputChange = ( e ) => {
    this.value = e.target.value;
    this.checkValidation();
    this.props.handleChange();
  }
  
  render() {
    const { mode, item, index, isErrBorder, tabIndex } = this.props;
    const { error, sDefaultData } = this.state;
    if ( mode.mode !== MODE_READ ) {
      return (
        item.value?
          <input 
            key={`apiForm-input-${item.name}`}
            tabIndex={tabIndex}
            className={cn('apiForm-input', isErrBorder && !!error? 'apiform-error' : '')}
            value={item.value}
            placeholder={item.placeholder || ''}
            id={`apiForm-input-${item.name}`}
            name={item.name}
            onChange={this.handleInputChange.bind()}
          />
        :
          <input 
            ref={ref => this.input = ref}
            key={`apiForm-input-${item.name}`}
            tabIndex={tabIndex}
            className={cn('apiForm-input', isErrBorder && !!error? 'apiform-error' : '')}
            placeholder={item.placeholder || ''}
            id={`apiForm-input-${item.name}`}
            name={item.name}
            disabled={item.disabled || false}
            onChange={this.handleInputChange.bind()}
            defaultValue={sDefaultData || ''}
          />
      );
    } else {
      return (
        <div key={index} className='apiform-content-view-div'>
          {sDefaultData || ''}
        </div>
      );
    }
  }
}

APIFormInput.propTypes = {
  
};

APIFormInput.defaultProps = {
  
};

export default APIFormInput;