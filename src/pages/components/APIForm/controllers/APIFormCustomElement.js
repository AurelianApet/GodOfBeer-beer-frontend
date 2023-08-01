import { Component } from 'react';


export class APIFormCustomElement extends Component {
  constructor(props) {
    super(props);

    this.state = {
     
    };
  }

  componentDidMount = () => {
    const { defaultData, onRef } = this.props;
    onRef( this );
    this.value = defaultData || '';
    this.checkValidation();
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
  }

  checkValidation = () => {
    const { item, parent } = this.props;
    const validationResult = parent.checkItemValidate( this.value, item );
    this.setState({
      error: validationResult.error,
    });
  }

  handleElementOnChange = ( aValue ) => {
    this.value = aValue;
    this.checkValidation();
    this.props.handleChange();
  }

  render() {
    const { mode, item, defaultData, index, tabIndex } = this.props;
    const { error } = this.state;
    if ( item.customRender ) {
      return item.customRender( item, defaultData, mode, error, index, tabIndex, this );
    } else {
      return null;
    }
  }
}

APIFormCustomElement.propTypes = {
  
};

APIFormCustomElement.defaultProps = {
  
};

export default APIFormCustomElement;