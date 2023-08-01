import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import DateTimeComponent, {VIEW_MODE_MONTHS} from '../../../components/Form/DateTime';
import BeerCalendar from '../../../components/BeerCalendar';
import {Modal, ModalHeader, ModalBody} from '../../../components/Modal';
import {maskNumber, numberUnmask} from '../../../../library/utils/masks';
import {executeQuery} from "../../../../library/utils/fetch";
import {defineDaysOfMonth} from "../../../../library/utils/dateTime";

import {
    pushNotification,
    NOTIFICATION_TYPE_WARNING,
    NOTIFICATION_TYPE_SUCCESS,
    NOTIFICATION_TYPE_ERROR
} from '../../../../library/utils/notification';
import { params } from '../../../../params';
class MonthStatistic extends Component {

    constructor(props) {
        super(props);
        const now = new Date();
        this.state = {
            sYear: now.getFullYear(),
            sMonth: now.getMonth() + 1,
            sCalendarContent: {},
            sCalendarContentByDay: {},
            sCalendarContentDetail: {},
            totalInfo: {},
            dayInfo: [],
            daySum: [],
            weekSum: []
        }
    }

    componentDidMount = () => {
        const {sYear, sMonth} = this.state;
        this.getReadyData(this.props, {sYear, sMonth});
        this.getPaymentData();
    };

    getPaymentData() {
        const {sYear, sMonth} = this.state;
        const date = defineDaysOfMonth(sYear, sMonth);
        executeQuery({
            method: 'post',
            url: `/payment/fetchMonth`,
            data: {
                pubId: this.props.pubId,
                userId: this.props.userId,
                year: sYear,
                month: sMonth,
                days: date.days
            },
            success: (res) => {
                let dayInfo = res.dayInfo || {};
                let daySum = res.daySum || [];
                let weekSum = res.weekSum || [];
                let totalInfo = res.totalInfo || {};
                this.setState({
                    dayInfo,
                    daySum,
                    weekSum,
                    totalInfo,
                });
            },
            fail: (err, res) => {
            }
        })
    }

    componentWillReceiveProps(newProps) {
        const {sYear, sMonth} = this.state;
        this.getReadyData(newProps, {sYear, sMonth});
    }

    getReadyData = (aProps, aAdditionalState) => {
        const {pData, pServiceInfo} = aProps;
        let serviceInfo = {...pServiceInfo};
        const additionalState = aAdditionalState || {};
        const {sYear, sMonth} = additionalState;
        let calendarContent = {}, calendarContentByDay = {}, calendarContentDetail = {};
        _.map(pData, (dataItem, dataIndex) => {
            const dataItemDate = new Date(dataItem.sdate || '');
            const crrYear = dataItemDate.getFullYear();
            const crrMonth = dataItemDate.getMonth() + 1;
            const crrDate = dataItemDate.getDate();
            if (crrYear === sYear && crrMonth === sMonth) {
                const paidMoney = _.get(dataItem, 'payamt') * 1 || 0;
                const remainMoney = _.get(dataItem, 'cutamt') * 1 || 0;
                const usedPoint = _.get(dataItem, 'usedPoint') * 1 || 0;
                const orderId = _.get(dataItem, 'order_id');
                const service = _.get(serviceInfo, orderId) || 0;
                _.set(serviceInfo, orderId, 0);

                const crrPayCount = _.get(calendarContentDetail, `${crrDate}.payCount`) || 0;
                _.set(calendarContentDetail, `${crrDate}.payCount`, crrPayCount + 1);

                const crrPoint = _.get(calendarContentDetail, `${crrDate}.usedPoint`) || 0;
                _.set(calendarContentDetail, `${crrDate}.usedPoint`, crrPoint + usedPoint);

                const crrService = _.get(calendarContentDetail, `${crrDate}.service`) || 0;
                _.set(calendarContentDetail, `${crrDate}.service`, crrService + service);

                const crrPaidMoney = _.get(calendarContentDetail, `${crrDate}.paidMoney`) || 0;
                _.set(calendarContentDetail, `${crrDate}.paidMoney`, crrPaidMoney + (paidMoney + remainMoney));

                _.set(calendarContent, `${crrDate}`, maskNumber(crrPaidMoney + (paidMoney + remainMoney)));
                const crrCardPaid = _.get(calendarContentDetail, `${crrDate}.cardPaid`) || 0;
                _.set(calendarContentDetail, `${crrDate}.cardPaid`, crrCardPaid + (dataItem.payment_type === params.pay_card ? paidMoney : 0));

                const crrCashPaid = _.get(calendarContentDetail, `${crrDate}.cashPaid`) || 0;
                _.set(calendarContentDetail, `${crrDate}.cashPaid`, crrCashPaid + (dataItem.payment_type === params.pay_cash ? paidMoney : 0));

                const crrRemainMoney = _.get(calendarContentDetail, `${crrDate}.remainMoney`) || 0;
                _.set(calendarContentDetail, `${crrDate}.remainMoney`, crrRemainMoney + remainMoney);

                const crrTotal = _.get(calendarContentDetail, `${crrDate}.total`) || 0;
                _.set(calendarContentDetail, `${crrDate}.total`, crrTotal + (paidMoney + usedPoint + remainMoney + service));

                const crrDay = dataItemDate.getDay();
                const crrDayValue = calendarContentByDay[crrDay] || 0;
                calendarContentByDay[crrDay] = crrDayValue + (paidMoney + remainMoney);
            }
        });
        this.setState({
            sCalendarContent: calendarContent,
            sCalendarContentByDay: calendarContentByDay,
            sCalendarContentDetail: calendarContentDetail,
            ...additionalState,
        });
    };

    handleChangeDate = (aTarget, aDate) => {
        const date = new Date(aDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        this.getReadyData(this.props, {sYear: year, sMonth: month});
        setTimeout(() => {
            this.getPaymentData();
        }, 100);
    };

    handleClickCalendarCell = (aDate, type) => {
        this.setState({
            sSelectedDate: aDate,
            sType: type,
            sIsVisiblePaymentDetailModal: true,
        });
    };

    closePaymentDetailModal = () => {
        this.setState({
            sIsVisiblePaymentDetailModal: false,
        })
    };

    renderWeekSum = (aWeekNumber, aStartDate, aEndDate) => {
        const {dayInfo} = this.state;
        let result = 0;
        for (let i = Number(aStartDate); i <= Number(aEndDate); i++) {
            result += numberUnmask(dayInfo[i - 1] ? dayInfo[i - 1].day_sum + '' : '0');
        }
        return maskNumber(result);
    };

    renderDaySum = (aDay) => {
        const {daySum} = this.state;
        return maskNumber(daySum[aDay] ? daySum[aDay].price : 0);
    };

    renderTotalSum = (aStartDay, aEndDay, aMonthDay) => {
        const {totalInfo} = this.state;
        return maskNumber(totalInfo ? totalInfo.total_sum : 0);
    };

    render() {
        const {sYear, sMonth, sSelectedDate, sType, sIsVisiblePaymentDetailModal, dayInfo, daySum, weekSum, totalInfo} = this.state;
        const day = ["월", "화", "수", "목", "금", "토", "일"];
        let targetDetail = {};
        let title = sYear + "년 " + sMonth + "월";
        if(sType === 0) {
            targetDetail = dayInfo[sSelectedDate - 1] ? dayInfo[sSelectedDate - 1].dayDetail : {};
            title += " " + sSelectedDate + "일";
        } else if(sType === 1) {
            targetDetail = weekSum[sSelectedDate - 1] || {};
            title += " " + sSelectedDate + "주 합계";
        } else if(sType === 2) {
            targetDetail = daySum[sSelectedDate] || {};
            title += " " + day[sSelectedDate] + "요일 합계";
        } else if(sType === 3) {
            targetDetail = totalInfo || {};
            title += " 월 합계";
        }
        const secondTdStyle = {textAlign: 'right'};
        return (
            <div className='container-component-month-statistic'>
                <div className='month-statistic-header seller-statistic-header'>
                    <div className='seller-statistic-title'>월매출</div>
                    <DateTimeComponent
                        onChange={this.handleChangeDate}
                        timeFormat={false}
                        dateFormat={'YYYY년 M월'}
                        defaultValue={`${sYear}년 ${sMonth}월`}
                        viewMode={VIEW_MODE_MONTHS}
                    />
                </div>
                <BeerCalendar
                    pAdditionalField={true}
                    pContent={dayInfo}
                    pDate={{year: sYear, month: sMonth}}
                    pHandleClickCalendarCell={this.handleClickCalendarCell}
                    pWeekCustomRender={this.renderWeekSum}
                    pDayCustomRender={this.renderDaySum}
                    pFinalCustomRender={this.renderTotalSum}
                />
                {sIsVisiblePaymentDetailModal &&
                <Modal
                    isOpen={sIsVisiblePaymentDetailModal}
                    toggle={this.closePaymentDetailModal}
                    className='payment-detail-modal'
                >
                    <ModalHeader
                        toggle={this.closePaymentDetailModal}
                        className='payment-detail-modal-header'
                    >
                        <div className='payment-detail-date'>{`${title}`}</div>
                    </ModalHeader>
                    <ModalBody className='payment-detail-modal-body'>
                        <table>
                            <tbody>
                            <tr className='payment-detail-payment'>
                                <td>결제</td>
                            </tr>
                            <tr className='payment-detail-paycount'>
                                <td>결제건수</td>
                                <td style={secondTdStyle}>{maskNumber(targetDetail.payCnt || 0)}</td>
                            </tr>
                            <tr className='payment-detail-total'>
                                <td>결제금액</td>
                                <td style={secondTdStyle}>{maskNumber(targetDetail.payPrice || 0)}</td>
                            </tr>
                            <tr className='payment-detail-card'>
                                <td>카드</td>
                                <td style={secondTdStyle}>{maskNumber(targetDetail.card || 0)}</td>
                            </tr>
                            <tr className='payment-detail-total'>
                                <td>현금</td>
                                <td style={secondTdStyle}>{maskNumber(targetDetail.money || 0)}</td>
                            </tr>
                            <tr className='payment-detail-detail'>
                                <td>매출</td>
                            </tr>
                            <tr className='payment-detail-orderPrice'>
                                <td>주문금액</td>
                                <td style={secondTdStyle}>{maskNumber(targetDetail.orderPrice || 0)}</td>
                            </tr>
                            <tr className='payment-detail-pointcut'>
                                <td>할인/포인트</td>
                                <td style={secondTdStyle}>{maskNumber(targetDetail.point || 0)}</td>
                            </tr>
                            <tr className='payment-detail-serviceitem'>
                                <td>서비스</td>
                                <td style={secondTdStyle}>{maskNumber(targetDetail.service || 0)}</td>
                            </tr>
                            <tr className='payment-detail-total'>
                                <td>절사금액</td>
                                <td style={secondTdStyle}>{maskNumber(targetDetail.cutPrice || 0)}</td>
                            </tr>
                            <tr className='payment-detail-sellPrice'>
                                <td>실매출액</td>
                                <td style={secondTdStyle}>{maskNumber(targetDetail.sellPrice || 0)}</td>
                            </tr>
                            </tbody>
                        </table>
                    </ModalBody>
                </Modal>
                }
            </div>
        );
    }
}

MonthStatistic.propTypes = {
    pData: PropTypes.array,
    pServiceInfo: PropTypes.object,
    pubId: PropTypes.string
};

MonthStatistic.defaultProps = {
    pData: [],
    pServiceInfo: {},
    pubId: ''
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(MonthStatistic);
