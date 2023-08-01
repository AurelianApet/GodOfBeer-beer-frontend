import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {executeQuery} from '../../../../library/utils/fetch';
import {calcDiffTime} from '../../../../library/utils/dateTime';
import moment from 'moment';
import Loading from '../../../components/Loading';

class SellerRemainCom extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sBeerRemainData: [],
            sWidth: 0,
            sFetchStatus: false,
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
        const userId = _.get(aProps, 'match.params.id') || '';
        executeQuery({
            method: 'get',
            url: `/pub/fetchone?uid=${userId}`,
            success: (res) => {
                // const result = _.get(res, 'pub[0].equipment') || [];
                const equipment = _.get(res, 'equipment') || [];
                this.setState({
                    sBeerRemainData: equipment,
                    sFetchStatus: true,
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
                                <div className="beer-name"><span>{item.name}</span></div>
                                <div className="beer-total-img" style={{width: sWidth / 2, height: sWidth * 1.5, borderRadius: '8px', overflow: 'hidden'}}>
                                    <span className={'total-amount'}>{this.filterCurrencyInt(item.total_amount)}ml</span><br/>
                                    <div className="beer-remain-img"
                                         style={{width: (sWidth / 2) - 2, height: aRemainWidth * 1.5 - 1, bottom: -1, borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', border: 'none'}}/>
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
                                <div className="beer-name">
                                    <span>{this.filterCurrencyInt(item.remaining_amount)}ml</span>
                                    <span>{calcDiffTime(moment().format('YYYY-MM-DD HH:mm:ss'), item.last_update_datetime)}</span>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    };

    render() {
        const {sFetchStatus} = this.state;
        if (sFetchStatus) {
            return (
                <div>
                    <div id='beerRemainContent' className='container-page-seller-beer-remain'>
                        {this.renderBeerRemainContainer()}
                    </div>
                </div>
            );
        } else {
            return (
                <div id='beerRemainContent' className="loading-wrapper">
                    <Loading/>
                </div>
            )
        }

    }
}

SellerRemainCom.propTypes = {};

SellerRemainCom.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(SellerRemainCom);