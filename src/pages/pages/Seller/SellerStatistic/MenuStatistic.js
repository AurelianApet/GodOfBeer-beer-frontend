import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment';

import DateRangePicker from '../../../components/DateRange';
import NewChart, {CHART_PIE} from '../../../components/NewChart';

import {maskNumber} from '../../../../library/utils/masks';
import {executeQuery} from "../../../../library/utils/fetch";
import LANG from "../../../../language";

class MenuStatistic extends Component {

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
            payDataForChart: []
        };
        this.otherMenus = [];
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
            url: `/payment/fetchMenu`,
            data: data,
            success: (res) => {
                let data = [];
                let beerSum = 0;
                let otherSum = 0;
                for (let i = 0; i < res.data.length; i ++) {
                    if (['셀프 TAP', 'Draft', 'Bottle & Can'].indexOf(res.data[i].name) >= 0) {
                        beerSum += res.data[i].paid_price * 1;
                    } else {
                        otherSum += res.data[i].paid_price * 1;
                    }
                }
                data = [{
                        type: '맥주',
                        value: beerSum,
                    },
                    {
                        type: '기타',
                        value: otherSum,
                    }];
                this.setState({
                    payData: res.data,
                    payDataForChart: data
                });
            },
            fail: (err, res) => {
            }
        })
    }

    getStatisticData = (aProps, aAdditionalState) => {
        const {pData} = aProps;
        const additionalState = aAdditionalState || {};
        const {sStartDate, sEndDate} = additionalState;
        let statisticData = {}, beerTotal = 0, otherTotal = 0;
        let dutchPaid = {};
        let otherMenus = {};

        _.map(pData, (dataItem, dataIndex) => {
            const dataItemDate = new Date(dataItem.updatedAt || '');
            const startDate = new Date(sStartDate);
            const endDate = new Date(sEndDate);
            const orderId = _.get(dataItem, 'orderId') || null;
            if (moment(dataItemDate).isSameOrAfter(moment(startDate)) && moment(dataItemDate).isSameOrBefore(moment(endDate))) {
                const orderMenus = dataItem.menuIds || [];
                _.map(orderMenus, (item) => {
                    const found = _.get(dutchPaid, orderId) || null;
                    if (found !== item.menuId) {
                        if (item.type === 'beer') {
                            const bottleType = item.bottleType || '';
                            const beerName = item.name || '';
                            _.set(statisticData, `${bottleType}.${beerName}.price`, (Math.round(item.price * 100 / (item.capacity || 1)) / 100));
                            const crrCapacity = _.get(statisticData, `${bottleType}.${beerName}.capacity`) || 0;
                            _.set(statisticData, `${bottleType}.${beerName}.capacity`, crrCapacity + (item.amount || 1) * (item.capacity || 0));
                            const crrTotal = _.get(statisticData, `${bottleType}.${beerName}.total`) || 0;
                            _.set(statisticData, `${bottleType}.${beerName}.total`, crrTotal + (item.amount || 1) * (item.price || 0));
                            if (item.isDutchPay) {
                                _.set(dutchPaid, orderId, item.menuId);
                            }

                            beerTotal += (item.amount || 1) * (item.price || 0);
                        } else if (item.type === 'food') {
                            const kind = item.kind || '';
                            const foodName = item.name || '';
                            _.set(statisticData, `${kind}.${foodName}.price`, item.price);
                            const crrCapacity = _.get(statisticData, `${kind}.${foodName}.capacity`) || 0;
                            _.set(statisticData, `${kind}.${foodName}.capacity`, crrCapacity + (item.amount || 1));
                            const no = item.no || 1;
                            _.set(statisticData, `${kind}.${foodName}.no`, no);
                            _.set(otherMenus, `${kind}`, no);
                            const crrTotal = _.get(statisticData, `${kind}.${foodName}.total`) || 0;
                            _.set(statisticData, `${kind}.${foodName}.total`, crrTotal + (item.amount || 1) * (item.price || 0));
                            if (item.isDutchPay) {
                                _.set(dutchPaid, orderId, item.menuId);
                            }
                            otherTotal += (item.amount || 1) * (item.price || 0);
                        }
                    }
                });
            }
        });

        this.otherMenus = [];
        _.map(otherMenus, (menuItem, menuIndex) => {
            this.otherMenus.push({
                name: menuIndex,
                no: menuItem,
            })
        })
        this.otherMenus = _.sortBy(this.otherMenus, ['no'], ['asc']);
        this.otherMenus = [{name: 'Draft'}, {name: 'Bottle & Can'}].concat(this.otherMenus);

        const statisticDataForChar = [
            {
                type: '맥주',
                value: beerTotal,
            },
            {
                type: '기타',
                value: otherTotal,
            }
        ];
        this.setState({
            sStatisticData: statisticData,
            sStatisticDataForChart: statisticDataForChar,
            ...additionalState,
        })
    }

    handleChangeDateRange = (aStartDate, aEndDate) => {
        const startDate = moment(aStartDate).format('YYYY-MM-DD');
        const endDate = moment(aEndDate).format('YYYY-MM-DD');
        this.getStatisticData(this.props, {sStartDate: startDate, sEndDate: endDate});
        this.getPaymentData(startDate, endDate);
    }

    // renderMenuStatisticTable = () => {
    //     const {sStatisticData} = this.state;
    //     let totalSum = 0;
    //     let tbodyHtml = [];
    //
    //     _.map(this.otherMenus, (menuItem, menuIndex) => {
    //         const dataIndex = menuItem.name;
    //         const dataItem = sStatisticData[dataIndex];
    //         let totalCapacity = 0, total = 0;
    //         let indexInteger = 0;
    //         _.map(dataItem, (item, index) => {
    //             totalCapacity += item.capacity || 0;
    //             total += item.total || 0;
    //             tbodyHtml.push(
    //                 <tr key={`${dataIndex}-${index}`}>
    //                     <td>{indexInteger === 0 && dataIndex}</td>
    //                     <td>{index}</td>
    //                     <td>{maskNumber(item.price || 0)}</td>
    //                     <td>{maskNumber(item.capacity || 0)}</td>
    //                     <td>{maskNumber(item.total || 0)}</td>
    //                 </tr>
    //             );
    //             indexInteger++;
    //         });
    //         tbodyHtml.push(
    //             <tr key={`${dataIndex}-total-sum`} className='total-sum-tr'>
    //                 <td></td>
    //                 <td>합계</td>
    //                 <td></td>
    //                 <td>{maskNumber(totalCapacity || 0)}</td>
    //                 <td>{maskNumber(total || 0)}</td>
    //             </tr>
    //         );
    //         totalSum += total;
    //     });
    //     tbodyHtml.push(
    //         <tr key='total-sum' className='final-sum-tr'>
    //             <td></td>
    //             <td>전체합계</td>
    //             <td></td>
    //             <td></td>
    //             <td>{maskNumber(totalSum || 0)}</td>
    //         </tr>
    //     )
    //     return (
    //         <div className='menu-statistic-table'>
    //             <table>
    //                 <thead>
    //                 <tr>
    //                     <th>분류</th>
    //                     <th>메뉴</th>
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

    renderMenuStatisticTable = () => {
        const {payData} = this.state;
        let totalSum = 0;
        let totalQuantity = 0;
        let totalService = 0;
        let tbodyHtml = [];

        _.map(payData, (menuItem, menuIndex) => {
            totalSum += menuItem.paid_price * 1;
            totalQuantity += menuItem.quantity * 1;
            totalService += menuItem.service * 1;
            tbodyHtml.push(
                <tr key={`${menuIndex}`}>
                    <td>{menuItem.name}</td>
                    <td>{menuItem.product_name}</td>
                    <td>{maskNumber(menuItem.product_unit_price * 1 || 0)}</td>
                    <td>{maskNumber(menuItem.quantity * 1 || 0)}</td>
                    <td>{maskNumber(menuItem.service * 1 || 0)}</td>
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
                <td>{maskNumber(totalService || 0)}</td>
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
                        <th>서비스</th>
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
            <div className='container-component-menu-statistic'>
                <div className='menu-statistic-header seller-statistic-header'>
                    <div className='seller-statistic-title'>메뉴별 상세매출</div>
                    <DateRangePicker
                        className='statistic-daterange'
                        onApply={this.handleChangeDateRange}
                        hasDefaultRange={true}
                        startDate={sStartDate}
                        endDate={sEndDate}
                    />
                </div>
                {this.renderMenuStatisticTable()}
                <NewChart
                    type={CHART_PIE}
                    data={payDataForChart}
                    graphSetting={{
                        mainAxis: 'type',
                        valueAxis: 'value',
                    }}
                    theme={{
                        hasBalloonText: true,
                    }}
                />
            </div>
        );
    }
}

MenuStatistic.propTypes = {
    pData: PropTypes.array,
    pubId: PropTypes.string,
    userId: PropTypes.string
};

MenuStatistic.defaultProps = {
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
)(MenuStatistic);
