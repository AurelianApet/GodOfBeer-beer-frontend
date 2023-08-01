import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import RateViewer from '../RateViewer';
import ModalImage from '../ModalImage';

class BeerItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    handlePushToDetail = () => {
        const { pData } = this.props;
        this.props.history.push( `/common/beers/detail/${pData._id}` );
    }

    renderMobileBeerItemContainer = () => {
        const { pData } = this.props;
        const beerImg = pData.image || '';
        const pubs = pData.pubs || [];
        const reviews = pData.reviews || [];
        let rate = 0;
        _.map( reviews, ( reviewItem, reviewIndex ) => {
            rate += Number( reviewItem.marks ) || 0;
        });
        if ( reviews.length !== 0 ) {
            rate = rate / reviews.length;
            rate = Math.round( rate * 100 ) / 100;
        }
        return (
            <div className='mobile-container-component-beer-item'>
                <div className='beer-item-image'>
                    <ModalImage
                        pContent={{src: beerImg}}
                        style={{
                            width: 90,
                            height: 90,
                            borderRadius: 15
                        }}
                    />
                </div>
                <div className="mobile-beer-item-info">
                    <div className='beer-detail-container'>
                        <div className='beer-detail-item beer-name' onClick={this.handlePushToDetail}>{pData.name || ''}</div>
                    </div>
                    <div className='beer-detail-container'>
                        <div className='beer-detail-item'>
                            <span>{`${pData.country || ''} /`}</span>
                            <span>{`${pData.style || ''} /`}</span>
                            <span>{`${pData.alcohol || ''} /`}</span>
                            <span>{pData.ibu || ''}</span>
                        </div>
                        <div className='beer-detail-item'>{`판매매장 : ${pubs.length}`}</div>
                    </div>
                    <div className="beer-detail-item-like">
                        <RateViewer
                            value={rate}
                        />
                        <div className='beer-like-item'>{`평점 ${rate}`}</div>
                        <div className='beer-like-item'>{`리뷰 ${reviews.length}`}</div>
                    </div>
                </div>
            </div>
        )
    }

    renderBeerItemContainer = () => {
        const { pData } = this.props;
        const beerImg = pData.image || '';
        const pubs = pData.pubs || [];
        const reviews = pData.reviews || [];
        let rate = 0;
        _.map( reviews, ( reviewItem, reviewIndex ) => {
            rate += Number( reviewItem.marks ) || 0;
        });
        if ( reviews.length !== 0 ) {
            rate = rate / reviews.length;
            rate = Math.round( rate * 100 ) / 100;
        }
        return (
            <div className='container-component-beer-item'>
                <div className='beer-item-image'>
                    <ModalImage
                        pContent={{src: beerImg}}
                        style={{
                            width: 90,
                            height: 90,
                            borderRadius: 15
                        }}/>
                </div>
                <div className='beer-detail-container'>
                    <div className='beer-detail-item beer-name' onClick={this.handlePushToDetail}>{pData.name || ''}</div>
                    <div className='beer-detail-item'>
                        <span>{pData.style ? '스타일: ' + pData.styles + ' / ' : ''}</span>
                        <span>{pData.country ? '나라: ' + pData.country + ' / ' : ''}</span>
                        <span>{pData.alcohol ? 'ABV: ' + pData.alcohol + '% / ' : ''}</span>
                        <span>{pData.ibu ? 'IBU: ' + pData.ibu + '' : ''}</span>
                    </div>
                    <div className='beer-detail-item'>
                        <span>{`판매매장 : ${pubs.length}`}</span>
                    </div>
                    <div className='beer-detail-item beer-like'>
                        <RateViewer
                            value={rate}
                        />
                        <div className='beer-like-item'>{`${rate}`}</div>
                        <div className='beer-like-item'>{`리뷰 ${reviews.length}`}</div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const { isMobileDimension } = this.props;
        return (
            isMobileDimension ?
                this.renderMobileBeerItemContainer()
                :
                this.renderBeerItemContainer()
        );
    }
}

BeerItem.propTypes = {
    pData: PropTypes.object,
};

BeerItem.defaultProps = {
    pData: {},
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(BeerItem);
