import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {executeQuery} from "../../../../library/utils/fetch";
import _ from "lodash";
import {NOTIFICATION_TYPE_ERROR, pushNotification} from "../../../../library/utils/notification";

const TYPE_LICENSE = 'license';
const TYPE_PRIVACY = 'privacy';
const TYPE_PERSONAL = 'personal';

export class CommonPrivacy extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sPrivacy: {},
        }
    }

    componentDidMount () {
        this.getLicenseInfo();
    }


    getLicenseInfo = () => {
        executeQuery({
            method: 'get',
            url: '/license/fetchall',
            success: ( res ) => {
                const result = _.get(res, 'docs') || [];
                _.map( result, item => {
                    if (item.type === TYPE_PERSONAL) {
                        this.setState({
                            sPrivacy: item,
                        })
                    }
                })
            },
            fail: ( err ) => {
                const errResult = _.get(err, 'data.error');
                if (errResult) {
                    pushNotification(NOTIFICATION_TYPE_ERROR, errResult);
                }
            }
        })
    };

    getLicenceContent = ( aContent ) => {
        return aContent.replace(/\n/g, "<br>");
    };

    render() {
        const {sPrivacy} = this.state;
        return (
            <div className="main-privacy">
                <h3>개인정보처리방침</h3>
                <div
                    style={{overflowWrap: 'break-word'}}
                    dangerouslySetInnerHTML={{ __html: this.getLicenceContent(sPrivacy.content || '')}}
                />
            </div>
        );
    }
}

CommonPrivacy.propTypes = {
    location: PropTypes.object.isRequired,
};

CommonPrivacy.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            auth: state.auth,
        }),
        {}
    )
)(CommonPrivacy);

