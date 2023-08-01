import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {withRouter, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import $ from 'jquery';

import SingleMessage from '../SingleMessage';

import {SVNVERSION} from '../../../version';
import LANG from '../../../language';
import {executeQuery} from "../../../library/utils/fetch";
import _ from "lodash";
import {NOTIFICATION_TYPE_ERROR, pushNotification} from "../../../library/utils/notification";
import { setCopyright } from '../../../library/redux/actions/seach';

export class Footer3 extends Component {
    constructor(props) {
        super(props);
        this.getCopyRight();
    }

    componentDidMount = () => {
    };

    getCopyRight = () => {
        executeQuery({
            method: 'get',
            url: '/license/copyright',
            success: (res) => {
                let copyright = res.copyright || '';
                this.props.setCopyright({copyright: copyright});
            },
            fail: (err, res) => {
            }
        });
    }

    render() {
        const {copyright} = this.props;
        console.log(this.props);
        return (
            <div className="main-footer3">
                <div className="footer-container">
                    <div className={'text-right'}>
                        <Link to={'/license'}>이용약관</Link>
                        <Link to={'/privacy'}>개인정보처리방침</Link>
                    </div>
                    <div className={'text-center'}>
                        { copyright }
                    </div>
                </div>
            </div>
        );
    }
}

Footer3.propTypes = {
    location: PropTypes.object.isRequired,
};

Footer3.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            copyright: state.search.copyright,
        }),
        {
            setCopyright
        }
    )
)(Footer3);

