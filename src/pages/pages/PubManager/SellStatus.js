import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import BeerTable, {TYPE_NO, TYPE_DATE, TYPE_NUMBER, ALIGN_LEFT} from '../../components/BeerTable';
import DateRangePicker from "../../components/DateRange";
import moment from "moment";

class SellStatus extends Component {

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
        }
    }

    componentDidMount = () => {
    };

    pubDetailShow = (value, dataItem, columnItem) => {
        this.props.history.push(`/seller/sellerdetail/${dataItem._id}/sellerstatistic`);
    };

    handleChangeDateRange = (aStartDate, aEndDate) => {
        const startDate = moment(aStartDate).format('YYYY-MM-DD');
        const endDate = moment(aEndDate).format('YYYY-MM-DD');
        // this.getStatisticData(this.props, {sStartDate: startDate, sEndDate: endDate});
        // this.getPaymentData(startDate, endDate);
        this.setState({sStartDate: startDate, sEndDate: endDate});
    };

    renderGraph = (value, dataItem, columnItem) => {
        return (
            <div className={'sell-status-graph'}>
                <div style={{width: value + '%'}}></div>
            </div>
        )
    };

    render() {
        const {sStartDate, sEndDate} = this.state;

        const userId = _.get(this.props, 'user._id');
        return (
            <div className='container-page-sellstatus'>
                <div className='container-page-pubmanager-background'>
                    <div className='pub-data-info-title'>
                        매출조회
                        <DateRangePicker
                            className='statistic-daterange'
                            onApply={this.handleChangeDateRange}
                            hasDefaultRange={true}
                            startDate={sStartDate}
                            endDate={sEndDate}
                        />
                    </div>
                    {
                        <BeerTable
                            onRef={(ref) => {
                                this.beerTable = ref
                            }}
                            url={`/pub/sell-status?id=${userId}&startDate=${sStartDate}&endDate=${sEndDate}`}
                            pColumns={[
                                {
                                    type: TYPE_NO,
                                    title: 'NO.'
                                },
                                {
                                    name: 'name',
                                    title: '매장명',
                                    className: 'pub-detail-show',
                                    clickFunc: this.pubDetailShow
                                },
                                {
                                    name: 'total',
                                    title: '매출',
                                    type: TYPE_NUMBER,
                                    thousandNumber: true
                                },
                                {
                                    name: 'percent',
                                    title: '그래프',
                                    align: ALIGN_LEFT,
                                    customRender: this.renderGraph
                                }
                            ]}
                        />
                    }
                </div>
            </div>
        );
    }
}

SellStatus.propTypes = {};

SellStatus.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(SellStatus);
