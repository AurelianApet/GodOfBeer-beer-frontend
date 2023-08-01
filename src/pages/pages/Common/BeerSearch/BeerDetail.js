import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import $ from 'jquery';

import ModalImage from '../../../components/ModalImage';

import {executeQuery} from '../../../../library/utils/fetch';
import RateViewer from '../../../components/RateViewer';
import ReviewItem from '../../../components/ReviewItem';
import BreweryItem from '../../../components/BreweryItem';
import Loading from '../../../components/Loading';

class BeerDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sBeerDetail: {},
            sFetchStatus: [],
            sBeerData: []
        }
    }

    componentDidMount = () => {
        const id = _.get(this.props, 'match.params.id') || '';
        if (id) {
            executeQuery({
                method: 'get',
                url: `/beer/fetchone?id=${id}`,
                success: (res) => {
                    let {sFetchStatus} = this.state;
                    const result = _.get(res, 'beer[0]') || null;
                    sFetchStatus.beerOne = true;
                    if (result) {
                        this.setState({
                            sFetchStatus,
                            sBeerDetail: result,
                        });
                    } else {
                        this.props.history.push('common/beers');
                    }
                },
                fail: (err, res) => {
                    this.props.history.push('/common/beers');
                },
            });
        } else {
            this.props.history.push('/common/beers');
        }
        this.getBeerDataAll();
    };

    getBeerDataAll = () => {
        executeQuery({
            method: 'get',
            url: 'beer/fetchall',
            success: (res) => {
                let {sFetchStatus} = this.state;
                const result = _.get(res, 'beer') || [];
                sFetchStatus.beer = true;
                this.setState({
                    sFetchStatus,
                    sBeerData: result
                })
            },
            fail: (err) => {

            }
        })
    };

    handlePushPubDetail = (aType) => {
        const {sBeerDetail} = this.state;

        if(aType === 'Draft') {
            this.props.history.push(`/common/pubs?beerId=draft${sBeerDetail._id}`);
        }
        else {
            this.props.history.push(`/common/pubs?beerId=bottle${sBeerDetail._id}`);
        }
    };

    nl2br = (str, is_xhtml) => {
        // Converts newlines to HTML line breaks
        //
        // version: 1109.2015
        // discuss at: http://phpjs.org/functions/nl2br
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Philip Peterson
        // +   improved by: Onno Marsman
        // +   improved by: Atli Þór
        // +   bugfixed by: Onno Marsman
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Maximusya
        // *     example 1: nl2br('Kevin\nvan\nZonneveld');
        // *     returns 1: 'Kevin\nvan\nZonneveld'
        // *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
        // *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
        // *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
        // *     returns 3: '\nOne\nTwo\n\nThree\n'
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '' : '<br>';

        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    };

    render() {
        const {sBeerDetail, sFetchStatus, sBeerData} = this.state;
        if (sFetchStatus.beer && sFetchStatus.beerOne) {
            const reviews = sBeerDetail.reviews || [];
            let rate = 0;
            _.map(reviews, (reviewItem, reviewIndex) => {
                rate += Number(reviewItem.marks) || 0;
            });
            if (reviews.length !== 0) {
                rate = rate / reviews.length;
                rate = Math.round(rate * 100) / 100;
            }
            const pubs = sBeerDetail.pubs || [];
            let draftPubs = sBeerDetail.draftCnt * 1 || 0, bottlePubs = sBeerDetail.bottleCnt * 1 || 0;
            let reviewText = sBeerDetail.content || '';
            reviewText = reviewText.replace(/\n/g, "<br/>");

            $(document).ready(function() {
                $('#beerReview').html(reviewText);
            });

            return (
                <div className='container-page-beer-detail'>
                    <div className='beer-detail-main-info'>
                        <div className='beer-main-image'>
                            <ModalImage
                                pContent={{
                                    src: sBeerDetail.image,
                                }}
                                style={{
                                    width: 150,
                                    height: 150,
                                    borderRadius: 15
                                }}
                            />
                        </div>
                        <div className='beer-main-info'>
                            <div className='beer-name'>{sBeerDetail.name}</div>
                            <div className='beer-other-info' style={{marginTop: '20px'}}>
                                <span>{`스타일: ${sBeerDetail.styles || ''}`}</span> / &nbsp;<span>{`나라: ${sBeerDetail.country || ''}`}</span>
                            </div>
                            <div className='beer-other-info'>
                                <span>{`ABV: ${sBeerDetail.alcohol.toFixed(1) + '%' || ''}`}</span> /&nbsp;&nbsp;<span>{`IBU: ${sBeerDetail.ibu || ''}`}</span>
                            </div>
                            <div className='beer-rate'>
                                <RateViewer
                                    value={rate}
                                />
                                <div className='beer-average'>{`평점: ${rate}`}</div>
                                <div className='beer-reviews'>{`리뷰: ${reviews.length}`}</div>
                            </div>
                        </div>
                    </div>
                    <div className='beer-pubs'>
                        <div className='beer-pubs-title beer-info-title'>판매매장</div>
                        <div className='beer-pubs-content beer-info-content'>
                            <div className='beer-pub-draft'
                                 onClick={this.handlePushPubDetail.bind(this, 'Draft')}>{`Draft: ${draftPubs}`}</div>
                            <div className='beer-pub-bottle-can'
                                 onClick={this.handlePushPubDetail.bind(this, 'Bottle')}>{`Bottle & Can: ${bottlePubs}`}</div>
                        </div>
                    </div>
                    {
                        sBeerDetail.breweryId &&
                        <div className='beer-brewery'>
                            <div className='beer-brewery-title beer-info-title'>브루어리</div>
                            <div className='beer-info-content'>
                                <BreweryItem
                                    key={`${sBeerDetail.breweryId}_1`}
                                    pBreweryData={sBeerDetail.breweryId || {}}
                                    pBeerData={sBeerData}
                                />
                            </div>
                        </div>
                    }

                    <div className='beer-content'>
                        <div className='beer-content-title beer-info-title'>맥주설명</div>
                        <div className='beer-info-content' id="beerReview">
                        </div>
                    </div>
                    <div className='beer-reviews' style={{marginTop: '40px'}}>
                        <div className='beer-reviews-title beer-info-title'>리뷰</div>
                        <div className='beer-info-content'>
                            {_.map(reviews, (reviewItem, reviewIndex) => {
                                return (
                                    <ReviewItem
                                        key={reviewIndex}
                                        pData={reviewItem}
                                    />
                                )
                            })}
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

BeerDetail.propTypes = {};

BeerDetail.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(BeerDetail);
