import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {withRouter, Link} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import cn from 'classnames';
import {motion, AnimatePresence} from 'framer-motion';

import commonMenu from '../../CommonMenu';

import {signOut} from '../../../library/redux/actions/auth';

import ModalLogin from './ModalLogin';
import ModalID from './ModalID';
import ModalPassword from './ModalPassword';
import ModalRegisterManager from './ModalRegisterManager';
import {setSearchWord} from "../../../library/redux/actions/seach";

export const MODAL_NONE = 0;
export const MODAL_LOGIN = 1;
export const MODAL_ID = 2;
export const MODAL_PASSWORD = 3;
export const MODAL_REGISTER_USER = 4;
export const MODAL_REGISTER_MANAGER = 5;
export const MODAL_AGREEMENT = 6;


export class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sIsModalLogin: false,
            sIsModalID: false,
            sIsModalPassword: false,
            sIsModalRegisterUser: false,
            sIsModalRegisterManager: false,
            sIsModalAgreement: false,
            sModalType: 0,
            sUser: null,
            sIsOpenSideMenu: false,
            sIsMobileDimension: props.isMobileDimension,
            sIsShowSideSubMenu: false,
            sSearchWord: props.searchWord
        }
    }

    componentDidMount() {
        this.setState({
            sUser: this.props.user || null,
        });
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            sUser: newProps.user || null,
            sIsMobileDimension: newProps.isMobileDimension,
            sSearchWord: newProps.searchWord
        });

        console.log(newProps.user);
    }

    // handle function
    handleModal = (modalType, visible, nextModalType) => {
        let isModalLogin = false;
        let isModalID = false;
        let isModalPassword = false;
        let isModalRegisterUser = false;
        let isModalRegisterManager = false;
        let isModalAgreement = false;
        switch (modalType) {
            case MODAL_LOGIN:
                isModalLogin = visible;
                break;
            case MODAL_ID:
                isModalID = visible;
                break;
            case MODAL_PASSWORD:
                isModalPassword = visible;
                break;
            case MODAL_REGISTER_USER:
                isModalRegisterUser = visible;
                break;
            case MODAL_REGISTER_MANAGER:
                isModalRegisterManager = visible;
                break;
            case MODAL_AGREEMENT:
                isModalAgreement = visible;
                break;
            default:
                break;
        }
        this.setState({
            sIsModalLogin: isModalLogin,
            sIsModalID: isModalID,
            sIsModalPassword: isModalPassword,
            sIsModalRegisterUser: isModalRegisterUser,
            sIsModalRegisterManager: isModalRegisterManager,
            sIsModalAgreement: isModalAgreement,
            sModalType: nextModalType
        });
    };

    handleClickMenu = (aItem) => {
        if (aItem.onClick) {
            const role = _.map(this.props, 'user.role') || '';
            aItem.onClick(role);
        } else {
            const url = aItem.url || '';
            this.props.history.push(url);
        }
        this.setState({
            sIsOpenSideMenu: false,
        })
    };

    handleLogOut = (e) => {
        localStorage.setItem('token', null);
        e.preventDefault();
        e.stopPropagation();
        this.props.pHandleLogOut();
        this.props.signOut();
        this.setState({
            sIsOpenSideMenu: false,
        })
    };

    handleClickLogo = () => {
        this.props.history.push('/');
    };

    handleClickLogin = () => {
        this.setState({
            sIsModalLogin: true,
            sIsOpenSideMenu: false,
        });
    };

    handleClickRegister = () => {
        this.setState({
            sIsModalRegisterManager: true,
            sIsOpenSideMenu: false,
        })
    };

    handleShowSideMenu = () => {
        this.setState({
            sIsOpenSideMenu: true,
        })
    };

    handleSideAction = (aSort) => {
        if (aSort === 'closemenu') {
            this.setState({
                sIsOpenSideMenu: false,
            })
        }
    };

    handleToggleSideSubMenu = () => {
        this.setState(prev => ({
            sIsShowSideSubMenu: !prev.sIsShowSideSubMenu,
        }))
    };

    handleLeftButton = (value, e) => {
        const childs = value.childs || [];
        const url = childs.length > 0 ? childs[0].url : value.url;
        if (value.title) {
            this.props.history.push(url);
        }
        this.setState({
            sIsOpenSideMenu: false,
        })
    };

    // render function
    renderSideMenu = () => {
        const {sIsOpenSideMenu, sUser, sIsShowSideSubMenu} = this.state;
        const mainVariants = {
            before: {
                x: "-100%"
            },
            in: {
                x: 0,
            },
            out: {
                x: "-100%"
            }
        };
        const bgVariants = {
            before: {
                opacity: 0,
            },
            in: {
                opacity: 0.7,
            },
            out: {
                opacity: 0,
            }
        };
        const pageTransition = {
            type: 'spring',
            duration: 0.5,
            damping: 80,
            stiffness: 570
        };
        const menus = _.get(this.props, 'menus.main') || [];
        const menuItemPadding = '15px 10px';
        return (
            <AnimatePresence>
                {sIsOpenSideMenu && (
                    <motion.div className='allmenu' key='sidemenu' initial='before' animate='in' exit='out'
                                variants={mainVariants} transition={pageTransition}>
                        <div className='close-sidemenu' onClick={this.handleSideAction.bind(this, 'closemenu')}>
                            <i className='fa fa-close'/>
                        </div>
                        <div className='menu-container mobile-left-sidebar'>
                            {sUser ?
                                <div className='authenticated-user-panel-sidemenu'>
                                    <div className='user-name'
                                         style={{padding: menuItemPadding}}>{`${_.get(sUser, 'realName') || ''} 님`}</div>
                                    <div className='logout' style={{padding: menuItemPadding}}
                                         onClick={this.handleLogOut}>로그아웃
                                    </div>
                                </div>
                                :
                                <div className='unauthenticated-user-panel-sidemenu'>
                                    <div className='login-button' style={{padding: menuItemPadding}}
                                         onClick={this.handleClickLogin}>로그인
                                    </div>
                                    <div className='register-button' style={{padding: menuItemPadding}}
                                         onClick={this.handleClickRegister}>회원가입
                                    </div>
                                </div>
                            }
                            <div className='common-menus'>
                                {_.map(commonMenu, (menuItem, menuIndex) => {
                                    return (
                                        <div
                                            key={menuIndex}
                                            className='nav-item'
                                            style={{padding: menuItemPadding}}
                                            onClick={this.handleClickMenu.bind(this, menuItem)}
                                        >
                                            {menuItem.title}
                                        </div>
                                    )
                                })}
                            </div>
                            {menus.length > 0 &&
                            <div className='my-menus'>
                                <div className='nav-item' style={{padding: menuItemPadding}}
                                     onClick={this.handleToggleSideSubMenu}>마이페이지 <i
                                    className={cn('fa fa-chevron-up', sIsShowSideSubMenu ? 'icon-down' : 'icon-up')}/>
                                </div>
                                {sIsShowSideSubMenu &&
                                <div className='side-sub-menus'>
                                    {_.map(menus, (value, index) => {
                                        return (
                                            <div key={index} style={{padding: menuItemPadding}}
                                                 onClick={this.handleLeftButton.bind(this, value)}>{value.title}</div>
                                        )
                                    })}
                                </div>
                                }
                            </div>
                            }
                        </div>
                    </motion.div>
                )}
                {sIsOpenSideMenu && (
                    <motion.div className='allmenu_bg' initial='before' animate='in' exit='out' variants={bgVariants}
                                transition={pageTransition}/>)}
            </AnimatePresence>

        )
    };

    handleChangeSearchInputer = (e) => {
        if (!e) {
            return;
        }
        this.setState({sSearchWord: e.target.value});
    };

    handleClickStoreName = () => {
        console.log(this.props.user);
        if (this.props.user.role === 'ROLE_ADMIN') {
            this.props.history.push('/admin/myinfo');
        } else {
            this.props.history.push('/user/info');
        }
    };

    handleSearchInputKeyDown = (e) => {
        if (!e) return;
        if (e.key === 'Enter') {
            this.props.setSearchWord({searchWord: this.state.sSearchWord});
        }
    };

    render() {
        const {pHandleLoginSuccessed, location: {pathname}} = this.props;
        const {sIsModalLogin, sIsModalRegisterManager, sUser, sIsModalID, sIsModalPassword, sIsMobileDimension, sSearchWord} = this.state;
        const style = pathname !== '/' ? {color: '#000'} : {};
        return (
            <div
                className={cn(sUser ? 'headerContainer-authenticated' : '', 'headerContainer', sIsMobileDimension && 'headerContainer-mobile', pathname === '/' && 'home-header')}>
                {
                    sIsMobileDimension && pathname.indexOf('mobile/order/info') < 0 &&
                    <div className='side-menu-button' onClick={this.handleShowSideMenu}>
                        <i className='fa fa-bars'/>
                    </div>
                }
                <div className="main-container">
                    {
                        pathname !== '/' && !sIsMobileDimension &&
                        <div className='logo' onClick={this.handleClickLogo}>
                            <img src="/assets/new_images/logo_header.png"/>
                        </div>
                    }

                    {
                        pathname !== '/' && sIsMobileDimension &&
                        <div className='logo' onClick={this.handleClickLogo}>
                            <img src="/assets/new_images/logo_white.png"/>
                        </div>
                    }

                    {
                        !sIsMobileDimension && pathname !== '/' &&
                        <div className="menu-container">
                            <div className="search-container">
                                <input type="text" defaultValue={sSearchWord} className="form-control"
                                       onChange={this.handleChangeSearchInputer}
                                       onKeyDown={this.handleSearchInputKeyDown}/>
                            </div>

                            <div className="center-menu">
                                <Link to={'/common/beers'}>Beer</Link>
                                <Link to={'/common/brewerys'}>Brewery</Link>
                                <Link to={'/common/pubs'}>Pub</Link>
                            </div>

                            <div className="right-menu">
                                {sUser ?
                                    <div className='authenticated-user-panel'>
                                        <div className='user-name' style={style} onClick={this.handleClickStoreName}>{_.get(sUser, 'storeName') ? _.get(sUser, 'storeName') : _.get(sUser, 'realName')}</div>
                                        <div className='logout' style={style} onClick={this.handleLogOut}>로그아웃</div>
                                    </div>
                                    :
                                    <div className='unauthenticated-user-panel'>
                                        <div className='login-button' style={style} onClick={this.handleClickLogin}>로그인</div>
                                        <div className='register-button' style={style} onClick={this.handleClickRegister}>회원가입</div>
                                    </div>
                                }
                            </div>
                        </div>
                    }

                    {
                        !sIsMobileDimension && pathname === '/' &&
                        <div className='navigation' id='navigation'>
                            {sUser ?
                                <div className='authenticated-user-panel'>
                                    <div className='user-name' style={style} onClick={this.handleClickStoreName}>{_.get(sUser, 'storeName') ? _.get(sUser, 'storeName') : _.get(sUser, 'realName')}</div>
                                    <div className='logout' style={style} onClick={this.handleLogOut}>로그아웃</div>
                                </div>
                                :
                                <div className='unauthenticated-user-panel'>
                                    <div className='login-button' style={style} onClick={this.handleClickLogin}>로그인</div>
                                    <div className='register-button' style={style} onClick={this.handleClickRegister}>회원가입</div>
                                </div>
                            }
                        </div>
                    }
                    {sIsModalLogin &&
                    <ModalLogin
                        handleModal={this.handleModal}
                        pHandleLoginSuccessed={pHandleLoginSuccessed}
                    />
                    }
                    {sIsModalRegisterManager &&
                    <ModalRegisterManager
                        handleModal={this.handleModal}
                    />
                    }
                    {sIsModalID &&
                    <ModalID
                        handleModal={this.handleModal}
                    />
                    }
                    {sIsModalPassword &&
                    <ModalPassword
                        handleModal={this.handleModal}
                    />
                    }
                    {this.renderSideMenu()}
                </div>
            </div>
        );
    }
}

Header.propTypes = {
    signOut: PropTypes.func.isRequired,
    pHandleLoginSuccessed: PropTypes.func,
    pHandleLogOut: PropTypes.func,
};

Header.defaultProps = {
    pHandleLoginSuccessed: () => {
    },
    pHandleLogOut: () => {
    },
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
            menus: state.auth.menus,
            searchWord: state.search.searchWord
        }),
        {
            signOut,
            setSearchWord
        }
    )
)(Header);
