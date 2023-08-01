import React, { Component } from 'react';
import cn from 'classnames';
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { 
  MODE_READ, 
  TYPE_DATE, TYPE_TIME, TYPE_DATETIME, TYPE_NUMBER, TYPE_MASK_INPUT,
  EXTNEDED_PASSWORD, EXTENDED_DATE, EXTENDED_DATE_TIME, EXTENDED_TIME, EXTENDED_NUMBER, EXTENDED_MASKED,
} from '../../APIForm';

export class APIFormExtendedInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasValue: false,
    };
  }

  componentDidMount = () => {
    const { onRef, defaultData } = this.props;
    onRef( this );
    this.value = defaultData || '';
    this.setData( this.props );
  }

  componentWillReceiveProps = ( newProps ) => {
    if ( this.input && newProps.defaultData ) {
      this.input.value = newProps.defaultData || '';
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
    this.setState({
      hasValue: !!this.value,
    });
    this.checkValidation();
  }

  checkValidation = () => {
    const { item, parent } = this.props;
    let itemForCheck = {...item};
    itemForCheck.type = this.type;
    const validationResult = parent.checkItemValidate( this.value, itemForCheck );
    this.setState({
      error: validationResult.error,
    });
  }

  getFocus = () => {
    const { item } = this.props;
    window.getElementFromId( `apiForm-extended-input-${item.name}` ).focus();
  }

  handleInputChange = ( e ) => {
    this.value = e.target.value
    this.checkValidation();
    this.setState({
      hasValue: !!this.value,
    });
    this.props.handleChange();
  }

  renderInput = ( tabIndex, isErrBorder, error, defaultData ) => {
    const { item } = this.props;
    return (
      item.value?
        <input 
          key={`apiForm-extended-input-${item.name}`}
          tabIndex={tabIndex}
          className={cn('apiform-extended-input', isErrBorder && !!error? 'apiform-error' : '')}
          id={`apiForm-extended-input-${item.name}`}
          name={item.name}
          value = {item.value}
          onChange={this.handleInputChange.bind()}
          type={( item.extendedSetting && item.extendedSetting.inputType === EXTNEDED_PASSWORD )? 'password' : 'text'}
        />
      :
        <input 
          ref={ref => this.extendedInput = ref}
          key={`apiForm-extended-input-${item.name}`}
          tabIndex={tabIndex}
          className={cn('apiform-extended-input', isErrBorder && !!error? 'apiform-error' : '')}
          id={`apiForm-extended-input-${item.name}`}
          name={item.name}
          placeholder={item.placeholder}
          onChange={this.handleInputChange.bind()}
          defaultValue={defaultData || ''}
          type={( item.extendedSetting && item.extendedSetting.inputType === EXTNEDED_PASSWORD )? 'password' : 'text'}
        />
    )
  }

  renderMaskedInput = ( tabIndex, isErrBorder, error, defaultData, inputMask ) => {
    const { item } = this.props;
    return (
      item.value?
        <MaskedInput 
          key={`apiForm-MaskedInput-${item.name}`}
          tabIndex={tabIndex}
          className={cn('apiform-extended-input', isErrBorder && !!error? 'apiform-error' : '')}
          id={`apiForm-extended-input-${item.name}`}
          name={item.name}
          value={item.value}
          mask={inputMask}
          onChange={this.handleInputChange.bind( this )}
        />
      :
        <MaskedInput 
          key={`apiForm-MaskedInput-${item.name}`}
          tabIndex={tabIndex}
          className={cn('apiform-extended-input', isErrBorder && !!error? 'apiform-error' : '')}
          id={`apiForm-extended-input-${item.name}`}
          name={item.name}
          mask={inputMask}
          onChange={this.handleInputChange.bind( this )}
          defaultValue={defaultData || ''}
        />
    )
  }
  
  render() {
    const { mode, item, defaultData, index, isErrBorder, tabIndex } = this.props;
    const { error, hasValue } = this.state;
    let inputMask = null;
    if ( item.extendedSetting && item.extendedSetting ) {
      switch( item.extendedSetting.inputType ) {
        case EXTENDED_DATE:
          inputMask = [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
          this.type = TYPE_DATE;
          break;
        case EXTENDED_MASKED:
          inputMask = item.mask;
          this.type = TYPE_MASK_INPUT;
          break;
        case EXTENDED_NUMBER:
          inputMask = createNumberMask({
            prefix: '',
            suffix: '',
            thousandsSeparatorSymbol: '',
          });
          this.type = TYPE_NUMBER;
          break;
        case EXTENDED_TIME:
          inputMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
          this.type = TYPE_TIME;
          break;
        case EXTENDED_DATE_TIME:
          inputMask = [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
          this.type = TYPE_DATETIME;
          break;
        default:
          inputMask = null;
          break;
      }
    }
    if ( mode.mode !== MODE_READ ) {
      return (
        <div 
          key={`apiForm-extended-input-${item.name}`} 
          className={cn( 'apiform-extended-input-div', hasValue? 'apiform-extended-input-div-hasValue' : '', item.className )}
        >
          { !inputMask? 
              this.renderInput( tabIndex, isErrBorder, error, defaultData )
            :
              this.renderMaskedInput( tabIndex, isErrBorder, error, defaultData, inputMask )
          }
          <label 
            className='apiform-extended-input-label'
          >
            {( item.extendedSetting && item.extendedSetting.label ) || ''}
          </label>
        </div>
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

APIFormExtendedInput.propTypes = {
  
};

APIFormExtendedInput.defaultProps = {
  
};

export default APIFormExtendedInput;