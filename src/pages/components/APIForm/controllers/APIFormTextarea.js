import React, { Component } from 'react';
import cn from 'classnames';
import { MODE_READ } from '../../APIForm';

export class APIFormTextarea extends Component {
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
    if ( this.textArea && newProps.defaultData ) {
      this.textArea.value = newProps.defaultData || '';
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
      sDefaultData: defaultData || '',
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
    window.getElementFromId( `apiForm-textarea-${item.name}` ).focus();
  }

  handleTextareaChange = ( e ) => {
    this.value = e.target.value;
    this.checkValidation();
    this.props.handleChange();
  }
  
  render() {
    const { mode, item, index, isErrBorder, tabIndex } = this.props;
    const { error, sDefaultData } = this.state;
    if ( mode.mode !== MODE_READ ) {
      return (
        item.value ?
          <textarea
            key={`apiForm-textarea-${item.name}`}
            tabIndex={tabIndex}
            className={cn('apiForm-textarea', isErrBorder && !!error? 'apiform-error' : '')}
            id={`apiForm-textarea-${item.name}`}
            value={item.value}
            name={item.name}
            onChange={this.handleTextareaChange.bind()}
          />
        :
          <textarea
            ref={ref => this.textArea = ref}
            key={`apiForm-textarea-${item.name}`}
            tabIndex={tabIndex}
            className={cn('apiForm-textarea', isErrBorder && !!error? 'apiform-error' : '')}
            id={`apiForm-textarea-${item.name}`}
            name={item.name}
            onChange={this.handleTextareaChange.bind()}
          />
      );
    } else {
      return (
        <div key={index} className='apiform-content-view-div'>
          <pre>{sDefaultData || ''}</pre>
        </div>
      );
    }
  }
}

APIFormTextarea.propTypes = {
  
};

APIFormTextarea.defaultProps = {
  
};

export default APIFormTextarea;