import React, { Component } from 'react';
import UserSelect from '../../UserSelect';
import { MODE_READ } from '../../APIForm';

export class APIFormUserSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: [],
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
    const { defaultData } = aProps;
    this.value = defaultData || [];
    this.checkValidation();
    this.setState({
      value: this.value,
    });
  }

  checkValidation = () => {
    const { item, parent } = this.props;
    const validationResult = parent.checkItemValidate( this.value, item );
    this.setState({
      error: validationResult.error,
    });
  }

  handleUserChange = (val) => {
    this.value = val;
    this.checkValidation();
    this.setState({
      value: this.value,
    })
    this.props.handleChange();
  }
  
  render() {
    const { mode, defaultData, index, isErrBorder, tabIndex } = this.props;
    const { value, error } = this.state;
    if ( mode.mode !== MODE_READ ) {
      return (
        <UserSelect
          defaultValue = {value || []}
          tabIndex={tabIndex}
          className={isErrBorder && !!error? 'apiform-error' : ''}
          pHandleUserChange={this.handleUserChange}
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

APIFormUserSelect.propTypes = {
  
};

APIFormUserSelect.defaultProps = {
  
};

export default APIFormUserSelect;