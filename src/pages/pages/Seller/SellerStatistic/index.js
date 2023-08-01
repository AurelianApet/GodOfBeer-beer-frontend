import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';

import MonthStatistic from './MonthStatistic';
import PeriodStatistic from './PeriodStatistic';
import MenuStatistic from './MenuStatistic';
import BeerStatistic from './BeerStatistic';

import {executeQuery} from '../../../../library/utils/fetch';
import Loading from '../../../components/Loading';

class SellerStatistic extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sPaymentData: [],
            sServiceInfo: {},
            sFetchStatus: false,
        }
    }

    componentDidMount() {
        const userId = _.get(this.props, 'user._id') || '';
        this.getPaymentData(userId);
    }

    componentWillReceiveProps(newProps) {
        const userId = _.get(newProps, 'user._id') || '';
        this.getPaymentData(userId);
    }

    getPaymentData = (aID) => {
        if (aID) {
            executeQuery({
                method: 'get',
                url: `/pub/fetchone?uid=${aID}`,
                success: (res) => {
                    const result = res.pub || [];
                    const pubId = _.get(result, '[0]._id');
                    this.setState({
                        sFetchStatus: true,
                        sPaymentData: [],
                        sServiceInfo: {}
                    })
                    // executeQuery({
                    //     method: 'get',
                    //     url: `/payment/fetchlist?pubId=${pubId}`,
                    //     success: (res) => {
                    //         const payment = res.payments || [];
                    //         const serviceInfo = res.serviceInfo || {};
                    //         this.setState({
                    //             sFetchStatus: true,
                    //             sPaymentData: payment,
                    //             sServiceInfo: serviceInfo
                    //         })
                    //     },
                    //     fail: (err, res) => {
                    //     }
                    // })
                },
                fail: (err, res) => {
                }
            })
        }
    }

    render() {
        const {sPaymentData, sFetchStatus, sServiceInfo} = this.state;
        const userId = _.get(this.props, 'user._id') || '';
        if (sFetchStatus) {
            return (
                <div className='container-page-seller-statistic'>
                    <MonthStatistic
                        pData={sPaymentData}
                        pServiceInfo={sServiceInfo}
                        userId={userId}
                    />
                    <PeriodStatistic
                        pData={sPaymentData}
                        pServiceInfo={sServiceInfo}
                        userId={userId}
                    />
                    <MenuStatistic
                        pData={sPaymentData}
                        userId={userId}
                    />
                    <BeerStatistic
                        pData={sPaymentData}
                        userId={userId}
                    />
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

SellerStatistic.propTypes = {
    pData: PropTypes.array,
};

SellerStatistic.defaultProps = {
    pData: [],
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(SellerStatistic);
