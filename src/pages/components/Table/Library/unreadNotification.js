import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { getAPINotifications, hasNewNotification, readOneNotification } from '../../../../library/utils/apiNotification';
import { deleteOneNotifyList } from '../../../../library/redux/actions/notification';
import { removeItemFromArray } from '../../../../library/utils/array';

class UnreadNotification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sUnreadRows: [],
    }
  }

  componentDidMount() {
    if (this.props.onRef) {
			this.props.onRef(this);
    }
    this.updateIfChanged(this.props, false);
  }

  componentWillUnmount() {
    if (this.props.onRef) {
			this.props.onRef(undefined);
    }
  }

  componentWillReceiveProps(newProps) {
    // process notification
    this.updateIfChanged(newProps, true);
  }

  pReadOneNotification = (primaryKey) => {
    readOneNotification(primaryKey, this.props.notificationID, this.props.deleteOneNotifyList);
    this.props.updateUnreadRows(removeItemFromArray(this.state.sUnreadRows, primaryKey), false);
  }

  updateIfChanged = (props, isUpdated) => {
    const { sUnreadRows } = this.state;
    const { notificationID, updateUnreadRows } = this.props;
    const unreadRows = getAPINotifications(props, notificationID);
    if (hasNewNotification(props, this.props.notificationID, sUnreadRows)) {
      updateUnreadRows(unreadRows, isUpdated);
    }
    this.setState({ sUnreadRows: unreadRows });
  }

  render() {
    return (<div style={{display: 'none'}}>
      UnreadNotification
    </div>);
  }
}

UnreadNotification.propTypes = {
  onRef: PropTypes.func.isRequired,
  updateUnreadRows: PropTypes.func.isRequired,
  notificationID: PropTypes.string,
};

UnreadNotification.defaultProps = {
  notificationID: ''
};

export default compose(
  connect(
    state => ({
      notifications: state.notification.notifications,
    }),
    {
      deleteOneNotifyList,
    }
  )
)(UnreadNotification);