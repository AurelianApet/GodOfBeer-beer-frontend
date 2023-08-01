import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import QRCodeRegisterComponent from './QRCodeRegisterComponent';

class QRCodeRegister extends Component {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    const userId = _.get( this.props, 'user._id' ) || '';
    return (
      <QRCodeRegisterComponent
        id={userId}
      />
    );
  }
}

QRCodeRegister.propTypes = {
};

QRCodeRegister.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(QRCodeRegister);