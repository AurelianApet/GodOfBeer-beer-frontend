import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import $ from 'jquery';

import SingleMessage from '../SingleMessage';

import {SVNVERSION} from '../../../version';
import LANG from '../../../language';

export class Footer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sIsSingleMessageVisible: false,
            sSingleMessagePosition: {left: 0, top: 0},
        };
    }

    handleSingleMessageClose = () => {
        this.setState({
            sIsSingleMessageVisible: false,
        })
    }

    handleToAdminClick = (e) => {
        e.stopPropagation();
        let position = {left: 0, top: 0};
        if ($('.footer-teaching-admin').offset()) {
            position.left = $('.footer-teaching-admin').offset().left;
            position.top = $('.footer-teaching-admin').offset().top - 10;
        }
        this.setState({
            sIsSingleMessageVisible: true,
            sSingleMessagePosition: position,
        });
    };

    render() {
        const {auth: {admin}} = this.props;
        const {sIsSingleMessageVisible, sSingleMessagePosition} = this.state;
        return (
            <div className="main-footer">
                {LANG('COMP_FOOTER')} ({SVNVERSION})
                {admin && sIsSingleMessageVisible &&
                <SingleMessage
                    pUser={{...admin, uid: admin._id}}
                    pOffset={sSingleMessagePosition}
                    pDirection="tl"
                    pHandleMessageClose={this.handleSingleMessageClose}
                />
                }
                <div
                    className="footer-teaching-admin"
                    onClick={this.handleToAdminClick}
                >
                    {LANG('COMP_HEADER_MENU_TOMANAGER')}
                </div>
            </div>
        );
    }
}

Footer.propTypes = {
    location: PropTypes.object.isRequired,
};

Footer.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            auth: state.auth,
        }),
        {}
    )
)(Footer);

