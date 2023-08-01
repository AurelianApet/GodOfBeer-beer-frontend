import React, { Component } from 'react';
import cn from 'classnames';
import _ from 'lodash';
import { MODE_READ } from '../../APIForm';

export class APIFormSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sValue: '',
    };
  }

  componentDidMount = () => {
    const { onRef } = this.props;
    onRef( this );
    this.setData( this.props )
  }

  componentWillReceiveProps = ( newProps ) => {
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
  }

  setData = ( aProps ) => {
    const { defaultData } = aProps;
    this.value = defaultData;
    this.checkValidation();
    this.setState({
      sValue: defaultData,
    });
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
    window.getElementFromId( `apiForm-select-${item.name}` ).focus();
  }

  handleChangeSelect = ( aName, e ) => {
    this.value = e.target.value;
    this.checkValidation();
    this.setState({
      sValue: e.target.value,
    });
    this.props.handleChange();
  }
  
  render() {
    const { mode, item, defaultData, index, isErrBorder, tabIndex } = this.props;
    const { sValue, error } = this.state;
    if ( mode.mode !== MODE_READ ) {
      return (
        <select
          key={`apiForm-select-${item.name}`}
          id={`apiForm-select-${item.name}`}
          tabIndex={tabIndex}
          onChange={this.handleChangeSelect.bind( this, item.name )}
          className={cn( 'apiform-select', isErrBorder && !!error? 'apiform-error' : '' )}
          value={sValue}
        >
          {
            _.map( item.value, ( dataItem, dataIndex ) => {
              if ( sValue === dataItem.value ) {
                return <option key={dataIndex} value={dataItem.value} checked>{dataItem.title}</option>
              } else {
                return <option key={dataIndex} value={dataItem.value}>{dataItem.title}</option>
              }
            })
          }
        </select>
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

APIFormSelect.propTypes = {
  
};

APIFormSelect.defaultProps = {
  
};

export default APIFormSelect;