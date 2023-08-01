import React, { Component } from 'react';
import cn from 'classnames';
import _ from 'lodash';
import { MODE_READ } from '../../APIForm';

export class APIFormCheck extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sValues: {},
    };
    this.value = {};
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
    const { item, values, parent } = aProps;
    if ( item.value && item.value.length !== 0 ) {
      _.map( item.value, ( item, index ) => {
        this.value[item.name] = values[item.name] || false;
        parent.formData[item.name] = values[item.name] || false;
      })
    }
    this.setState({
      sValues: this.value,
    });
  }

  getFocus = () => {
    const { item } = this.props;
    window.getElementFromId( `apiForm-check-${item.name}` ).focus();
  }
  
  handleClickCheckBox = ( aName ) => {
    const { mode, parent } = this.props;
    if ( mode.mode === MODE_READ ) {
      return;
    }
    this.value[aName] = !this.value[aName];
    parent.formData[aName] = !parent.formData[aName];
    this.setState({
      sValues: this.value,
    })
    this.props.handleChange()
  }
  
  render() {
    const { item, tabIndex } = this.props;
    const { sValues } = this.state;
    return (
      <div 
        key={`apiForm-check-${item.name}`} 
        className='apiform-checkbox-content'
        tabIndex={tabIndex}
        id={`apiForm-check-${item.name}`}
      >
        { item.value && item.value.length !== 0 &&
          _.map( item.value, ( item, index ) => {
            return (
              <div key={index} className={`apiform-checkbox-${item.name}`} onClick={this.handleClickCheckBox.bind( this, item.name )}>
                <i className={cn( 'fa', sValues[item.name]? 'fa-check-square-o' : 'fa-square-o' )} />
                <span>{item.title}</span>
              </div>
            );
          })
        }
      </div>
    );
  }
}

APIFormCheck.propTypes = {
  
};

APIFormCheck.defaultProps = {
  
};

export default APIFormCheck;