import React, { Component }     from 'react';
import { compose }              from 'redux';
import { connect }              from 'react-redux';

import LeftSideBar				from './LeftSideBar';
import MainContent				from './MainContent';
import PathBar					from './PathBar';
import SearchBar				from './SearchBar';

class TreeView extends Component {
	constructor(props) {
		super(props);
		this.state = {
            
		};
	}

	componentDidMount() {
	}

	componentWillUnmount() {
	}
	
	/** render functions */
	render() {
		return (
			<div className="container-page-treeview">
				<div className="container-up">
					<PathBar />
					<SearchBar />
				</div>
				<div className="container-down">
					<LeftSideBar />
					<MainContent />
				</div>
				
			</div>
		);
	}
}

export default compose(
	connect(
		state => ({
			user: state.auth.user,
			groups: state.auth.groups,
		})
	)
)(TreeView);