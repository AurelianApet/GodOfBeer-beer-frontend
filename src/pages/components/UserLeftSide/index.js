import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import cn from 'classnames';

class UserLeftSide extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sUserType: 'normal_user',
            sStyle: 'leftsideButton secondcontentsbtn',
            sUserInfo: props.user || {},
        };
    }

    componentDidMount() {
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            sUserInfo: newProps.user || {},
        })
    }

    handleLeftButton = (value, e) => {
        const childs = value.childs || [];
        const url = childs.length > 0 ? childs[0].url : value.url;
        if (value.title) {
            this.props.history.push(url);
        }
    }

    render() {
        const {sStyle, sUserInfo} = this.state;
        const menus = _.get(this.props, 'menus.main') || [];
        const userName = sUserInfo.realName || '';
        const userImage = sUserInfo.image || '';
        const {location: {pathname}} = this.props;

        return (
            <div className="container-page-userleftside">
                <div className="l-content">
                    <aside>
                        <div className="l-content">
                            {
                                _.map(menus, (value, index) => {
                                    let childs = value.childs || [];
                                    let url = childs.length > 0 ? childs[0].url : value.url;

                                    return (
                                        <button key={index} className={cn(sStyle, pathname === url && 'active-menu')}
                                                onClick={this.handleLeftButton.bind(this, value)}>{value.title}</button>
                                    )
                                })
                            }
                        </div>
                    </aside>
                </div>
            </div>
        );
    }
}

UserLeftSide.propTypes = {};

UserLeftSide.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            menus: state.auth.menus,
        }),
    )
)(UserLeftSide);