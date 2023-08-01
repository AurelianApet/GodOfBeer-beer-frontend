import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import {executeQuery} from '../../../../library/utils/fetch';
import Loading from '../../../components/Loading';
import {
    pushNotification,
    NOTIFICATION_TYPE_ERROR,
    NOTIFICATION_TYPE_SUCCESS
} from '../../../../library/utils/notification';
import { setCopyright } from '../../../../library/redux/actions/seach';

const EDIT_NONE = 'none';
const EDIT_LICENSE = 'license';
const EDIT_PRIVACY = 'privacy';
const EDIT_PERSONAL = 'personal';
const EDIT_COPYRIGHT = 'copyright';

class License extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sFetchStatus: false,
            sBtnEnbaled: EDIT_NONE,
            sLicense: [],
            sPrivacy: [],
            sPersonal: [],
            sCopyright: [],
            styles: [],
            selectStyles: []
        };
        this.mode = {};
        this.stringInfo = {};
    }

    componentDidMount() {
        this.getLicenseInfo();
        this.getStyles();
    }

    getStyles = () => {
        executeQuery({
            method: 'get',
            url: '/beer/styles',
            success: (res) => {
                this.setState({styles: res.styles});
                if (res.styles.length === 0) {
                    this.addStyle();
                }
            },
            fail: (err) => {
                // pushNotification(NOTIFICATION_TYPE_ERROR, errResult);
            }
        });
    }

    getLicenseInfo = () => {
        executeQuery({
            method: 'get',
            url: '/license/fetchall',
            success: (res) => {
                const result = _.get(res, 'docs') || [];
                if (result.length) {
                    this.mode = true;
                }
                _.map(result, item => {
                    if (item.type === EDIT_LICENSE) {
                        _.set(this.mode, `${item.type}`, true);
                        this.setState({
                            sLicense: item.type === 'license' && item,
                        })
                    } else if (item.type === EDIT_PRIVACY) {
                        _.set(this.mode, `${item.type}`, true);
                        this.setState({
                            sPrivacy: item.type === 'privacy' && item,
                        })
                    } else if (item.type === EDIT_COPYRIGHT) {
                        _.set(this.mode, `${item.type}`, true);
                        this.setState({
                            sCopyright: item.type === 'copyright' && item,
                        })
                    } else {
                        _.set(this.mode, `${item.type}`, true);
                        this.setState({
                            sPersonal: item.type === 'personal' && item,
                        })
                    }
                });
                this.setState({
                    sFetchStatus: true,
                })
            },
            fail: (err) => {
                const errResult = _.get(err, 'data.error');
                pushNotification(NOTIFICATION_TYPE_ERROR, errResult);
            }
        })
    };

    handleChangedInputer = (e) => {
        const {name, value} = e.target;
        _.set(this.stringInfo, `${name}`, value);
        this.setState({
            sBtnEnbaled: name,
        })
    };

    handleEditLicense = (aType) => {
        const {sLicense, sPrivacy, sPersonal, sCopyright} = this.state;
        let licenseId ='';
        if (aType === EDIT_LICENSE) licenseId = sLicense._id;
        if (aType === EDIT_PRIVACY) licenseId = sPrivacy._id;
        if (aType === EDIT_PERSONAL) licenseId = sPersonal._id;
        if (aType === EDIT_COPYRIGHT) licenseId = sCopyright._id;
        if (this.mode[aType]) {
            executeQuery({
                method: 'put',
                url: `/license/updateone/${licenseId}`,
                data: {
                    content: this.stringInfo[aType] || '',
                    type: aType,
                },
                success: (res) => {
                    pushNotification(NOTIFICATION_TYPE_SUCCESS, '성공');
                    if(aType === EDIT_COPYRIGHT) {
                        this.props.setCopyright({copyright:this.stringInfo[aType]});
                    }
                    this.setState({
                        sBtnEnbaled: EDIT_NONE,
                    });
                },
                fail: (err) => {
                    const errResult = _.get(err, 'data.error');
                    if (errResult) {
                        pushNotification(NOTIFICATION_TYPE_ERROR, errResult);
                    }
                }
            })
        } else {
            executeQuery({
                method: 'post',
                url: `/license/create`,
                data: {
                    content: this.stringInfo[aType] || '',
                    type: aType,
                },
                success: (res) => {
                    pushNotification(NOTIFICATION_TYPE_SUCCESS, '성공');
                    if(aType === EDIT_COPYRIGHT) {
                        this.props.setCopyright({copyright:this.stringInfo[aType]});
                    }
                    this.setState({
                        sBtnEnbaled: EDIT_NONE,
                    })
                },
                fail: (err) => {
                    const errResult = _.get(err, 'data.error');
                    if (errResult) {
                        pushNotification(NOTIFICATION_TYPE_ERROR, errResult);
                    }
                }
            })
        }
    };

    addStyle() {
        let styles = this.state.styles;
        styles.push({
            _id: '',
            name: ''
        });
        this.setState({styles: styles});
    }

    changeStyleName(e, index) {
        let styles = this.state.styles;
        styles[index].name = e.target.value;
        this.setState({styles: styles});
    }

    changeStyleSortOrder(e, index) {
        let styles = this.state.styles;
        styles[index].sort_order = e.target.value;
        this.setState({styles: styles});
    }

    saveStyle() {
        const {styles}  = this.state;
        executeQuery({
            method: 'post',
            url: `/beer/styles/create`,
            data: {
                styles: styles
            },
            success: (res) => {
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '성공');
                this.getStyles();
            },
            fail: (err) => {
                const errResult = _.get(err, 'data.error');
                if (errResult) {
                    pushNotification(NOTIFICATION_TYPE_ERROR, errResult);
                }
            }
        })
    }

    handleSelectStyle(index) {
        let {selectStyles, styles} = this.state;
        if (selectStyles.indexOf(styles[index]._id) >= 0) {
            selectStyles.splice(selectStyles.indexOf(styles[index]._id), 1);
        } else {
            selectStyles.push(styles[index]._id);
        }
    }

    removeStyle() {
        let {selectStyles} = this.state;
        let result = [];
        for (let i = 0; i < selectStyles.length; i ++) {
            if (selectStyles[i]) {
                result.push(selectStyles[i])
            }
        }

        executeQuery({
            method: 'post',
            url: `/beer/styles/multidel`,
            data: {
                ids: result
            },
            success: (res) => {
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '성공');
                this.getStyles()
            },
            fail: (err) => {
                const errResult = _.get(err, 'data.error');
                if (errResult) {
                    pushNotification(NOTIFICATION_TYPE_ERROR, errResult);
                }
            }
        })
    }

    render() {
        const {sFetchStatus, sLicense, sPrivacy, sBtnEnbaled, sPersonal, styles, sCopyright} = this.state;
        console.log(styles);
        if (sFetchStatus) {
            return (
                <div className='container-page-license'>
                    <div className="license-content">
                        <div className="using-license-content">
                            <span>이용약관</span>
                            <textarea
                                name="license"
                                defaultValue={sLicense.content}
                                onChange={this.handleChangedInputer}
                                className="using-license-inputer"></textarea>
                            <button
                                className="using-license-btn-enable"
                                disabled={sBtnEnbaled === EDIT_LICENSE ? false : true}
                                onClick={this.handleEditLicense.bind(this, EDIT_LICENSE)}>
                                저장
                            </button>
                        </div>
                        <div className="privacy-content">
                            <span>개인정보 수집 및 이용동의</span>
                            <textarea
                                name="privacy"
                                defaultValue={sPrivacy.content}
                                onChange={this.handleChangedInputer}
                                className="privacy-inputer"></textarea>
                            <button
                                className="privacy-btn-enable"
                                disabled={sBtnEnbaled === EDIT_PRIVACY ? false : true}
                                onClick={this.handleEditLicense.bind(this, EDIT_PRIVACY)}>
                                저장
                            </button>
                        </div>
                        <div className="privacy-content">
                            <span>개인정보 처리방침</span>
                            <textarea
                                name="personal"
                                defaultValue={sPersonal.content}
                                onChange={this.handleChangedInputer}
                                className="privacy-inputer"></textarea>
                            <button
                                className="privacy-btn-enable"
                                disabled={sBtnEnbaled === EDIT_PERSONAL ? false : true}
                                onClick={this.handleEditLicense.bind(this, EDIT_PERSONAL)}>
                                저장
                            </button>
                        </div>

                        <div className="privacy-content">
                            <span>Copyright</span>
                            <textarea
                                name="copyright"
                                defaultValue={sCopyright.content}
                                onChange={this.handleChangedInputer}
                                className="privacy-inputer"></textarea>
                            <button
                                className="privacy-btn-enable"
                                disabled={sBtnEnbaled === EDIT_COPYRIGHT ? false : true}
                                onClick={this.handleEditLicense.bind(this, EDIT_COPYRIGHT)}>
                                저장
                            </button>
                        </div>
                        <div className="style-content">
                            <div className="part-header">
                                <span>맥주스타일 분류</span>

                                <div>
                                    <button className='style-btn' onClick={() => {this.addStyle()}}>추가</button>
                                    <button className='style-btn' onClick={() => {this.removeStyle()}}>삭제</button>
                                </div>
                            </div>

                            <table>
                                <tbody>
                                {
                                    styles.map((style, index) => (
                                        <tr key={index}>
                                            <td width="50px" style={{position: 'relative'}}>
                                                <input className='style-table-checkbox' type='checkbox' onClick={() => {this.handleSelectStyle(index)}}/>
                                            </td>
                                            <td>
                                                <input type={'text'} value={style.sort_order} onChange={(e) => {this.changeStyleSortOrder(e, index)}} className={'form-control'}/>
                                            </td>
                                            <td>
                                                <input type={'text'} value={style.name} onChange={(e) => {this.changeStyleName(e, index)}} className={'form-control'}/>
                                            </td>
                                        </tr>
                                    ))
                                }
                                </tbody>
                            </table>

                            <div style={{float: 'right', marginTop: '30px'}}>
                                <button className='style-btn' onClick={() => {this.saveStyle()}}>저장</button>
                            </div>
                        </div>


                    </div>
                </div>
            );
        } else {
            return (
                <div className="loading-wrapper">
                    <Loading/>
                </div>
            )
        }
    }
}

License.propTypes = {};

License.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
        {
            setCopyright
        }
    )
)(License);
