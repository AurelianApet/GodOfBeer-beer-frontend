import React, { Component }         from 'react';
import PropTypes                    from 'prop-types';

import ModalLogin                   from './ModalLogin';
import ModalID                      from './ModalID';
import ModalPassword                from './ModalPassword';
import ModalRegisterUser            from './ModalRegisterUser';
import ModalRegisterManager         from './ModalRegisterManager';
import ModalAgreement               from './ModalAgreement';

export const MODAL_NONE = 0;
export const MODAL_LOGIN = 1;
export const MODAL_ID = 2;
export const MODAL_PASSWORD = 3;
export const MODAL_REGISTER_USER = 4;
export const MODAL_REGISTER_MANAGER = 5;
export const MODAL_AGREEMENT = 6;


export class HeaderBeer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sIsModalLogin: false,
            sIsModalID: false,
            sIsModalPassword: false,
            sIsModalRegisterUser: false,
            sIsModalRegisterManager: false,
            sIsModalAgreement: false,
            sModalType: 0
        }
    }

    // handle function
    handleModal = ( modalType, visible, nextModalType ) => {
        let isModalLogin = false;
        let isModalID = false;
        let isModalPassword = false;
        let isModalRegisterUser = false;
        let isModalRegisterManager = false;
        let isModalAgreement = false;
        switch ( modalType ) {
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
            default: break;
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
    }

    // render function
    render() {
        const { pHandleLoginSuccessed } = this.props;
        const { sIsModalLogin, sIsModalID, sIsModalPassword, sIsModalRegisterUser, sIsModalRegisterManager, sIsModalAgreement, sModalType } = this.state;
        return (
            <div className="headerContainer">
                <div className="logo">
                    <h1 className="site-logo">
                        <a href="/" className="text-black">
                            <img alt="" src="/assets/images/header/logo_main1.png" />
                        </a>
                    </h1>
                </div>
                <div className="navigation" id="navigation">
                    <div className="nav-item">Home</div>
                    <div className="nav-item">맥주검색</div>
                    <div className="nav-item">매장검색</div>
                    <div className="nav-item">이벤트</div>
                    <div className="nav-item">공지사항</div>
                    <div className="nav-item">FAQ</div>
                    <div className="nav-item font-size1 login" onClick={this.handleModal.bind(this, MODAL_LOGIN, true)}>로그인</div>
                    <div className="slash">|</div>
                    <div className="nav-item font-size1" onClick={this.handleModal.bind(this, MODAL_AGREEMENT, true, MODAL_REGISTER_USER)}>회원가입</div>
                    <div className="slash">|</div>
                    <div className="nav-item font-size1" onClick={this.handleModal.bind(this, MODAL_AGREEMENT, true, MODAL_REGISTER_MANAGER)}>사업자 회원가입</div>
                    <div className="icon">
                        <i className="fa fa-bars" />
                    </div>
                </div>
                {   sIsModalLogin &&
                    <ModalLogin 
                        handleModal = { this.handleModal }
                        pHandleLoginSuccessed={pHandleLoginSuccessed}
                    />
                }
                {   sIsModalID &&
                    <ModalID 
                        handleModal = { this.handleModal }
                    />
                }
                {   sIsModalPassword &&
                    <ModalPassword 
                        handleModal = { this.handleModal }
                    />
                }
                {   sIsModalAgreement &&
                    <ModalAgreement
                        pModalType = { sModalType }
                        handleModal = { this.handleModal }
                    />
                }
                {   sIsModalRegisterUser &&
                    <ModalRegisterUser 
                        handleModal = { this.handleModal }
                    />
                }
                {   sIsModalRegisterManager &&
                    <ModalRegisterManager 
                        handleModal = { this.handleModal }
                    />
                }
            </div>
        );
    }
}

HeaderBeer.propTypes = {
    pHandleLoginSuccessed: PropTypes.func,
};

HeaderBeer.defaultProps = {
    pHandleLoginSuccessed: () => {},
};

export default HeaderBeer;
