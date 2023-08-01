import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';

import {executeQuery} from '../../../../library/utils/fetch';
import Loading from '../../../components/Loading';
import DateRangePicker from '../../../components/DateRange';
import {maskNumber, numberUnmask, unmask} from '../../../../library/utils/masks';
import BeerTable, { MODE_DATA, TYPE_NUMBER, TYPE_NO , TYPE_DATE} from '../../../components/BeerTable';
import moment from 'moment';
import cn from 'classnames';

class TapSellProvider extends Component {

    constructor(props) {
        super(props);
        let startDateOfMonth = new Date();
        startDateOfMonth.setDate(1);
        let endDateOfMonth = new Date();
        endDateOfMonth.setMonth(endDateOfMonth.getMonth() + 1);
        endDateOfMonth.setDate(1);
        endDateOfMonth.setDate(endDateOfMonth.getDate() - 1);
        this.state = {
            sWineList: [],
            sStartDate: moment(startDateOfMonth).format('YYYY-MM-DD'),
            sEndDate: moment(endDateOfMonth).format('YYYY-MM-DD'),
            sFetchStatus: false,
        }
    }

    componentDidMount = () => {
        const {sStartDate, sEndDate} = this.state;
        this.getWineInfo(sStartDate, sEndDate);
    };

    getWineInfo = (startdate, enddate) => {
        const userId = _.get(this.props, 'user._id') || '';
        executeQuery({
            method: 'post',
            url: `/tap/provider-sell`,
            data: {
                id : userId,
                start_date: startdate,
                end_date: enddate
            },
            success: (res) => {
                const beerList = _.get(res, 'beerList') || [];
                for(let i = 0 ; i < beerList.length ; i ++) {
                    beerList[i].draftCapacity = maskNumber( beerList[i].draftCapacity * 1 || 0) + " ml";
                    beerList[i].bottleCnt = maskNumber( beerList[i].bottleCnt * 1 || 0 );
                }
                this.setState({
                    sWineList: beerList,
                    sStartDate: startdate,
                    sEndDate: enddate,
                    sFetchStatus: true
                })
            },
            fail: (err) => {
    
            }
        })
      }

    handleShowBeerDetail = (value, dataItem, columnItem) => {
        const beerId = dataItem.id;
        this.props.history.push(`/provider/beerselldetail/${beerId}`);
    };

    handleChangeDateRange = (aStartDate, aEndDate) => {
      const startDate = moment(aStartDate).format('YYYY-MM-DD');
      const endDate = moment(aEndDate).format('YYYY-MM-DD');
      this.getWineInfo(startDate, endDate);
  };

    render() {
        const {sWineList, sFetchStatus, sStartDate, sEndDate} = this.state;
        if (sFetchStatus) {
            return (
                <div className="container-page-pubmanager-detail">
                    <div className="container-page-pubmanager-detail-background">
                        <div className='container-page-pubmanager'>
                            <div className = 'container-page-pubmanager-background'>
                                <div>
                                    <div className='period-statistic-header seller-statistic-header'>
                                    <div className='seller-statistic-title'></div>
                                        <DateRangePicker
                                            className='statistic-daterange'
                                            onApply={this.handleChangeDateRange}
                                            hasDefaultRange={true}
                                            startDate={sStartDate}
                                            endDate={sEndDate}
                                        />
                                    </div>
                                </div>
                            {
                                <BeerTable
                                onRef={(ref) => {this.beerTable = ref}}
                                mode={MODE_DATA}
                                pData={sWineList}
                                pColumns={[
                                    {
                                    type: TYPE_NO,
                                    title: 'NO.'
                                    },
                                    {
                                    name: 'name',
                                    title: '맥주',
                                    className: 'pub-detail-show',
                                    clickFunc: this.handleShowBeerDetail
                                    },
                                    {
                                    name: 'pubCnt',
                                    title: '판매매장', 
                                    type: TYPE_NUMBER
                                    },
                                    {
                                    name: 'draftCapacity',
                                    title: '판매용량(Draft)', 
                                    },
                                    {
                                    name: 'bottleCnt',
                                    title: '판매수량(Bottle&Can)', 
                                    type: TYPE_NUMBER
                                    },
                                ]}
                                />
                            }
                            </div>
                        </div>
                    </div>
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

TapSellProvider.propTypes = {};

TapSellProvider.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(TapSellProvider);
