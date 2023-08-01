import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import {executeQuery} from '../../../../library/utils/fetch';
import Loading from '../../../components/Loading';
import ModalImage from '../../../components/ModalImage';
import BeerItem from '../../../components/BeerItem';

class AbroadBrewery extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sAbroadBrewery: {},
            sBeerData: [],
            sFetchStatus: {},
            sIsMobileDimension: props.isMobileDimension,
        }
    }

    componentDidMount = () => {
        this.getUsers();
        this.getBeers();
    };

    componentWillReceiveProps = (newProps) => {
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
        })
    };

    getUsers = () => {
        const {sFetchStatus} = this.state;
        const id = _.get(this.props, 'match.params.id') || '';
        if (id) {
            executeQuery({
                method: 'get',
                url: `/importer/fetchone?id=${id}`,
                success: (res) => {
                    const result = _.get(res, 'user') || '';
                    sFetchStatus.user = true;
                    this.setState({sFetchStatus, sAbroadBrewery: result})
                },
                fail: (err, res) => {
                    this.props.history.push('/common/brewerys');
                },
            });
        } else {
            this.props.history.push('/common/brewerys');
        }
    };

    getBeers = () => {
        const {sFetchStatus} = this.state;
        const id = _.get(this.props, 'match.params.id') || '';
        if (id) {
            executeQuery({
                method: 'get',
                url: `/beer/fetchlist?uid=${id}`,
                success: (res) => {
                    const result = _.get(res, 'beer') || '';
                    sFetchStatus.beer = true;
                    this.setState({sFetchStatus, sBeerData: result})
                },
                fail: (err, res) => {
                },
            });
        } else {
            this.props.history.push('/common/brewerys');
        }
    };

    renderBeerItem = () => {
        const {sBeerData, sIsMobileDimension} = this.state;
        return (
            _.map(sBeerData, (beerItem, beerIndex) => {
                return (
                    <BeerItem
                        key={beerIndex}
                        pData={beerItem}
                        isMobileDimension={sIsMobileDimension}
                    />
                )
            })
        )
    };

    render() {
        const {sFetchStatus, sAbroadBrewery, sBeerData} = this.state;
        let content = '';
        if (sAbroadBrewery.content) {
            content = sAbroadBrewery.content.replace(/\n/g, "<br/>");
        }
        if (sFetchStatus.beer && sFetchStatus.user) {
            const address = sAbroadBrewery.address || {};
            return (
                <div className='container-page-abroad-brewery-detail'>
                    <div className="abroad-brewery-detail-background">
                        <div className="abroad-brewery-detail-main-info">
                            <div className='abroad-brewery-main-image'>
                                <ModalImage
                                    pContent={{
                                        src: sAbroadBrewery.image,
                                    }}
                                    style={{
                                        width: 150,
                                        height: 150,
                                        borderRadius: 15
                                    }}
                                />
                            </div>
                            <div className='abroad-brewery-main-info'>
                                <div className="main-info-title">
                                    <span>{sAbroadBrewery.storeName}</span>
                                </div>
                                <div className="main-info-other">
                                    <span>{`${address.zonecode || ''} ${address.roadAddress || ''} ${address.buildingName || ''}`}</span>
                                    <span>{sAbroadBrewery.callNumber}</span>
                                </div>
                                <div>
                                    <span>{`${sBeerData.length} Beers`}</span>
                                </div>
                            </div>
                        </div>
                        <div className="importer-description">
                            <span style={{fontSize: '16px', fontWeight: 'bold'}}>회사 소개</span><br/>
                            <span dangerouslySetInnerHTML={{__html: content}} style={{marginTop:'10px'}}/>
                        </div>
                        <div className="importer-beer-content" style={{marginTop: '40px'}}>
                            <div className="beer-title" style={{fontSize: '20px', fontWeight: 'bold'}}>Beers</div>
                            {this.renderBeerItem()}
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

AbroadBrewery.propTypes = {};

AbroadBrewery.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(AbroadBrewery);
