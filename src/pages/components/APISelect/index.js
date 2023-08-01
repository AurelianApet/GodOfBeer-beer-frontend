import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import _ from 'lodash';

import { executeQuery } from '../../../library/utils/fetch';

export class APISelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sSelectData: [],
      sIsLoading: true,
    };
  }

  componentWillMount = () => {
    const { pAPIInfo, defaultData } = this.props;
    executeQuery({
      method: pAPIInfo.method || 'get',
      url: pAPIInfo.url || '',
      success: ( res ) => {
        let result = [];
        let currentValue = '';
        if ( pAPIInfo.callback ) {
          result = pAPIInfo.callback( res );
        } else {
          result = res.docs;
        }
        _.map( result, ( item, index ) => {
          if ( item.value === defaultData ) {
            currentValue = item.value;
          }
        })
        result.splice( 0, 0, { value: null, title: '', } );
        this.setState({
          sSelectData: result,
          sIsLoading: false,
          sCurrentValue: currentValue,
        })
      },
      fail: (err) => {
        this.setState({
          sSelectData: [],
          sIsLoading: false,
        })
      }
    });
  }

  componentDidMount = () => {
    const { error, onRef } = this.props;
    this.setState({
      sHasError: !!error,
    })
    onRef( this );
  }

  componentWillReceiveProps = ( newProps ) => {
    const { error } = newProps;
    this.setState({
      sHasError: !!error,
    })
  }

  componentWillUnmount = () => {
    const { onRef } = this.props;
    onRef( null );
  }

  getFocus = () => {
    const { id } = this.props;
    window.getElementFromId( `apiselect-${id}` ).focus();
  }

  handleChange = ( e ) => {
    const { onChange } = this.props;
    this.setState({
      sCurrentValue: e.target.value,
    });
    onChange( e );
  }
  
  render() {
    const { className, id, name, defaultData, isEditable, tabIndex } = this.props;
    const { sSelectData, sIsLoading, sCurrentValue, sHasError } = this.state;
    if ( isEditable ) {
      return (
        <div 
          className={cn('component-apiSelect-container', className )} 
          name={name} 
          id={id} 
        >
          {!sIsLoading &&
            <select
              onChange={this.handleChange.bind( this )}
              className={cn('api-select', sHasError? 'api-select-error' : '' )}
              value={sCurrentValue}
              tabIndex={tabIndex}
              id={`apiselect-${id}`}
            >
              {
                _.map( sSelectData, ( dataItem, dataIndex ) => {
                  if ( defaultData !== '' && defaultData === dataItem.value ) {
                    return <option key={dataIndex} value={dataItem.value} checked>{dataItem.title}</option>
                  } else {
                    return <option key={dataIndex} value={dataItem.value}>{dataItem.title}</option>
                  }
                })
              }
            </select>
          }
        </div>
      );
    } else {
      let resultHtml = [];
      _.map( sSelectData, ( dataItem, dataIndex ) => {
        if ( defaultData !== '' && defaultData === dataItem.value ) {
          resultHtml.push( <div className='apiSelect-view-div' key={dataIndex} >{dataItem.title}</div> );
        }
      });
      return resultHtml;
    }
  }
}

APISelect.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  defaultData: PropTypes.string,
  tabIndex: PropTypes.number,
  isEditable: PropTypes.bool,
  pAPIInfo: PropTypes.object,
  onChange: PropTypes.func,
  onRef: PropTypes.func,
};

APISelect.defaultProps = {
  name: '',
  id: 'APISelect',
  className: '',
  defaultData: '',
  tabindex: null,
  isEditable: true,
  pAPIInfo: {},
  onChange: () => {},
  onRef: () => {},
};

export default APISelect;
