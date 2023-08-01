import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LANG from '../../../language';

class Loading extends Component {
  render() {
    const { title } = this.props;
    return (
      <div className="component-loading">
        <i className="fa fa-spinner fa-pulse" />{title}
      </div>
    );
  }
}

Loading.propTypes = {
  title: PropTypes.string.isRequired,
};

Loading.defaultProps = {
  title: LANG('COMP_LOADING_DEFAULT')
};

export default Loading;
