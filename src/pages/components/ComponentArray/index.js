import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import _ from 'lodash';
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import Radio from '../Radio';

// type of components
export const TYPE_PHOTO = 0;
export const TYPE_BLANK = 1;
export const TYPE_RADIO = 2;
export const TYPE_OPTION = 3;
export const TYPE_DATE = 4;
export const TYPE_CHECK = 5;
export const TYPE_MASK_INPUT = 6;
export const TYPE_NUMBER = 7;
export const TYPE_SELECT = 8;
export const TYPE_TIME = 9;
export const TYPE_DATETIME = 10;
export const TYPE_CUSTOM = 11;
export const TYPE_BUTTON = 12;
export const TYPE_APISELECT = 13;
export const TYPE_INPUT = 14;
export const TYPE_TEXTAREA = 15;
export const TYPE_CHONJIEDITOR = 16;
export const TYPE_FILEUPLOAD = 17;
export const TYPE_USER_SELECT = 18;
export const TYPE_COMPONENT_ARRAY = 19;
export const TYPE_EXTENDED_INPUT = 20;
export const TYPE_PASSWORD = 21;
export const TYPE_DATATABLE = 22;

// type of mode
export const MODE_READ = 0;
export const MODE_CREATE = 1;
export const MODE_UPDATE = 2;
export const MODE_NONE = 3;

export class ComponentArray extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sCurrentLength: 0,
      sValues: [],
    };
    this.mounted = false;
    this.values = [];
  }

  componentDidMount = () => {
    this.mounted = true;
    const { defaultData } = this.props;
    this.setDefaultData(defaultData);
  }

  componentWillReceiveProps = (newProps) => {
    if ( !_.isEqual(this.props.defaultData, newProps.defaultData) ) {
      this.setDefaultData(newProps.defaultData)
    }
  }

  componentWillUnmount =() => {
    this.mounted = false;
  }

  setDefaultData = (defaultData) => {
    for( let i = 0; i < defaultData.length; i ++ ) {
      this.values[i] = defaultData[i] || {};
    }
    this.setState({
      sCurrentLength: this.defineAllInputed()? defaultData.length + 1 : defaultData.length || 1,
      sValues: defaultData || [],
    })
  }

  defineAllInputed = () => {
    const { arrayInfo } = this.props;
    let result = true;
    const lastIndex = this.values.length - 1;
    _.map( arrayInfo.types, ( typeItem, typeIndex ) => {
      if ( !( _.get( this.values[lastIndex], typeItem.name ) ) ) {
        result = false;
      }
    });
    return result;
  }

  defineEmptyValue = ( aIndex ) => {
    const { arrayInfo } = this.props;
    if ( !this.values[aIndex] ) {
      return false;
    }
    let isEmpty = true;
    _.map( arrayInfo.types, ( item, index ) => {
      if ( _.get( this.values[aIndex], item.name ) ) {
        isEmpty = false;
      }
    });
    return isEmpty;
  }

  handleElementChange = ( aName, aIndex, e ) => {
    this.handleChange( aName, aIndex, e.target.value );
  }

  handleChange = ( aName, aIndex, aValue ) => {
    const { arrayInfo, onChange, mode } = this.props;
    let { sCurrentLength } = this.state;
    if ( mode === MODE_NONE ) {
      return;
    }
    if ( !this.values[aIndex] ) {
      this.values.push({});
    }
    this.values[aIndex][aName] = aValue;
    if ( aValue ) {
      const overflow = arrayInfo.maxLength? sCurrentLength >= arrayInfo.maxLength : false;
      if ( aIndex === sCurrentLength - 1 && this.defineAllInputed() && !overflow ) {
        sCurrentLength = sCurrentLength + 1;
      }
    } else {
      const isEmpty = this.defineEmptyValue( aIndex );
      if ( isEmpty ) {
        let tmpResult = [];
        _.map( this.values, ( valueItem, valueIndex ) => {
          if ( valueIndex !== aIndex ) {
            tmpResult.push( valueItem );
          }
        });
        this.values = tmpResult;
      }
    }
    onChange( this.values );
    this.setState({
      sCurrentLength: sCurrentLength,
      sValues: this.values,
    });
  }

  renderArrayElement = ( defaultValue, aItem, aIndex ) => {
    const { mode } = this.props;
    let elementHtml;
    if ( mode === MODE_READ ) {
      elementHtml = 
        <div 
          className='component-array-read-div' 
          key={`component-array-element-${aItem.name}-${aIndex}`}
          name={`component-array-input-${aIndex}`}
        >
          {defaultValue}
        </div>;
    } else {
      switch( aItem.type ) {
        case TYPE_INPUT: 
          elementHtml = 
            <input 
              key={`component-array-element-${aItem.name}-${aIndex}`}
              name={`component-array-input-${aIndex}`}
              onChange={this.handleElementChange.bind( this, aItem.name, aIndex )}
              defaultValue={defaultValue || ''}
            />;
          break;
        case TYPE_TEXTAREA:
          elementHtml = 
            <textarea
              key={`component-array-element-${aItem.name}-${aIndex}`}
              name={`component-array-textarea-${aIndex}`}
              onChange={this.handleElementChange.bind( this, aItem.name, aIndex )}
              defaultValue={defaultValue || ''}
            />;
          break;
        case TYPE_MASK_INPUT:
          elementHtml = 
            <MaskedInput 
              key={`component-array-element-${aItem.name}-${aIndex}`}
              name={`component-array-MaskedInput-${aIndex}`}
              mask={aItem.mask || []}
              onChange={this.handleElementChange.bind( this, aItem.name, aIndex )}
              defaultValue={defaultValue || ''}
            />;
          break;
        case TYPE_DATE:
          elementHtml = 
            <MaskedInput 
              key={`component-array-element-${aItem.name}-${aIndex}`}
              name={`component-array-MaskedInput-${aIndex}`}
              mask={[/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
              onChange={this.handleElementChange.bind( this, aItem.name, aIndex )}
              defaultValue={defaultValue || ''}
            />;
          break;
        case TYPE_DATETIME:
          elementHtml = 
            <MaskedInput 
              key={`component-array-element-${aItem.name}-${aIndex}`}
              name={`component-array-MaskedInput-${aIndex}`}
              mask={[/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/]}
              onChange={this.handleElementChange.bind( this, aItem.name, aIndex )}
              defaultValue={defaultValue || ''}
            />;
          break;
        case TYPE_TIME:
          elementHtml = 
            <MaskedInput 
              key={`component-array-element-${aItem.name}-${aIndex}`}
              name={`component-array-MaskedInput-${aIndex}`}
              mask={[/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/]}
              onChange={this.handleElementChange.bind( this, aItem.name, aIndex )}
              defaultValue={defaultValue || ''}
            />;
          break;
        case TYPE_NUMBER:
          const mask = createNumberMask({
            prefix: '',
            suffix: '',
            thousandsSeparatorSymbol: '',
          });
          elementHtml = 
            <MaskedInput 
              key={`component-array-element-${aItem.name}-${aIndex}`}
              name={`component-array-MaskedInput-${aIndex}`}
              mask={mask}
              onChange={this.handleElementChange.bind( this, aItem.name, aIndex )}
              defaultValue={defaultValue || ''}
            />;
          break;
        case TYPE_SELECT:
          elementHtml = 
            <select
              onChange={this.handleElementChange.bind( this, aItem.name, aIndex )}
              defaultValue={defaultValue || ''}
            >
              {
                _.map( aItem.values, ( columnItem, columnIndex ) => {
                  return <option key={columnIndex} value={columnItem.name}>{columnItem.title}</option>
                })
              }
            </select>;
          break;
          case TYPE_RADIO:
            elementHtml = 
              <Radio
                values={aItem.values}
                defaultValue={defaultValue || aItem.defaultValue || ''}
                onChange={this.handleChange.bind( this, aItem.name, aIndex )}
              />;
          break;
        default: 
          elementHtml = 
            <input 
              key={`component-array-element-${aItem.name}-${aIndex}`}
              name={`component-array-input-${aIndex}`}
              onChange={this.handleElementChange.bind( this, aItem.name, aIndex )}
              defaultValue={defaultValue || ''}
            />;
          break;
      }
    }
    return elementHtml;
  }

  renderComponentArrayTableHeader = () => {
    const { arrayInfo } = this.props;
    let resultHtml = [];
    _.map( arrayInfo.types, ( typeItem, typeIndex ) => {
      if ( typeItem.title ) {
        resultHtml.push(
          <th key={typeIndex}>
            {typeItem.title}
          </th>
        );
      }
    });
    return resultHtml;
  }

  renderComponentArrayTableColumn = ( aIndex ) => {
    const { arrayInfo } = this.props;
    const { sValues } = this.state;
    let resultHtml = [];
    _.map( arrayInfo.types, ( typeItem, typeIndex ) => {
      resultHtml.push(
        <td key={typeIndex}>
          {this.renderArrayElement( _.get( sValues[aIndex], typeItem.name ), typeItem, aIndex )}
        </td>
      );
    });
    return resultHtml;
  }

  renderComponentArrayTableBody = () => {
    const { pPrimaryKey } = this.props;
    const { sCurrentLength, sValues } = this.state;
    let resultHtml = [];
    for ( let i = 0; i < sCurrentLength; i ++ ) {
      const key = _.get( sValues[i], pPrimaryKey ) || i;
      resultHtml.push( 
        <tr key={key}>
          {this.renderComponentArrayTableColumn( i )}
        </tr>
      )
    }
    return resultHtml;
  }

  renderComponentArrayTable = () => {
    let tableHtml = [];
    const tableHeaderHtml = this.renderComponentArrayTableHeader();
    if ( tableHeaderHtml.length !== 0 ) {
      tableHtml.push(
        <thead key='thead'>
          <tr>
            {tableHeaderHtml}
          </tr>
        </thead>
      );
    }
    tableHtml.push(
      <tbody key='tbody'>
        {this.renderComponentArrayTableBody()}
      </tbody>
    );
    return(
      <table className='component-array-table'>
        {tableHtml}
      </table>
    );
  }
  
  render() {
    const { className, id, name, tabIndex } = this.props;
    if ( this.mounted ) {
      return (
        <div 
          className={cn( 'component-componentArray-container', className )}
          id={id}
          name={name}
          tabIndex={tabIndex}
        >
          {this.renderComponentArrayTable()}
        </div>
      );
    } else {
      return null;
    }
  }
}

ComponentArray.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  pPrimaryKey: PropTypes.string,
  tabIndex: PropTypes.number,
  mode: PropTypes.number,
  arrayInfo: PropTypes.object,
  defaultData: PropTypes.array,
  onChange: PropTypes.func,
};

ComponentArray.defaultProps = {
  id: '',
  name: '',
  className: '',
  pPrimaryKey: '',
  tabIndex: null,
  mode: MODE_CREATE,
  arrayInfo: {
    type: TYPE_INPUT,
    rows: 1,
  },
  defaultData: [],
  onChange: () => {},
};

export default ComponentArray;