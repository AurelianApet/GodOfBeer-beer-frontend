import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

class ScrollToTop extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return (
      <Fragment>
        {this.props.children}
      </Fragment>
    );
  }
}


ScrollToTop.propTypes = {
  location: PropTypes.object.isRequired,
  children: PropTypes.any,
};

ScrollToTop.defaultProps = {
  children: null,
};

export default withRouter(ScrollToTop);

