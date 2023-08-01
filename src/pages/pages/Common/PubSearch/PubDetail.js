import React, {Component} from 'react';
import _ from 'lodash';
import cn from 'classnames';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import ModalImage from '../../../components/ModalImage';

import {executeQuery} from '../../../../library/utils/fetch';
import PubMenuItem from '../../../components/PubMenuItem';
import PubBeerMenuItem from '../../../components/PubBeerMenuItem';
import Loading from '../../../components/Loading';
import {findFromArray} from '../../../../library/utils/array';

class PubDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sBeerDetail: [],
            sPubDetail: {},
            sPubType: 0,
            sBeerData: [],
            sFetchStatus: {},
            sIsMobileDimension: props.isMobileDimension,
            sPubPoint: 2
        };
        this.week = [
            '월요일',
            '화요일',
            '수요일',
            '목요일',
            '금요일',
            '토요일',
            '일요일',
        ]
    }

    componentDidMount = () => {
        const id = _.get(this.props, 'match.params.id') || '';
        this.getBeerData();
        if (id) {
            executeQuery({
                method: 'get',
                url: `/pub/fetchone?id=${id}`,
                success: (res) => {
                    console.log(`${id}`);
                    let {sFetchStatus} = this.state;
                    const result = _.get(res, 'pub[0]') || null;
                    const point = _.get(res, 'point') || 0;
                    if (result) {
                        sFetchStatus.pub = true;
                        this.setState({
                            sFetchStatus,
                            sPubDetail: result,
                            sPubPoint: point
                        });
                    } else {
                        this.props.history.push('/common/pubs');
                    }
                },
                fail: (err, res) => {
                    this.props.history.push('/common/pubs');
                },
            });
        } else {
            this.props.history.push('/common/pubs');
        }
    };

    componentWillReceiveProps = (newProps) => {
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
        })
    };

    getBeerData = () => {
        executeQuery({
            method: 'get',
            url: `/beer/fetchall`,
            success: (res) => {
                let {sFetchStatus} = this.state;
                const result = _.get(res, 'beer') || [];
                sFetchStatus.beer = true;
                this.setState({
                    sFetchStatus,
                    sBeerData: result
                });
            },
            fail: (err) => {

            }
        })
    };

    handleClickPubType = (type) => {
        this.setState({sPubType: type})
    };

    getAddress = () => {
        const {sPubDetail} = this.state;
        let result = '';
        const address = _.get(sPubDetail, 'uid.address') || {};
        if (typeof address === 'object') {
            result = `${address.buildingName || ''} ${address.roadAddress || ''} ${sPubDetail.uid.addressDetail || ''} ${address.zonecode || ''}`;
        } else {
            result = address;
        }
        return result;
    };

    getBeerCount = () => {
        const {sPubDetail} = this.state;
        const beerArray = _.get(sPubDetail, 'mainMenu') || [];
        let beer = [];
        _.map(beerArray, (beerItem, beerIndex) => {
            const beerData = _.get(beerItem, 'beer') || '';
            const isSame = findFromArray(beer, '_id', beerData._id);
            if (!isSame) {
                beer.push(beerData)
            }
        });
        return beer.length || 0;
    };

    renderMainInfo = () => {
        const {sPubDetail} = this.state;
        const address = this.getAddress();
        const beerCount = this.getBeerCount();
        const pubSubImage = _.get(sPubDetail, 'pubImages') || [];
        return (
            <div className='pub-detail-main-info'>
                <div className='pub-main-image'>
                    <ModalImage
                        pContent={{
                            src: _.get(sPubDetail, 'uid.image') || '',
                        }}
                        otherImages={pubSubImage}
                        style={{
                            width: 150,
                            height: 150,
                            borderRadius: 15
                        }}
                    />
                </div>

                <div className='pub-main-info'>
                    <div className="pub-name">
                        <span>{_.get(sPubDetail, 'name') || ''}</span>
                    </div>
                    <div className='pub-other-info'>
                        <span>{address}</span>
                    </div>
                    <div className='pub-other-info'>
                        <span>{_.get(sPubDetail, 'uid.callNumber') || ''}</span>
                    </div>
                    <div className="pub-beer-count">
                        <span>{`${beerCount} Beers`}</span>
                    </div>
                </div>
            </div>
        )
    };

    renderBeerShow = () => {
        const {sPubDetail, sBeerData, sIsMobileDimension} = this.state;
        const aBeerMenu = _.get(sPubDetail, 'mainMenu') || [];

        return (
            <PubBeerMenuItem
                pMenuArray={aBeerMenu}
                pBeerArray={sBeerData}
                isMobileDimension={sIsMobileDimension}
            />
        )
    };

    renderPubInfo = () => {
        const {sPubDetail, sPubPoint} = this.state;
        const sBusinessTime = _.get(sPubDetail, 'businessTime') || [];
        const pubSubImage = _.get(sPubDetail, 'pubImages') || [];

        return (
            <div className='pub-info-container'>
                {
                    pubSubImage.length > 0 &&
                    <div className='pub-info-decription-title'><span>{'매장소개'}</span></div>
                }

                {
                    pubSubImage.length > 0 &&
                    <div className='pub-info-decription-content'>
                        {this.renderSubImgContainer()}
                    </div>
                }

                <div className='pub-info-decription-title'><span>{'영업시간'}</span></div>
                {
                    _.map(this.week, (item, index) => {
                        const targetBusinessTime = findFromArray(sBusinessTime, 'day', index) || {};
                        const businessStartTime = targetBusinessTime.startTime || '';
                        const businessEndTime = targetBusinessTime.endTime || '';
                        return (
                            <div key={`${targetBusinessTime._id}: ${index}`} className='pub-info-decription-content'>
                                {
                                    !targetBusinessTime.rest ?
                                        <span>{`${this.week[index]}: ${businessStartTime}~${businessEndTime}`}</span>
                                        :
                                        <span>{`${this.week[index]}: 휴무`}</span>
                                }
                            </div>
                        )
                    })
                }
                <div className='pub-info-decription-title'><span>{'포인트사용'}</span></div>
                <div className='pub-info-decription-content'><p>{
                    sPubPoint === 0 ? '가능(매장포인트)' :
                        (sPubPoint === 1 ? '가능(통합포인트)' : '불가')
                }</p></div>

                <div className='pub-info-decription-title'><span>{'매장소개'}</span></div>
                <div className='pub-info-decription-content'>
                    {
                        sPubDetail.content &&
                        <p dangerouslySetInnerHTML={{__html: sPubDetail.content.replace(/\n/g, "<br/>")}}/>
                    }
                </div>
            </div>
        )
    };

    renderPubMenu = () => {
        const {sPubDetail} = this.state;
        const aOtherMenu = _.get(sPubDetail, 'otherMenu') || []
        return (
            <PubMenuItem
                pMenuArray={aOtherMenu}
            />
        )
    };

    renderSubImgContainer = () => {
        const {sPubDetail, sIsMobileDimension} = this.state;
        const pubSubImage = _.get(sPubDetail, 'pubImages') || [];
        return (
            <div className="pub-images-content">
                {
                    _.map(pubSubImage, (imgItem, imgIndex) => {
                        return (
                            <ModalImage
                                key={imgIndex}
                                pContent={{
                                    src: imgItem,
                                }}
                                style={!sIsMobileDimension ?
                                    {
                                        width: 80,
                                        height: 80,
                                        margin: 10,
                                    } :
                                    {
                                        width: 60,
                                        height: 60,
                                        margin: 3,
                                    }}
                            />
                        )
                    })
                }
            </div>
        )
    };

    render() {
        const {sPubType, sFetchStatus, sIsMobileDimension} = this.state;
        if (sFetchStatus.beer && sFetchStatus.pub) {
            return (
                <div className={sIsMobileDimension ? 'mobile-container-page-pub-detail' : 'container-page-pub-detail'}>
                    {
                        this.renderMainInfo()
                    }

                    <div className='pub-type-tabs'>
                        <div className={cn('pub-type-beer', sPubType === 0 && 'pub-type-tab-selected')}
                             onClick={this.handleClickPubType.bind(this, 0)}><span>맥주</span></div>
                        <div className={cn('pub-type-info', sPubType === 1 && 'pub-type-tab-selected')}
                             onClick={this.handleClickPubType.bind(this, 1)}><span>매장정보</span></div>
                        <div className={cn('pub-type-menu', sPubType === 2 && 'pub-type-tab-selected')}
                             onClick={this.handleClickPubType.bind(this, 2)}><span>메뉴</span></div>
                    </div>

                    {
                        sPubType === 0 &&
                        this.renderBeerShow()
                    }
                    {
                        sPubType === 1 &&
                        this.renderPubInfo()
                    }
                    {
                        sPubType === 2 &&
                        this.renderPubMenu()
                    }
                </div>
            );
        } else {
            return (
                <div className="loading-wrapper">
                    <Loading/>
                </div>
            );
        }
    }
}

PubDetail.propTypes = {};

PubDetail.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(PubDetail);
