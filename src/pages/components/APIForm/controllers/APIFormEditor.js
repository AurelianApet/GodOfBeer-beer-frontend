import React, { Component } from 'react';
import HtmlContainer from '../../HtmlContainer';
import { MODE_READ } from '../../APIForm';


export class APIFormEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sSelectData: [],
      sIsLoading: true,
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
    this.value = defaultData;
    this.checkValidation();
  }

  checkValidation = () => {
    const { item, parent } = this.props;
    const validationResult = parent.checkItemValidate( this.value, item );
    this.setState({
      error: validationResult.error,
    });
  }

  handleEditorChange = ( aValue, e ) => {
    this.value = aValue;
    this.checkValidation();
    this.props.handleChange();
  }
  
  render() {
    const { mode, defaultData, index } = this.props;
    if ( mode.mode !== MODE_READ ) {
      return null;
    } else {
      return (
        <HtmlContainer 
          key={index} 
          className='apiform-content-view-div'
          pData={defaultData || ''}
        />
      );
    }
  }
}

APIFormEditor.propTypes = {
  
};

APIFormEditor.defaultProps = {
  
};

export default APIFormEditor;