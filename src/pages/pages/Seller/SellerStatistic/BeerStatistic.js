import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment';

import DateRangePicker from '../../../components/DateRange';
import NewChart, {CHART_SERIAL} from '../../../components/NewChart';

import {maskNumber} from '../../../../library/utils/masks';
import {executeQuery} from "../../../../library/utils/fetch";

class BeerStatistic extends Component {

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
            payData: [],
            payDataForChart: [],
            styleData: {}
        }
    }

    componentDidMount() {
        const {sStartDate, sEndDate} = this.state;
        this.getStatisticData(this.props, {sStartDate, sEndDate});
        this.getPaymentData(sStartDate, sEndDate);
    }

    componentWillReceiveProps(newProps) {
        const {sStartDate, sEndDate} = this.state;
        this.getStatisticData(newProps, {sStartDate, sEndDate});
        this.getPaymentData(sStartDate, sEndDate);
    }

    getStatisticData = (aProps, aAdditionalState) => {
        const {pData} = aProps;
        const additionalState = aAdditionalState || {};
        const {sStartDate, sEndDate} = additionalState;
        let statisticData = {}, statisticDataForChart = [], dutchPaid = {};
        _.map(pData, (dataItem, dataIndex) => {
            const dataItemDate = new Date(dataItem.updatedAt || '');
            const startDate = new Date(sStartDate);
            const endDate = new Date(sEndDate);
            const orderId = _.get(dataItem, 'orderId') || null;
            if (moment(dataItemDate).isSameOrAfter(moment(startDate)) && moment(dataItemDate).isSameOrBefore(moment(endDate))) {
                const orderMenus = dataItem.menuIds || [];
                _.map(orderMenus, (item) => {
                    const found = _.get(dutchPaid, orderId) || null;
                    if (found !== item.menuId && item.type === 'beer') {
                        const bottleType = item.bottleType || '';
                        const beerStyle = _.get(item.beerId, 'style') || '';

                        _.set(statisticData, `${bottleType}.${beerStyle}.style`, beerStyle);
                        _.set(statisticData, `${bottleType}.${beerStyle}.price`, (Math.round(item.price * 100 / (item.capacity || 1)) / 100));
                        const crrCapacity = _.get(statisticData, `${bottleType}.${beerStyle}.capacity`) || 0;
                        _.set(statisticData, `${bottleType}.${beerStyle}.capacity`, crrCapacity + (item.amount || 1) * (item.capacity || 0));
                        const crrTotal = _.get(statisticData, `${bottleType}.${beerStyle}.total`) || 0;
                        _.set(statisticData, `${bottleType}.${beerStyle}.total`, crrTotal + (item.amount || 1) * (item.price || 0));
                        if (item.isDutchPay) {
                            _.set(dutchPaid, orderId, item.menuId);
                        }
                    }
                });
            }
        });
        _.map(statisticData, (dataItem, dataIndex) => {
            _.map(dataItem, (item, index) => {
                statisticDataForChart.push({
                    beerName: index,
                    '매출': item.total,
                });
            })
        })
        statisticDataForChart = _.orderBy(statisticDataForChart, ['매출'], ['desc']);
        this.setState({
            sStatisticData: statisticData,
            sStatisticDataForChart: statisticDataForChart,
            ...additionalState,
        })
    };

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
            url: `/payment/fetchBeer`,
            data: data,
            success: (res) => {
                let chartData = [];
                for (let i = 0; i < Object.keys(res.styleData).length; i ++) {
                    chartData.push({
                        beerName: Object.keys(res.styleData)[i],
                        '매출': res.styleData[Object.keys(res.styleData)[i]],
                    })
                }
                this.setState({
                    payData: res.data,
                    styleData: res.styleData,
                    payDataForChart: chartData
                });
            },
            fail: (err, res) => {
            }
        })
    }

    handleChangeDateRange = (aStartDate, aEndDate) => {
        const startDate = moment(aStartDate).format('YYYY-MM-DD');
        const endDate = moment(aEndDate).format('YYYY-MM-DD');
        this.getStatisticData(this.props, {sStartDate: startDate, sEndDate: endDate});
        this.getPaymentData(startDate, endDate);
    };

    // renderBeerStatisticTable = () => {
    //     const {sStatisticData} = this.state;
    //     let capacitySum = 0, totalSum = 0;
    //     let tbodyHtml = [];
    //     const order = ['Draft', 'Bottle & Can'];
    //     _.map(order, (orderItem, orderIndex) => {
    //         const dataItem = sStatisticData[orderItem];
    //         const dataIndex = orderItem;
    //         let totalCapacity = 0, total = 0;
    //         let indexInteger = 0;
    //         _.map(dataItem, (item, index) => {
    //             totalCapacity += item.capacity || 0;
    //             total += item.total || 0;
    //             tbodyHtml.push(
    //                 <tr key={`${dataIndex}-${index}`}>
    //                     <td>{indexInteger === 0 && dataIndex}</td>
    //                     <td>{index}</td>
    //                     <td>{item.style}</td>
    //                     <td>{maskNumber(item.price)}</td>
    //                     <td>{maskNumber(item.capacity)}</td>
    //                     <td>{maskNumber(item.total)}</td>
    //                 </tr>
    //             );
    //             indexInteger++;
    //         });
    //         tbodyHtml.push(
    //             <tr key={`${dataIndex}-total-sum`} className='total-sum-tr'>
    //                 <td></td>
    //                 <td>합계</td>
    //                 <td></td>
    //                 <td></td>
    //                 <td>{maskNumber(totalCapacity)}</td>
    //                 <td>{maskNumber(total)}</td>
    //             </tr>
    //         );
    //         capacitySum += totalCapacity;
    //         totalSum += total;
    //     });
    //     tbodyHtml.push(
    //         <tr key='total-sum' className='final-sum-tr'>
    //             <td></td>
    //             <td>전체합계</td>
    //             <td></td>
    //             <td></td>
    //             <td>{maskNumber(capacitySum)}</td>
    //             <td>{maskNumber(totalSum)}</td>
    //         </tr>
    //     )
    //     return (
    //         <div className='beer-statistic-table'>
    //             <table>
    //                 <thead>
    //                 <tr>
    //                     <th>분류</th>
    //                     <th>맥주</th>
    //                     <th>스타일</th>
    //                     <th>단가</th>
    //                     <th>수량</th>
    //                     <th>매출</th>
    //                 </tr>
    //                 </thead>
    //                 <tbody>
    //                 {tbodyHtml}
    //                 </tbody>
    //             </table>
    //         </div>
    //     )
    // }

    renderBeerStatisticTable = () => {
        const {payData} = this.state;
        let totalSum = 0;
        let totalQuantity = 0;
        let tbodyHtml = [];

        _.map(payData, (menuItem, menuIndex) => {
            totalSum += menuItem.paid_price * 1;
            totalQuantity += menuItem.quantity * 1;
            tbodyHtml.push(
                <tr key={`${menuIndex}`}>
                    <td>{menuItem.name}</td>
                    <td>{menuItem.product_name}</td>
                    <td>{maskNumber(menuItem.product_unit_price * 1 || 0)}</td>
                    <td>{maskNumber(menuItem.quantity * 1 || 0)}</td>
                    <td>{maskNumber(menuItem.paid_price * 1 || 0)}</td>
                </tr>
            );
        });
        tbodyHtml.push(
            <tr key={`total-sum`} className='total-sum-tr'>
                <td></td>
                <td>합계</td>
                <td></td>
                <td>{maskNumber(totalQuantity || 0)}</td>
                <td>{maskNumber(totalSum || 0)}</td>
            </tr>
        );
        return (
            <div className='menu-statistic-table'>
                <table>
                    <thead>
                    <tr>
                        <th>분류</th>
                        <th>메뉴</th>
                        <th>단가</th>
                        <th>수량</th>
                        <th>매출</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tbodyHtml}
                    </tbody>
                </table>
            </div>
        )
    }

    renderBeerStatisticStyleTable = () => {
        const {styleData} = this.state;
        let totalSum = 0;
        let tbodyHtml = [];

        _.map(styleData, (menuItem, menuIndex) => {
            totalSum += menuItem * 1;
            tbodyHtml.push(
                <tr key={`${menuIndex}`}>
                    <td>{menuIndex}</td>
                    <td>{maskNumber(menuItem * 1 || 0)}</td>
                </tr>
            );
        });
        tbodyHtml.push(
            <tr key={`total-sum`} className='total-sum-tr'>
                <td>합계</td>
                <td>{maskNumber(totalSum || 0)}</td>
            </tr>
        );
        return (
            <div className='menu-statistic-table'>
                <table>
                    <thead>
                    <tr>
                        <th>스타일</th>
                        <th>매출</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tbodyHtml}
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        const {sStartDate, sEndDate, sStatisticDataForChart, payDataForChart} = this.state;
        return (
            <div className='container-component-beer-statistic'>
                <div className='beer-statistic-header seller-statistic-header'>
                    <div className='seller-statistic-title'>맥주 상세매출</div>
                    <DateRangePicker
                        className='statistic-daterange'
                        onApply={this.handleChangeDateRange}
                        hasDefaultRange={true}
                        startDate={sStartDate}
                        endDate={sEndDate}
                    />
                </div>
                {this.renderBeerStatisticTable()}
                {this.renderBeerStatisticStyleTable()}
                <NewChart
                    type={CHART_SERIAL}
                    data={payDataForChart}
                    graphSetting={{
                        mainAxis: 'beerName',
                        graphType: {
                            '매출': 'column',
                        }
                    }}
                    theme={{
                        hasBalloonText: true,
                        rotate: true,
                    }}
                />
            </div>
        );
    }
}

BeerStatistic.propTypes = {
    pData: PropTypes.array,
    pubId: PropTypes.string,
    userId: PropTypes.string
};

BeerStatistic.defaultProps = {
    pData: [],
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
)(BeerStatistic);
