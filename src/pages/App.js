import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import cn from 'classnames';
import _ from 'lodash';
import {
    Redirect,
    Switch,
    withRouter,
} from 'react-router-dom';
import IdleTimer from 'react-idle-timer';
import NotificationSystem from 'react-notification-system';

import {routes} from './route';
import {Header, UserHeaderPassword} from './components/Header';
import {Shortcut} from './components/Shortcut';
import {Footer2, FooterBeer, Footer3} from './components/Footer';
import {signOut, loginWithToken} from '../library/redux/actions/auth';
import {appConfig} from '../appConfig';
import UserLeftSide from './components/UserLeftSide';
import UserRightContent from './components/UserRightContent';

import '../assets/styles/App.scss';

global.notificationSystem = null;

const FIRST_URL = {
    ROLE_ADMIN: '/admin/mypage/registerstatus',
    ROLE_SUB_ADMIN: '/admin/mypage/registerstatus',
    ROLE_USER: '/user/myinfo',
    ROLE_PROVIDER: '/user/myinfo',
    ROLE_SELLER: '/user/myinfo',
    ROLE_PUB_MANAGER: '/user/myinfo',
};

export class ParentRoute extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sStartPageUrl: '',
            sRole: '',
            sIsMobileDimension: null,
        };
        this.idleTimer = null;
        this.prevPathname = '';
    }

    // eslint-disable-next-line
    onIdle = (e) => {
        localStorage.getItem('token') && this.props.signOut();
    };

    componentWillMount() {
        this.updateDimensions();
    }

    componentDidMount() {
        this.updateDimensions();
        // if (appConfig.isDev) {
        //   // restore token
        //   if(localStorage.getItem('token')) {
        //     this.props.loginWithToken({
        //       success: (res) => {
        //         localStorage.setItem('token', res.token);
        //         const role = _.get( res, 'user.role' ) || '';
        //         const startPageURL = FIRST_URL[role] || '';
        //         this.setState({
        //           sStartPageUrl: startPageURL,
        //           sRole: role,
        //         });
        //       },
        //       fail: (res) => {
        //          processErrorResponse(res, this.props.history, true);
        //       }
        //     });
        //   }
        // } else {
        //   this.props.signOut();
        // }
        if (localStorage.getItem('token')) {
            this.props.loginWithToken({
                success: (res) => {
                    localStorage.setItem('token', res.token);
                    const role = _.get(res, 'user.role') || '';
                    const startPageURL = FIRST_URL[role] || '';
                    this.setState({
                        sStartPageUrl: startPageURL,
                        sRole: role,
                    });
                },
                fail: (res) => {
                    // processErrorResponse(res, this.props.history, true);
                    this.props.signOut();
                }
            });
        }
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions)
    }

    updateDimensions = () => {
        const {sIsMobileDimension} = this.state;
        const rootElement = window.getElementFromId('root');
        const width = rootElement[0].clientWidth;
        const isMobileDimension = width < 1080;
        if (sIsMobileDimension !== isMobileDimension) {
            this.setState({
                sIsMobileDimension: isMobileDimension,
            })
        }
    };

    handleLoginSuccessed = (aRole) => {
        const startPageURL = FIRST_URL[aRole] || '';
        this.setState({
            sStartPageUrl: startPageURL,
            sRole: aRole,
        });
        this.props.history.push(startPageURL);
    };

    handleLogOut = () => {
        this.setState({
            sRole: '',
            sStartPageUrl: '/',
        }, () => {
            this.props.history.push('/');
        })
    };

    renderHeader = () => {
        const {location: {pathname}} = this.props;
        const {sIsMobileDimension} = this.state;
        let header = <div/>;

        switch (pathname) {
            case '/':
                header = <Header
                    pHandleLoginSuccessed={this.handleLoginSuccessed}
                    isMobileDimension={sIsMobileDimension}
                />;
                break;
            case '/login':
            case '/register':
                header = null;
                break;
            case '/user/mypage/userPassword':
                header = <UserHeaderPassword isMobileDimension={sIsMobileDimension}/>;
                break;
            default:
                header = <Header
                    pHandleLogOut={this.handleLogOut}
                    isMobileDimension={sIsMobileDimension}
                />
        }

        return header;
    };

    renderLeftSideBar = () => {
        const {sIsMobileDimension} = this.state;
        if (sIsMobileDimension || sIsMobileDimension === null) {
            return null;
        }
        const {location: {pathname}} = this.props;
        let sidebar = <div style={{width: '270px'}}/>;
        switch (pathname) {
            case '/login':
            case '/register':
            case '/':
            case '/search':
                break;
            default:
                sidebar = <UserLeftSide/>;
        }
        return sidebar;
    };

    renderRightContent = () => {
        const {sIsMobileDimension} = this.state;
        if (sIsMobileDimension || sIsMobileDimension === null) {
            return null;
        }
        const {location: {pathname}} = this.props;
        let content = <div/>;
        switch (pathname) {
            case '/user/mypage/userPassword':
            case '/user/mypage/userModify':
            case '/':
                content = null;
                break;
            case '/login':
            case '/register':
            default:
                const role = _.get(this.props, 'auth.user.role') || '';
                content = role === 'ROLE_USER' || role === 'ROLE_SELLER' ? <UserRightContent/> : null;
        }
        return content;
    };

    renderFooter = () => {
        const {location: {pathname}} = this.props;
        let footer = <div/>;

        switch (pathname) {
            case '/login':
            case '/register':
                footer = <Footer2/>;
                break;
            case '/':
            case '/mobile/order/info':
                // footer = <FooterBeer/>
                break;
            case '/socialnet/chatting':
            case '/managementusers':
                footer = null;
                break;
            default:
                footer = <Footer3/>;
        }

        return footer;
    };

    renderShortcut = () => {
        const {location: {pathname}} = this.props;
        let shortcut = <div/>;

        switch (pathname) {
            case '/':
            case '/login':
            case '/register':
                shortcut = null;
                break;
            default:
                shortcut = <Shortcut/>;
        }

        return shortcut;
    };

    render() {
        const {location: {pathname}} = this.props;
        const {sStartPageUrl, sRole, sIsMobileDimension} = this.state;
        const role = _.get(this.props, 'auth.user.role') || '';
        let hasRightSideBar = role === 'ROLE_USER' || role === 'ROLE_SELLER';
        this.prevPathname = pathname;
        if (pathname === '/user/mypage/userPassword' || pathname === '/user/mypage/userModify') {
            hasRightSideBar = false;
        }
        return (
            <IdleTimer
                ref={(ref) => {
                    this.idleTimer = ref;
                }}
                element={document}
                onActive={this.onActive}
                onIdle={this.onIdle}
                timeout={1000 * 60 * 60} // 1 hour
            >
                <div className={cn("App bg-light", sIsMobileDimension && "mobile")}>
                    <NotificationSystem ref={(item) => {
                        global.notificationSystem = item;
                    }}/>
                    {this.renderHeader()}
                    <div className={cn('container-body', pathname !== '/' && 'container-body-authenticated')}>
                        <div
                            className={cn('container-page-beer-body')}>
                            {role && pathname !== '/' && this.renderLeftSideBar()}
                            <Switch>
                                {routes.map((route, index) => (
                                    <route.wrapper
                                        component={route.component}
                                        key={index}
                                        title={route.title}
                                        path={route.pathname}
                                        baseUrl={route.baseUrl}
                                        exact={route.exact || false}
                                        auth={this.props.auth}
                                        fullscreen={route.fullscreen}
                                        role={sRole}
                                        hasSubMenu={route.hasSubMenu}
                                        handleLogOut={this.handleLogOut}
                                        isMobileDimension={sIsMobileDimension}
                                    />))
                                }
                                <Redirect to={sStartPageUrl || appConfig.startPageURL || '/'}/>
                            </Switch>
                            {/*{role && this.renderRightContent()}*/}
                        </div>
                    </div>
                    {this.renderFooter()}
                </div>
            </IdleTimer>
        );
    }
}

ParentRoute.propTypes = {
    signOut: PropTypes.func.isRequired,
    loginWithToken: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
};

export default compose(
    withRouter,
    connect(
        state => ({
            auth: state.auth,
        }),
        {
            signOut,
            loginWithToken,
        }
    )
)(ParentRoute);
