import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

class BeerMenu extends Component {
	constructor(props) {
		super(props)
		this.state = {
			sContent: [],
		};
	}

	componentDidMount() {
		this.setMenuContents( this.props );
	}

	componentWillReceiveProps( newProps ) {
		if ( !_.isEqual( this.props, newProps.pBaseUrl ) ) {
			this.setMenuContents( newProps );
		}
	}

	setMenuContents = ( aProps ) => {
		const { pBaseUrl, menu } = aProps;
		let content = [];
		const menuFromBackend = _.get( menu, 'main' ) || [];
		_.map( menuFromBackend, ( menuItem, menuIndex ) => {
			if ( menuItem.baseurl === pBaseUrl ) {
				content = menuItem.childs || [];
			}
		});
		this.setState({
			sContent: content,
		})
	}

	/**
	 * handle functinos
	 **/
	handleClick = (url, e) => {
		this.props.history.push(url);
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
		const { sContent } = this.state;
		return sContent.length === 0?
			null
		:
		(
			<div className="container-beer-menu">
					<div className="div-flex">
							<div className = "navigation">
							{
									_.map(sContent, (value, index) => {
											return (<div key={index} className = "nav-items" onClick = {this.handleClick.bind(this, value.url)}>{value.title}</div>)
									})
							}
							</div>
					</div>
			</div>
		);
	}
}

BeerMenu.propTypes = {
};

BeerMenu.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
			user: state.auth.user,
			menu:state.auth.menus,
    }),
  )
)(BeerMenu);