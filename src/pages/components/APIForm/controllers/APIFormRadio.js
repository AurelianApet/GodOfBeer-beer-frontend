import React, { Component } from 'react';
import Radio from '../../Radio';
import { MODE_READ } from '../../APIForm';

export class APIFormRadio extends Component {
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
    this.radio.getFocus();
  }

  handleRadioChange = ( aValue, name ) => {
    this.value = aValue;
    this.checkValidation();
    this.props.handleChange( name, aValue );
  }
  
  render() {
    const { mode, item, defaultData, isErrBorder, tabIndex } = this.props;
    const { error } = this.state;
    return (
      <Radio
        onRef={ ( ref ) => {this.radio = ref}}
        key={`apiForm-Radio-${item.name}`}
        tabIndex={tabIndex}
        id={`apiForm-Radio-${item.name}`}
        name={item.name}
        className={isErrBorder && !!error? 'apiform-select-error' : ''}
        values={item.value}
        defaultValue={defaultData || item.defaultValue || ''}
        onChange={this.handleRadioChange.bind()}
        isEditable={mode.mode !== MODE_READ}
      />
    );
  }
}

APIFormRadio.propTypes = {
  
};

APIFormRadio.defaultProps = {
  
};

export default APIFormRadio;