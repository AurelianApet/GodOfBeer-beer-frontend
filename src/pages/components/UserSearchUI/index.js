import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class UserSearchUI extends Component {
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
		return (
            <div className="searchbox searchbox-margin">
                <div className="row">
                    <div className="navbar-search-menu">
                        <fieldset><input id="search-icon" type="search" placeholder="Search.." className = "searchicon" />
                        <button id="searchBtn"><i className="fa fa-search"></i></button></fieldset>
                    </div>
                </div>
            </div>
		);
	}
}

UserSearchUI.propTypes = {
};

UserSearchUI.defaultProps = {
};

export default withRouter(UserSearchUI);