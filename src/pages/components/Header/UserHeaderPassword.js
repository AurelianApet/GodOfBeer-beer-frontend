import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import PropTypes from 'prop-types';

import { signOut } from '../../../library/redux/actions/auth';

class UserHeaderPassword extends Component {
	constructor(props) {
		super(props)
		this.state = {
			
		};
	}

	componentDidMount() {
	}

	/**
	 * handle functinos
	 **/
	handleLogOut = (e) => {
		localStorage.setItem('token', null);
		e.preventDefault();
		e.stopPropagation();
		this.props.signOut();
		window.location='/';
	}

	/**
	 * process functions
	 **/



	/**
	 * other functions
	 **/



	/**
	 * render functions
	 **/

	render() {
		const userName = _.get( this.props, 'user.realName' ) || '';
		return (
			<header className="container-page-main-header">
				<div className="header-container usermode">
					<a href = "/" className = "logo">
						<img alt="" src="/assets/images/header/logo_main.png" />
					</a>
					<nav className="navbar navbar-static-top">
						<div className = "navbar-custom-menu">
							<ul className="nav navbar-nav">
								<li>
									<span>{`${userName} 님`}</span>
								</li>
								<li id="borderclass"></li>
								<li>
									<i className = 'fa fa-bell bell-cursor'></i>
								</li>
								<li className = "logout">
									<a onClick={this.handleLogOut}>로그아웃</a>
								</li>
							</ul>
						</div>
						
					</nav>
				</div>
			</header>
		);
	}
}

UserHeaderPassword.propTypes = {
	signOut: PropTypes.func.isRequired,
};

UserHeaderPassword.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
		}),
		{
			signOut
		}
  )
)(UserHeaderPassword);