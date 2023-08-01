import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import _ from 'lodash';
import {compose} from "redux";
import {connect} from "react-redux";
import {setSearchWord} from "../../../library/redux/actions/seach";
import {ParentRoute} from "../../App";

class BeerDashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchWord: ''
		};
	}

	componentDidMount() {

	}

	componentWillReceiveProps(nextProps, nextContext) {

	}

	handleChangeSearchInputer = ( e ) => {
		if ( !e ) {
			return;
		}
		this.setState({searchWord: e.target.value});
	};

	handleSearchInputKeyDown = ( e ) => {
		if ( !e ) return;
		if ( e.key === 'Enter' ) {
			this.props.setSearchWord({searchWord: this.state.searchWord});
			this.props.history.push('/search');
		}
		else if ( e.key === 'Escape' ) {
			this.setState({searchWord: ''});
		}
	};

	render() {
		const { sSlides, sTextPosition } = this.state;
		return (
			<section className ="main">
				<div className="search-container">
					<div className="logo-search-menu">
						<div className="logo-box">
							<img src="/assets/new_images/logo_white.png" alt="logo" height="80px"/>
						</div>
						<div className="input-box">
							<i className="fa fa-search" />
							<input type="text" className="form-control" placeholder="Beer, Brewery 또는 매장검색"
								   onChange={this.handleChangeSearchInputer}
								   onKeyDown={this.handleSearchInputKeyDown}/>
						</div>
						<div className="menu-box">

							<Link to="/common/beers">
								<div className="menu-item">
									<div className="icon-box">
										<img src="/assets/new_images/search_beer_icon.png" height="30px"/>
									</div>
									<p>Beer</p>
								</div>
							</Link>

							<Link to="/common/brewerys">
								<div className="menu-item">
									<div className="icon-box">
										<img src="/assets/new_images/search_brewery_icon.png" height="30px"/>
									</div>
									<p>Brewery</p>
								</div>
							</Link>

							<Link to="/common/pubs">
								<div className="menu-item">
									<div className="icon-box">
										<img src="/assets/new_images/search_pub_icon.png" height="30px"/>
									</div>
									<p>PUB</p>
								</div>
							</Link>

						</div>
					</div>
				</div>
			</section>
			
		);
	}
}

BeerDashboard.propTypes = {
};

BeerDashboard.defaultProps = {
};

export default compose(
	withRouter,
	connect(
		state => ({
			searchWord: state.search.searchWord,
		}),
		{
			setSearchWord
		}
	)
)(BeerDashboard);