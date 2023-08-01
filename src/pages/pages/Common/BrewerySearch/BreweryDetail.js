import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import ModalImage from '../../../components/ModalImage';
import BeerItem from '../../../components/BeerItem';

import {executeQuery} from '../../../../library/utils/fetch';
import Loading from '../../../components/Loading';
import $ from "jquery";

class BreweryDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sBeerDetail: [],
            sBreweryDetail: {},
            sBeerCount: 0,
            sBreweryContent: '',
            sFetchStatus: false,
            sIsMobileDimension: props.isMobileDimension,
        }
    }

    componentDidMount = () => {
        const id = _.get(this.props, 'match.params.id') || '';
        if (id) {
            executeQuery({
                method: 'get',
                url: `/brewery/fetchone?id=${id}`,
                success: (res) => {
                    const breweryId = _.get(res, 'brewery[0]._id') || '';
                    const result = _.get(res, 'brewery[0]') || null;
                    const content = _.get(res, 'brewery[0].content') || '';
                    console.log(content);
                    if (result) {
                        this.setState({
                            sBreweryDetail: result,
                            sBreweryContent: content,
                        });
                    }
                    executeQuery({
                        method: 'get',
                        url: `/beer/fetchlist?breweryId=${breweryId}`,
                        success: (res) => {
                            const result = _.get(res, 'beer') || [];
                            const cnt = result.length;
                            if (result) {
                                this.setState({
                                    sFetchStatus: true,
                                    sBeerDetail: result,
                                    sBeerCount: cnt
                                });
                            } else {
                                this.props.history.push('common/brewerys');
                            }
                        },
                        fail: (err, res) => {
                            this.props.history.push('/common/brewerys');
                        },
                    })
                },
                fail: (err, res) => {
                    this.props.history.push('/common/brewerys');
                },
            });
        } else {
            this.props.history.push('/common/brewerys');
        }
    }

    componentWillReceiveProps = (newProps) => {
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
        })
    }

    handleShowAbroadDetail = () => {
        const {sBreweryDetail} = this.state;
        this.props.history.push(`/common/brewerys/abroad/detail/${_.get(sBreweryDetail, 'uid._id') || ''}`)
    }

    render() {
        const {sBeerDetail, sBreweryDetail, sBeerCount, sBreweryContent, sFetchStatus, sIsMobileDimension} = this.state;
        let breweryType = _.get(sBreweryDetail, 'type') || '';
        if (sFetchStatus) {
            const address = sBreweryDetail.address || {};
            let reviewText = sBreweryContent || '';
            reviewText = reviewText.replace(/\n/g, "<br/>");

            $(document).ready(function() {
                $('#breweryReview').html(reviewText);
            });

            return (
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
                                <div>{sBreweryDetail.name}</div>
                            </div>
                            {
                                breweryType === 'abroad' &&
                                <div className='brewery-other-info'>
                                    <span>{`${sBreweryDetail.country} / ${sBreweryDetail.city}` || ''}</span>
                                    {
                                        sBreweryDetail.uid &&
                                        <div className="abroad-detail-show"
                                             onClick={this.handleShowAbroadDetail}>{`수입사 ${sBreweryDetail.uid.storeName || ''}`}</div>
                                    }
                                </div>
                            }

                            {
                                breweryType === 'domestic' &&
                                <div className='brewery-other-info'>
                                    <span>{`${address.zonecode || ''} ${address.roadAddress || ''} ${address.buildingName || ''}`}</span>
                                    <span>{sBreweryDetail.callNumber || ''}</span>
                                </div>
                            }
                            <div>{`${sBeerCount} Beers`}</div>
                        </div>
                    </div>
                    <div className='brewery-detail-description'>
                        <div className='brewery-description-title'>{'브루어리 소개'}</div>
                        <div className='brewery-description-content' id="breweryReview">
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

BreweryDetail.propTypes = {};

BreweryDetail.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(BreweryDetail);
