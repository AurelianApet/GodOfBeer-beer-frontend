import React, { Component } from 'react';
import _ from 'lodash';
import { APISelect } from '../../APISelect';
import { MODE_READ } from '../../APIForm';

export class APIFormAPISelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sSelectData: [],
      sIsLoading: true,
    };
  }

  componentDidMount = () => {
    const { onRef, defaultData } = this.props;
    this.value = defaultData? defaultData._id : '';
    onRef( this );
    this.setData( this.props );
  }

  componentWillReceiveProps = ( newProps ) => {
    this.setData( newProps );
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
  }

  setData = ( aProps ) => {
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
    if ( this.apiselect ) {
      this.apiselect.getFocus();
    }
  }

  handleChangeSelect = ( e ) => {
    this.value = e.target.value;
    this.checkValidation();
    this.props.handleChange();
  }
  
  render() {
    const { mode, item, defaultData, tabIndex } = this.props;
    const { error } = this.state;
    return (
      <APISelect
        onRef={ ( ref ) => {this.apiselect = ref}}
        key={`apiForm-APISelect-${item.name}`}
        id={`apiForm-APISelect-${item.name}`}
        tabIndex={tabIndex}
        onChange={this.handleChangeSelect.bind( this )}
        className='apiform-ApiSelect'
        error={error}
        pAPIInfo={{
          method: 'get',
          url: item.url,
          callback: ( res ) => {
            let result = [];
            if ( item.data ) {
              result = item.data( res );
            } else {
              _.map( res.docs, ( docItem, index ) => {
                result.push({
                  value: docItem._id,
                  title: docItem.name,
                });
              });
            }
            return result;
          }
        }}
        defaultData={defaultData? defaultData._id : ''}
        isEditable={mode.mode !== MODE_READ}
      />
    );
  }
}

APIFormAPISelect.propTypes = {
  
};

APIFormAPISelect.defaultProps = {
  
};

export default APIFormAPISelect;