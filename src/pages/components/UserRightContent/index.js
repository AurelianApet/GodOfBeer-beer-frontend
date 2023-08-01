import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

class UserRightContent extends Component {
	constructor(props) {
		super(props)
		this.state = {
			sRightContent : [
            ]
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
        const { sRightContent } = this.state;
		return (
			<div className="container-page-userrightcontent">
				<div id="r-content" className="commonBorder">
                    <div className="contents2">
                        <div className="content2-1">
                            <p>추천 맥주</p>
                        </div>
                        {
                            _.map (sRightContent, (content, index) => {
                                return (
                                    <div key = {index} className="content2-2-1 flex margin-top">
                                        <div className="content-img">
                                            <img alt="None" src={content.src}/>
                                        </div>
                                        <div className="content-text2">
                                            <p>{content.title}</p>
                                        </div>
                                    </div>
                                )
                                
                            })
                        }
                    </div>
                </div>
                <div id="r2-content" className="r-content secondcontents">
                </div>
			</div>
		);
	}
}

UserRightContent.propTypes = {
};

UserRightContent.defaultProps = {
};

export default withRouter(UserRightContent);