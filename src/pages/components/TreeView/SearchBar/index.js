import React, { Component }     from 'react';


class SearchBar extends Component {
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
			<div className="container-searchbar">
				<input type="text" id="path" name="path" placeholder="Search..."></input>
			</div>
		);
	}
}

export default SearchBar;