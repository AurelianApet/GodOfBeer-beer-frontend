import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import NewChart, {CHART_SERIAL} from '../../../components/NewChart';
import DateRangePicker from '../../../components/DateRange';

import LANG from '../../../../language'
import {maskNumber} from '../../../../library/utils/masks';
import {defineDaysOfMonth} from "../../../../library/utils/dateTime";
import {executeQuery} from "../../../../library/utils/fetch";

const DATE_FORMAT = 'YYYY' + LANG('BASIC_YEAR') + 'M' + LANG('BASIC_MONTH') + 'D' + LANG('BASIC_DATE');

class PeriodStatistic extends Component {

    constructor(props) {
        super(props);
        let startDateOfMonth = new Date();
        startDateOfMonth.setDate(1);
        let endDateOfMonth = new Date();
        endDateOfMonth.setMonth(endDateOfMonth.getMonth() + 1);
        endDateOfMonth.setDate(1);
        endDateOfMonth.setDate(endDateOfMonth.getDate() - 1);
        this.state = {
            sStartDate: moment(startDateOfMonth).format('YYYY-MM-DD'),
            sEndDate: moment(endDateOfMonth).format('YYYY-MM-DD'),
            sStatisticData: {},
            sStatisticDataForChart: [],
            payData: {},
            payDataForChart: []
        }
    }

    componentDidMount() {
        const {sStartDate, sEndDate} = this.state;
        this.getStatisticData(this.props, {sStartDate, sEndDate});
        this.getPaymentData(sStartDate, sEndDate);
    }

    getPaymentData(startDate, endDate) {
        let data = {
            pubId: this.props.pubId,
            startDate: startDate,
            endDate: endDate
        };
        if (this.props.userId) {
            data.userId = this.props.userId;
        }
        executeQuery({
            method: 'post',
            url: `/payment/fetchPeriod`,
            data: data,
            success: (res) => {
                let payData = {};
                let payDataForChart = [];

                for (let i = 0; i < res.data.length; i ++) {
                    let date = res.data[i].date;
                    payData[date] = res.data[i];
                }

                for (let i = new Date(startDate); moment(i).isSameOrBefore(moment(new Date(endDate))); i.setDate(i.getDate() + 1)) {
                    const iString = moment(i).format(DATE_FORMAT);
                    const dString = moment(i).format('YYYY-MM-DD');
                    const targetData = payData[dString] || {};
                    payDataForChart.push({
                        realDate: i,
                        date: moment(i).format('M' + LANG('BASIC_MONTH') + 'D' + LANG('BASIC_DATE')),
                        '결제': targetData.paidAmount || 0,
                        '실매출': targetData.orderAmount || 0,
                        '카드매출': targetData.cardAmount || 0,
                        '현금매출': targetData.cashAmount || 0,
                    })
                }

                this.setState({payData, payDataForChart});
            },
            fail: (err, res) => {
            }
        })
    }

    componentWillReceiveProps(newProps) {
        const {sStartDate, sEndDate} = this.state;
        this.getStatisticData(newProps, {sStartDate, sEndDate});
        this.getPaymentData(sStartDate, sEndDate);
    }

    getStatisticData = (aProps, aAdditionalState) => {
        const {pData, pServiceInfo} = aProps;
        const serviceInfo = {...pServiceInfo};
        const additionalState = aAdditionalState || {};
        const {sStartDate, sEndDate} = additionalState;
        let statisticData = {};
        _.map(pData, (dataItem, dataIndex) => {
            const dataItemDate = new Date(dataItem.updatedAt || '');
            const dataItemDateString = moment(dataItemDate).format(DATE_FORMAT);
            const startDate = new Date(sStartDate);
            const endDate = new Date(sEndDate);
            if (moment(dataItemDate).isSameOrAfter(moment(startDate)) && moment(dataItemDate).isSameOrBefore(moment(endDate))) {
                const paidMoney = _.get(dataItem, 'paidMoney') || 0;
                const remainMoney = _.get(dataItem, 'remainMoney') || 0;
                const usedPoint = _.get(dataItem, 'usedPoint') || 0;

                const orderId = _.get(dataItem, 'orderId');
                const service = _.get(serviceInfo, orderId) || 0;
                _.set(serviceInfo, orderId, 0);

                const crrPayCount = _.get(statisticData, `${dataItemDateString}.payCount`) || 0;
                _.set(statisticData, `${dataItemDateString}.payCount`, crrPayCount + 1);

                const crrPoint = _.get(statisticData, `${dataItemDateString}.usedPoint`) || 0;
                _.set(statisticData, `${dataItemDateString}.usedPoint`, crrPoint + usedPoint);

                const crrService = _.get(statisticData, `${dataItemDateString}.service`) || 0;
                _.set(statisticData, `${dataItemDateString}.service`, crrService + service);

                const crrPaidMoney = _.get(statisticData, `${dataItemDateString}.paidMoney`) || 0;
                _.set(statisticData, `${dataItemDateString}.paidMoney`, crrPaidMoney + (paidMoney + remainMoney));

                const crrCardCount = _.get(statisticData, `${dataItemDateString}.cardCount`) || 0;
                _.set(statisticData, `${dataItemDateString}.cardCount`, crrCardCount + (dataItem.paymentType === 'CARD' ? 1 : 0));

                const crrCardPaid = _.get(statisticData, `${dataItemDateString}.cardPaid`) || 0;
                _.set(statisticData, `${dataItemDateString}.cardPaid`, crrCardPaid + (dataItem.paymentType === 'CARD' ? dataItem.paidMoney || 0 : 0));

                const crrCashCount = _.get(statisticData, `${dataItemDateString}.cashCount`) || 0;
                _.set(statisticData, `${dataItemDateString}.cashCount`, crrCashCount + (dataItem.paymentType === 'CASH' ? 1 : 0));

                const crrCashPaid = _.get(statisticData, `${dataItemDateString}.cashPaid`) || 0;
                _.set(statisticData, `${dataItemDateString}.cashPaid`, crrCashPaid + (dataItem.paymentType === 'CASH' ? dataItem.paidMoney || 0 : 0));

                const crrRemainMoney = _.get(statisticData, `${dataItemDateString}.remainMoney`) || 0;
                _.set(statisticData, `${dataItemDateString}.remainMoney`, crrRemainMoney + remainMoney);

                const crrTotal = _.get(statisticData, `${dataItemDateString}.total`) || 0;
                _.set(statisticData, `${dataItemDateString}.total`, crrTotal + (paidMoney + usedPoint + remainMoney + service));
            }
        });
        let statisticDataForChart = [];
        for (let i = new Date(sStartDate); moment(i).isSameOrBefore(moment(new Date(sEndDate))); i.setDate(i.getDate() + 1)) {
            const iString = moment(i).format(DATE_FORMAT);
            const targetData = statisticData[iString] || {};
            statisticDataForChart.push({
                realDate: i,
                date: moment(i).format('M' + LANG('BASIC_MONTH') + 'D' + LANG('BASIC_DATE')),
                '결제': targetData.total || 0,
                '실매출': targetData.paidMoney || 0,
                '카드매출': targetData.cardPaid || 0,
                '현금매출': targetData.cashPaid || 0,
            })
        }
        statisticDataForChart = _.sortBy(statisticDataForChart, ['realDate'], ['asc']);
        this.setState({
            sStatisticData: statisticData,
            sStatisticDataForChart: statisticDataForChart,
            ...additionalState,
        })
    };

    handleChangeDateRange = (aStartDate, aEndDate) => {
        const startDate = moment(aStartDate).format('YYYY-MM-DD');
        const endDate = moment(aEndDate).format('YYYY-MM-DD');
        this.getStatisticData(this.props, {sStartDate: startDate, sEndDate: endDate});
        this.getPaymentData(startDate, endDate);
    };

    renderPeriodStatisticTable = () => {
        const {sStatisticData, payData} = this.state;
        return (
            <div className='period-statistic-table'>
                <table>
                    <thead>
                    <tr>
                        <th>날짜</th>
                        <th>판매금액</th>
                        <th>할인/포인트</th>
                        <th>서비스</th>
                        <th>절사금액</th>
                        <th>실매출액</th>
                        <th>결제금액</th>
                        <th>카드</th>
                        <th>현금</th>
                        <th>이월잔액</th>
                        <th>선결제금액</th>
                        <th>사용금액</th>
                        <th>삭제금액</th>
                        <th>최종잔액</th>
                    </tr>
                    </thead>
                    <tbody>
                    {_.map(payData, (dataItem, dataIndex) => {
                        return (
                            <tr key={dataIndex}>
                                <td>{dataIndex}</td>
                                <td>{maskNumber(dataItem.orderAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.pointAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.serviceAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.dieAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.totalAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.paidAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.cardAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.cashAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.lastAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.preAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.useAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.deleteAmount || 0) || 0}</td>
                                <td>{maskNumber(dataItem.finalAmount || 0) || 0}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        const {sStartDate, sEndDate, sStatisticDataForChart, payDataForChart} = this.state;
        return (
            <div className='container-component-period-statistic'>
                <div className='period-statistic-header seller-statistic-header'>
                    <div className='seller-statistic-title'>기간별 매출</div>
                    <DateRangePicker
                        className='statistic-daterange'
                        onApply={this.handleChangeDateRange}
                        hasDefaultRange={true}
                        startDate={sStartDate}
                        endDate={sEndDate}
                    />
                </div>
                {this.renderPeriodStatisticTable()}
                <NewChart
                    type={CHART_SERIAL}
                    data={payDataForChart}
                    graphSetting={{
                        mainAxis: 'date',
                        graphType: {
                            '결제': 'line',
                            '실매출': 'line',
                            '카드매출': 'line',
                            '현금매출': 'line',
                        }
                    }}
                    theme={{
                        hasBalloonText: true,
                    }}
                />
            </div>
        );
    }
}

PeriodStatistic.propTypes = {
    pData: PropTypes.array,
    pServiceInfo: PropTypes.object,
    pubId: PropTypes.string,
    userId: PropTypes.string
};

PeriodStatistic.defaultProps = {
    pData: [],
    pServiceInfo: {},
    pubId: '',
    userId: ''
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(PeriodStatistic);
