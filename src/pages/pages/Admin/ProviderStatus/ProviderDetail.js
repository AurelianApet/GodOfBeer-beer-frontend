import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {executeQuery} from '../../../../library/utils/fetch';
import BeerTable, {MODE_DATA, TYPE_NO, TYPE_IMG, TYPE_DATETIME} from '../../../components/BeerTable';
import Loading from '../../../components/Loading';
import UserDetailModal from '../UserDetailModal';
import {
    pushNotification,
    NOTIFICATION_TYPE_ERROR,
    NOTIFICATION_TYPE_SUCCESS
} from '../../../../library/utils/notification';
import $ from "jquery";
import ModalImage from "../../../components/ModalImage";
import BeerItem from "../../../components/BeerItem";

class ProviderDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sData: [],
            sFetchStatus: false,
            sIsUserDiableModal: false,
            sBeerDetail: [],
            sBreweryDetail: {},
            sBeerCount: 0,
            sBreweryContent: '',
            sIsMobileDimension: props.isMobileDimension,
        };
    }

    componentDidMount = () => {
        this.getUserDetail();
    };

    componentWillReceiveProps = (newProps) => {
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
        })
    };

    getUserDetail = () => {
        const userId = _.get(this.props, 'match.params.id') || '';
        executeQuery({
            method: 'get',
            url: `user/fetchone?id=${userId}`,
            success: (res) => {
                const user = _.get(res, 'user');
                this.setState({
                    sFetchStatus: true,
                    sBreweryDetail: user,
                    sBreweryContent: user.content || '',
                    sData: [user] || []
                });
                this.getBreweryDetail();
            },
            fail: (err) => {

            }
        })
    };

    getBreweryDetail() {
        const userId = _.get(this.props, 'match.params.id') || '';
        executeQuery({
            method: 'get',
            url: `/brewery/fetchlist?uid=${userId}`,
            success: (res) => {
                let breweryInfo = _.get(res, 'brewery') || [];
                for(let i = 0 ; i < breweryInfo.length ; i ++) {
                    const breweryId = breweryInfo[i]._id * 1 || 0;
                    executeQuery({
                        method: 'get',
                        url: `/beer/fetchlist?breweryId=${breweryId}`,
                        success: (res) => {
                            const {sBeerDetail, sBeerCount} = this.state;
                            let beerData = sBeerDetail;
                            let beerCount = sBeerCount;
                            const result = _.get(res, 'beer') || [];
                            const cnt = result.length;
                            if (result) {
                                for(let j = 0 ; j < result.length ; j ++) {
                                    beerData.push(result[j]);
                                }
                                beerCount += cnt;
                                this.setState({
                                    sBeerDetail: beerData,
                                    sBeerCount: beerCount
                                });
                            }
                        },
                        fail: (err, res) => {
                        },
                    })
                }
            },
            fail: (err, res) => {
            },
        });
    }

    handleUserDisable = () => {
        this.setState({sIsUserDiableModal: true})
    };

    handleCloseEnableModal = () => {
        this.setState({sIsUserDiableModal: false})
    };

    handleClickEnableUserButton = () => {
        const {sData} = this.state;
        if (!this.userDetailModal.refuseReason) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '차단사유를 입력하세요.');
            return;
        }
        executeQuery({
            method: 'put',
            url: `user/enable/${_.get(sData, '[0]._id')}`,
            data: {
                enabled: 'CANCEL',
                cancelReason: this.userDetailModal.refuseReason,
            },
            success: (res) => {
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '사용자 차단되었습니다');
                this.setState({
                    sIsUserDiableModal: false,
                });
            },
            fail: (err, res) => {

            }
        })
    };

    render() {
        const {sData, sFetchStatus, sIsUserDiableModal, sIsMobileDimension} = this.state;
        const {sBeerDetail, sBreweryDetail, sBeerCount, sBreweryContent} = this.state;
        if (sFetchStatus) {
            let breweryType = _.get(sBreweryDetail, 'companyType') || '';
            const address = sBreweryDetail.address || {};
            let reviewText = sBreweryContent || '';
            reviewText = reviewText.replace(/\n/g, "<br/>");

            $(document).ready(function() {
                $('#breweryReview1').html(reviewText);
            });

            return (
                <div className='containter-page-provider-back'>
                    <div className='container-page-provider-detail'>
                        <div className='container-page-provider-info'>
                            <div className='provider-info-title'>
                                <span>{sData[0].storeName}</span>
                                <button className='provider-btn-disable' onClick={this.handleUserDisable}>
                                    계정차단
                                </button>
                            </div>
                            <div className='container-page-brewery-detail'>
                                <div className='brewery-detail-main-info'>
                                    <div className='brewery-main-image'>
                                        <ModalImage
                                            pContent={{
                                                src: sBreweryDetail.image,
                                            }}
                                            style={{
                                                width: 150,
                                                height: 150,
                                                borderRadius: 15
                                            }}
                                        />
                                    </div>
                                    <div className='brewery-main-info'>
                                        <div className='brewery-name'>
                                            <div>{sBreweryDetail.storeName}</div>
                                        </div>
                                        <div className='brewery-other-info'>
                                            <span>{`${address.zonecode || ''} ${address.roadAddress || ''} ${address.buildingName || ''}`}</span>
                                            <span>{sBreweryDetail.callNumber || ''}</span>
                                        </div>
                                        <div>{`${sBeerCount} Beers`}</div>
                                    </div>
                                </div>
                                <div className='brewery-detail-description'>
                                    <div className='brewery-description-title'>{'브루어리 소개'}</div>
                                    <div className='brewery-description-content' id="breweryReview1">
                                    </div>
                                </div>
                                <div className='brewery-beers-items-body'>
                                    <div className='beers-item-title'><span>{'Beers'}</span></div>
                                </div>
                                <div>
                                    {
                                        _.map(sBeerDetail, (beerItem, index) => {
                                            return (
                                                <BeerItem
                                                    key={index}
                                                    pData={beerItem}
                                                    isMobileDimension={sIsMobileDimension}
                                                />
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>

                        {
                            sIsUserDiableModal &&
                            <UserDetailModal
                                onRef={(ref) => {
                                    this.userDetailModal = ref
                                }}
                                userData={sData[0]}
                                handleCloseModal={this.handleCloseEnableModal}
                                handleClickEnableUserButton={this.handleClickEnableUserButton}
                                hasOperationButton={true}
                            />
                        }
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

ProviderDetail.propTypes = {};

ProviderDetail.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(ProviderDetail);
