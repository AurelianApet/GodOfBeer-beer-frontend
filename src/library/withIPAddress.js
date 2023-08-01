import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { getIPAddress } from './redux/actions/workflow';

export default function withIPAddress(WrappedComponent) {
  const HOC = class extends Component {
    static propTypes = {
      // getIPAddress: PropTypes.func.isRequired,
      location: PropTypes.object.isRequired,
    };

    state = {
      ipAddress: null,
    };
    
    componentWillReceiveProps(nextProps) {
      const currentPage = this.props.location.pathname;
      const nextPage = nextProps.location.pathname;

      if (currentPage !== nextPage) {
      }
    }

    render() {
      return <WrappedComponent {...this.props} ipAddress={this.state.ipAddress || ''} />;
    }
  };

  return connect(null, { })(HOC);
}

