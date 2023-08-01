import React, { Component }     from 'react';


class PathBar extends Component {
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
			<div className="container-pathbar">
				<input type="text" id="path" name="path" ></input>
			</div>
		);
	}
}

export default PathBar;