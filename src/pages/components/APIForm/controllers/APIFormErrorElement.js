import React, { Component } from 'react';
import { ERROR_ALERT, ERROR_BORDER, ERROR_CUSTOM, ERROR_DIV, ERROR_NOTIFICATION } from '..';
import { pushNotification, NOTIFICATION_TYPE_ERROR } from '../../../../library/utils/notification';


export class APIFormErrorElement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
    };
    this.mounted = false;
  }

  componentDidMount = () => {
    const { errors } = this.props;
    this.setState({ errors, });
    this.mounted = true;
  }

  componentWillReceiveProps = ( newProps ) => {
    const { errors } = newProps;
    this.setState({ errors, });
  }

  componentWillUnmount = () => {
    this.mounted = false;
    clearTimeout( this.timeout );
  }

  renderErrorDiv = ( item, errors, index ) => {
    const { themeInfo } = this.props;
    const hasError = errors[item.name] && errors[item.name] !== '';
    const top = window.getElementFromId( `${item.name}-content` ).innerHeight();
    let errStyle = -1;
    if ( !this.mounted ) {
      return null;
    }
    if ( themeInfo && themeInfo.error ) {
      errStyle = themeInfo.error.errorStyle;
    }
    switch ( errStyle ) {
      case ERROR_ALERT:
        return hasError? (
          <div className='error-alert' key={`${index}_error`} style={{top: top + 10 }}>
            {errors[item.name]}
          </div>
        ) : null ;
      case ERROR_BORDER:
        return null;
      case ERROR_CUSTOM:
        if ( themeInfo.error.custormRender )   {
          return ( themeInfo.error.custormRender( item, errors, index ) );
        }
        break;
      case ERROR_DIV:
        return (
          <div 
            className='error-div' 
            key={`${index}_error`} 
            style={{color: ( themeInfo && themeInfo.error && themeInfo.error.errColor ) || ''}}
          >
            {errors[item.name]}
          </div>
        );
      case ERROR_NOTIFICATION:
        if ( hasError ) {
          pushNotification( NOTIFICATION_TYPE_ERROR, errors[item.name] );
        }
        return null;
      default:
          return hasError? (
            <div className='error-alert' key={`${index}_error`} style={{top: top + 10}}>
              {errors[item.name]}
            </div>
          ) : null ;
    }
  }
  
  render() {
    const { item, index, pScrollableContainer, parent, themeInfo } = this.props;
    const { errors } = this.state;
    let errorDivHtml = [];
    const hasError = errors[item.name] && errors[item.name] !== '';
    errorDivHtml.push( this.renderErrorDiv( item, errors, index ) );
    if ( this.mounted && themeInfo && themeInfo.error && themeInfo.error.showTime ) {
      this.timeout = setTimeout(() => {
        if ( this.mounted ) {
        this.setState({
          errors: {},
        })
        }
      }, themeInfo.error.showTime * 1000 );
    }
    if ( hasError ) {
      if ( hasError && !parent.errorDivRendered ) {
        const targetPosition = window.getPosition( `${item.name}-content` );
        const containerPosition = window.getPosition( parent.props.id );
        const parentPosition = window.getPosition( pScrollableContainer );
        if ( containerPosition ) window.movePage( parent.props.id, targetPosition.top - containerPosition.top, targetPosition.left - containerPosition.left );
        if ( parentPosition ) window.movePage( pScrollableContainer, containerPosition.top - parentPosition.top, containerPosition.left - parentPosition.left );
      }
    }
    return errorDivHtml;
  }
}

APIFormErrorElement.propTypes = {
  
};

APIFormErrorElement.defaultProps = {
  
};

export default APIFormErrorElement;