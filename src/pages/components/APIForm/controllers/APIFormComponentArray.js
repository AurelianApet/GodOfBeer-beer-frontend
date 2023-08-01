import React, { Component } from 'react';
import ComponentArray from '../../ComponentArray';
import { MODE_READ } from '../../APIForm';
import cn from 'classnames'

export class APIFormComponentArray extends Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  componentDidMount = () => {
    const { onRef, defaultData } = this.props;
    onRef( this );
    this.value = defaultData || [];
    this.setData( this.props );
  }

  componentWillReceiveProps = ( newProps ) => {
    this.setData( newProps );
    if ( this.value && newProps.defaultData ) {
      this.value = newProps.defaultData || [];
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
    this.setState({
      sDefaultData: defaultData || [],
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
    window.getElementFromId( `apiForm-component-array-${item.name}` ).focus();
  }

  handleChange = ( aValues ) => {
    this.value = aValues;
    this.checkValidation();
    this.props.handleChange();
  }
  
  render() {
    const { mode, item, index, tabIndex, isErrBorder } = this.props;
    const { error, sDefaultData } = this.state;
    return (
      <ComponentArray
        key={mode.mode === MODE_READ? index : `apiForm-component-array-${item.name}`}
        pPrimaryKey={item.arrayInfo.primaryKey}
        id={`apiForm-component-array-${item.name}`}
        tabIndex={tabIndex}
        className={cn( mode.mode === MODE_READ? 'apiform-content-view-div' : '', isErrBorder && !!error? 'apiform-error' : '' )}
        mode={mode.mode}
        arrayInfo={item.arrayInfo}
        defaultData={sDefaultData}
        onChange={this.handleChange.bind()}
      />
    );
  }
}

APIFormComponentArray.propTypes = {
  
};

APIFormComponentArray.defaultProps = {
  
};

export default APIFormComponentArray;