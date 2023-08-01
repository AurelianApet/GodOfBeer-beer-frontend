import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export class CustomizedSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sIsVisited: false,
      sIsRequired: false,
    };
  }
  handleBlur = (e) => {
    const { value } = e.target;
    const { pIsRequired } = this.props;
    this.setState({
      sIsVisited: true,
    });
    if (value) {
      this.setState({ sIsRequired: false });
    } else {
      this.setState({ sIsRequired: pIsRequired });
    }
  }

  render() {
    const {
      className,
      pLabelClassName,
      onChange,
      pData,
      pValue,
      pLabel,
      pHasError,
      pErrorMessage,
      pIsLabelAfter,
      pIsRequired,
      pIsBadgeVisible,
      pPlaceHolder,
      pIsDisabled,
      pHasDefault,
      pIsErrorVisible,
      ...restProps
    } = this.props;
    const { sIsVisited } = this.state;
    return (
      <div className={cn('component-select-container', { 'has-value': true, required: (sIsVisited && this.state.sIsRequired) || pHasError }, pLabelClassName)}>
        <div className="select-label">
          {
            pLabel && !pIsLabelAfter &&
            <span>{pLabel} {
              !pIsBadgeVisible && pIsBadgeVisible && ((sIsVisited && pIsRequired) || pHasError) && <em>Required</em>
              }
            </span>
          }
          <select
            onChange={onChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            className={cn("control-select form-control", className)}
            disabled={pIsDisabled}
            {...restProps}
            value={pValue}
          >
            { pHasDefault && <option value=""></option> }
            {
              pData && pData.map((item, key) => (<option key={key} value={item.value}>{item.title}</option>))
            }
          </select>
          {
            pIsLabelAfter && pLabel && <span>{pLabel}</span>
          }
        </div>
        {
          pIsErrorVisible &&
          <div className="error">{pErrorMessage !== 'The input field is required' && pErrorMessage}</div>
        }
      </div>
    );
  }
}

CustomizedSelect.propTypes = {
  className: PropTypes.string,
  pLabelClassName: PropTypes.string,
  name: PropTypes.string,

  pData: PropTypes.array,
  pHasError: PropTypes.bool,
  pErrorMessage: PropTypes.string,
  pLabel: PropTypes.node,
  
  onChange: PropTypes.func.isRequired,
  pValue: PropTypes.string,
  pIsRequired: PropTypes.bool,
  pPlaceHolder: PropTypes.string,
  pIsLabelAfter: PropTypes.bool,
  pIsBadgeVisible: PropTypes.bool,
  pIsDisabled: PropTypes.bool,
  pHasDefault: PropTypes.bool,
  pIsErrorVisible: PropTypes.bool,
};

CustomizedSelect.defaultProps = {
  className: '',
  pLabelClassName: '',
  pHasError: false,
  pErrorMessage: '',
  label: null,
  name: '',
  pValue: '',
  pIsRequired: false,
  pPlaceHolder: 'Select ...',
  pData: null,
  pIsLabelAfter: false,
  pIsBadgeVisible: true,
  pIsDisabled: false,
  pHasDefault: true,
  pIsErrorVisible: true,
};

export default CustomizedSelect;
