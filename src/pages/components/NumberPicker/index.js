import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import Input from '../../components/Form/Input';
import LANG from '../../../language';

class NumberPicker extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sCurrentNumber: this.props.defaultValue,
      sIsFirst: this.props.defaultValue === this.props.minValue,
      sIsLast: this.props.defaultValue === this.props.maxValue,
    };  
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, false);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      sCurrentNumber: newProps.defaultValue,
      sIsFirst: newProps.defaultValue === newProps.minValue,
      sIsLast: newProps.defaultValue === newProps.maxValue,
    }); 
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }

  handleKeyDown = (e) => {
    if ( e.ctrlKey && e.altKey && e.key === 'PageUp') {
      this.handleClickPrev();
    }
    if ( e.ctrlKey && e.altKey && e.key === 'PageDown') {
      this.handleClickNext();
    }
    if ( e.ctrlKey && e.altKey && e.key === 'Home') {
      this.handleClickGoToStart();
    }
    if ( e.ctrlKey && e.altKey && e.key === 'End') {
      this.handleClickGoToLast();
    }
  }

  handleClickGoToStart = () => {
    const { sIsFirst } = this.state;
    if (sIsFirst) return;
    const { minValue} = this.props;
    this.setState({
      sCurrentNumber: minValue,
      sIsFirst: true,
      sIsLast: false,
    });
    this.handleExportValue(minValue);
  }

  handleClickPrev = () => {
    const { sCurrentNumber, sIsFirst } = this.state;
    if (sIsFirst) return;
    const { minValue } = this.props;
    this.setState({
      sCurrentNumber: sCurrentNumber - 1,
      sIsFirst: sCurrentNumber ===  minValue + 1,
      sIsLast: false,
    });
    this.handleExportValue(sCurrentNumber - 1);
  }

  handleClickNext = () => {
    const { sCurrentNumber, sIsLast } = this.state;
    if (sIsLast) return;
    const { maxValue } = this.props;
    this.setState({
      sCurrentNumber: sCurrentNumber + 1,
      sIsLast: sCurrentNumber === maxValue - 1,
      sIsFirst: false,
    });
    this.handleExportValue(sCurrentNumber + 1);
  }

  handleClickGoToLast = () => {
    const { sIsLast } = this.state;
    if (sIsLast) return;
    const { maxValue } = this.props;
    this.setState({
      sCurrentNumber: maxValue,
      sIsFirst: false,
      sIsLast: true,
    });
    this.handleExportValue(maxValue);
  }

  handleExportValue = (aValue) => {
    const { pGetValue } = this.props;
    if (pGetValue === null) {
      return;
    } else {
      pGetValue(aValue);
    }
  }

  render() {
    const { className } = this.props;
    const { sCurrentNumber, sIsFirst, sIsLast } = this.state;
    return (
      <div className={cn("numberPicker-container", className)}>
        <ul className="numberPicker-pagination">
          <li className={cn(sIsFirst? "disabled" : "")}><i className="fa fa-step-backward" onClick={this.handleClickGoToStart} title={LANG('COMP_NUMBERPICKER_GO_FIRST')} /></li>
          <li className={cn(sIsFirst? "disabled" : "")}><i className="fa fa-chevron-left" onClick={this.handleClickPrev} title={LANG('COMP_NUMBERPICKER_GO_PREV')} /></li>
          <li>
            <Input 
              id="numberPicker-"
              name="numberPicker"
              className="numberPicker-text"
              label=""
              placeHolder=""
              value={sCurrentNumber.toString()}
              isBadgeVisible={false}
              onChange={this.handleCommandChange}
              isErrorPlaceHolder={true}
              readOnly={true}
            />  
          </li>
          <li className={cn(sIsLast? "disabled" : "")}><i className="fa fa-chevron-right" onClick={this.handleClickNext} title={LANG('COMP_NUMBERPICKER_GO_NEXT')} /></li>
          <li className={cn(sIsLast? "disabled" : "")}><i className="fa fa-step-forward" onClick={this.handleClickGoToLast} title={LANG('COMP_NUMBERPICKER_GO_END')} /></li>
          </ul>
      </div>
    );
  }
}

NumberPicker.propTypes = {
  className: PropTypes.string,
  defaultValue: PropTypes.number,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  pGetValue: PropTypes.func,
};

NumberPicker.defaultProps = {
  className: "",
  defaultValue: 1,
  minValue: 1,
  pGetValue: null,
};

export default NumberPicker