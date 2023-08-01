import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {calcDiffTime} from "../../../library/utils/dateTime";
import moment from 'moment';
import PropTypes from 'prop-types';


class SellerRemainComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sWidth: 100
        };
        this.width = 0;
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillReceiveProps(newProps) {
        this.updateDimensions();
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

    filterCurrencyInt = (src) => {
        if (!src) src = 0;
        src = (src * 1).toFixed(2);
        const strSrc = src + "";
        let strPrefix = strSrc.split(".")[0];

        strPrefix = strPrefix.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return strPrefix;
    };

    renderBeerRemainContainer = () => {
        const {sWidth} = this.state;
        const {sBeerRemainData} = this.props;
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
                                <div className="beer-total-img" style={{width: sWidth / 2, height: sWidth * 1.5, borderRadius: '8px', overflow: 'hidden'}}>
                                    <span className={'total-amount'}>{this.filterCurrencyInt(item.remaining_amount)}ml</span><br/>
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
                                    <span>{this.filterCurrencyInt(item.total_amount)}ml</span>
                                    <span>{calcDiffTime(moment().format('YYYY-MM-DD HH:mm:ss'), item.update_time)}</span>
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
            <div className={'component-seller-remain'}>
                <div id='beerRemainContent' className='container-page-seller-beer-remain'>
                    <div className='component-header-title'>맥주잔량</div>
                    {this.renderBeerRemainContainer()}
                </div>
            </div>
        );
    }
}

SellerRemainComponent.propTypes = {
    sBeerRemainData: PropTypes.array
};

SellerRemainComponent.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(SellerRemainComponent);
