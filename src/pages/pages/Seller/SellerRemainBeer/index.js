import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { executeQuery } from '../../../../library/utils/fetch';
import { calcDiffTime } from '../../../../library/utils/dateTime';
import { maskNumber } from '../../../../library/utils/masks';
import moment from "moment";

class SellerRemainBeer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sBeerRemainData: [],
            sWidth: 0,
        };
        this.width = 0;
    }

    componentDidMount() {
        this.updateDimensions();
        this.getPubData(this.props);
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillReceiveProps(newProps) {
        this.updateDimensions();
        this.getPubData(newProps);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions)
    }

    updateDimensions = (e) => {
        const containerElement = window.getElementFromId('beerRemainContent');
        this.width = containerElement[0].clientWidth / 8;
        this.setState({
            sWidth: this.width,
        })
    };

    getPubData = (aProps) => {
        const userId = _.get(aProps, 'user._id') || '';
        executeQuery({
            method: 'get',
            url: `/pub/fetchone?uid=${userId}`,
            success: (res) => {
                const equipment = _.get(res, 'equipment') || [];
                this.setState({
                    sBeerRemainData: equipment
                })
            },
            fail: (err, res) => {
            }
        })
    };

    filterCurrencyInt = (src) => {
        if (!src) src = 0;
        src = (src * 1).toFixed(2);
        const strSrc = src + "";
        let strPrefix = strSrc.split(".")[0];

        strPrefix = strPrefix.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return strPrefix;
    };

    renderBeerRemainContainer = () => {
        const {sBeerRemainData, sWidth} = this.state;
        return (
            <div className="beer-remain-container">
                {
                    _.map(sBeerRemainData, (item, index) => {
                        let aRemainWidth = (item.remaining_amount / item.total_amount) * sWidth;
                        return (
                            <div key={`${item.name} ${index}`} className="remain-row-content">
                                <div className="beer-name">
                                    <span>
                                        {index + 1} <br/>
                                        {item.name}
                                    </span>
                                </div>
                                <div className={'cover-container'}>
                                    <div/>
                                </div>
                                <div className="beer-total-img" style={{width: sWidth * 0.6, height: sWidth * 1.5, borderRadius: '8px', overflow: 'hidden'}}>
                                    <span className={'total-amount'}>{this.filterCurrencyInt(item.remaining_amount)}ml</span><br/>
                                    <div className='cover'/>
                                    <div className="beer-remain-img"
                                         style={{width: (sWidth * 0.6) - 2, height: aRemainWidth * 1.5 - 1, bottom: -1, borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', border: 'none'}}/>
                                    <div className={'ruler first'}></div>
                                    <div className={'ruler second'}></div>
                                    <div className={'ruler third'}></div>
                                    <div className={'ruler fourth'}></div>
                                    <div className={'ruler fifth'}></div>
                                    <div className={'ruler sixth'}></div>
                                    <div className={'ruler seventh'}></div>
                                    <div className={'ruler eighth'}></div>
                                    <div className={'ruler ninth'}></div>
                                </div>
                                <div>
                                    <span>{this.filterCurrencyInt(item.total_amount)}ml</span><br/>
                                    <span>{calcDiffTime(moment().format('YYYY-MM-DD HH:mm:ss'), item.update_time)}</span>
                                    {/*<span>{moment(new Date(item.last_update_datetime)).format('MM-DD HH:mm')}</span>*/}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    };

    render() {
        return (
            <div>
                <div id='beerRemainContent' className='container-page-seller-beer-remain'>
                    <div className={'page-title'}>
                        맥주잔량
                    </div>
                    {this.renderBeerRemainContainer()}
                </div>
            </div>
        );
    }
}

SellerRemainBeer.propTypes = {};

SellerRemainBeer.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(SellerRemainBeer);
