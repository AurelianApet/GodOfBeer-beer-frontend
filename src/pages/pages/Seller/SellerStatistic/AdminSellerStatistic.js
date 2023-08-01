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

class AdminSellerStatistic extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sPaymentData: [],
            sServiceInfo: {},
            sFetchStatus: false,
        }
    }

    componentDidMount() {
        this.getPaymentData(this.props);
    }

    componentWillReceiveProps(newProps) {
        this.getPaymentData(newProps);
    }

    getPaymentData = (aProps) => {
        const userId = _.get(aProps, 'match.params.id') || '';
        if (userId) {
            this.setState({
                sFetchStatus: true,
                sPaymentData: [],
                sServiceInfo: {}
            })
            // executeQuery({
            //     method: 'get',
            //     url: `/payment/fetchlist?pubId=${userId}`,
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
        }
    }

    render() {
        const {sPaymentData, sFetchStatus, sServiceInfo} = this.state;
        const userId = _.get(this.props, 'match.params.id') || '';
        if (sFetchStatus) {
            return (
                <div className='container-page-seller-statistic'>
                    <MonthStatistic
                        pData={sPaymentData}
                        pServiceInfo={sServiceInfo}
                        pubId={userId}
                    />
                    <PeriodStatistic
                        pData={sPaymentData}
                        pServiceInfo={sServiceInfo}
                        pubId={userId}
                    />
                    <MenuStatistic
                        pData={sPaymentData}
                        pubId={userId}
                    />
                    <BeerStatistic
                        pData={sPaymentData}
                        pubId={userId}
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

AdminSellerStatistic.propTypes = {
    pData: PropTypes.array,
};

AdminSellerStatistic.defaultProps = {
    pData: [],
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(AdminSellerStatistic);
