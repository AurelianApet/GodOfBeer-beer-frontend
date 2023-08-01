import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LANG from '../../../../language';

const doneTypingInterval = 1000;

const getColumnName = (columnName) => {
  const name = columnName.replace('.', '_');
  return `table_filter_${name}`;
}

export default class StringFilterHeaderCell extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.value,
    };
  }

  componentDidMount() {
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
    const { setFilter, columnName } = this.props;
    if(this && this.input){
      this.setState({ data: this.input.value }, () => {
        setFilter(this.state);
        window.setFocus('#' + getColumnName(columnName), 100);
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

  render() {
    const { columnName } = this.props;
    const { data } = this.state;

    return (
      <th className="header-cell">
        <div className="header-cell-container has-filter" ref={this.setWrapperRef}>
          <input
            id={getColumnName(columnName)}
            type="text"
            className="form-control"
            placeholder={LANG('COMP_TABLE_SEARCH')}
            value={data}
            ref={(el) => { this.input = el; }}
            onChange={this.handleTextChange}
            onKeyUp={this.handleKeyUp}
            onKeyDown={this.handleKeyDown}
          />
        </div>
      </th>
    );
  }
}

StringFilterHeaderCell.propTypes = {
  setFilter: PropTypes.func.isRequired,
  value: PropTypes.string,
  columnName: PropTypes.string,
}

StringFilterHeaderCell.defaultProps = {
  setFilter: () => {},
  value: '',
  columnName: '',
}