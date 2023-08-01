import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LANG from '../../../../../../language';

const doneTypingInterval = 1000;

export default class MultiCheckSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.value,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef( this );
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setWrapperRef = (node) => {
    this.wrapperRef = node;
  }
  
  doneTyping = () => {
    if (!this.mounted)
      return;
    const { setFilter } = this.props;
    if(this && this.input){
      this.setState({ data: this.input.value }, () => {
        setFilter(this.state);
      });
    }
  }

  handleKeyUp = () => {
    if (!this.mounted)
      return;
    if (this.typingTimer)
      clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(this.doneTyping, doneTypingInterval);
  }

  handleKeyDown = () => {
    if (!this.mounted)
      return;
    if (this.typingTimer)
      clearTimeout(this.typingTimer);
  }

  handleTextChange = () => {
    if (!this.mounted)
      return;
    this.setState({ data: this.input.value });
  }

  handleClearSearch = () => {
    this.setState({ data: '' });
    this.handleKeyUp();
  }

  render() {
    const { data } = this.state;
    return (
      <div className="multiCheck-search" ref={this.setWrapperRef}>
        { data ?
          <div onClick={this.handleClearSearch}>
            <i className="fa fa-times multiCheck-search-icon"/>
          </div> :
          <i className="fa fa-search multiCheck-search-icon"/>
        }
        <input
          id = "multiCheck-search"
          type="text"
          className="form-control multiCheck-search-input"
          placeholder={LANG('PAGE_FIRSTSCREEN_INPUT_SEARCHWORD')}
          value={data}
          ref={(el) => { this.input = el; }}
          onChange={this.handleTextChange}
          onKeyUp={this.handleKeyUp}
          onKeyDown={this.handleKeyDown}
        />

      </div>
    );
  }
}

MultiCheckSearch.propTypes = {
  setFilter: PropTypes.func.isRequired,
  value: PropTypes.string,
}

MultiCheckSearch.defaultProps = {
  setFilter: () => {},
  value: '',
}