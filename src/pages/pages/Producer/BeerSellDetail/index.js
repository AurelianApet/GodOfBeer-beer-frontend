import React, {Component} from 'react';
import PropTypes, { number } from 'prop-types';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';

import {executeQuery} from '../../../../library/utils/fetch';
import Loading from '../../../components/Loading';
import DateRangePicker from '../../../components/DateRange';
import {maskNumber, numberUnmask} from '../../../../library/utils/masks';
import BeerTable, { MODE_DATA, TYPE_NUMBER, TYPE_NO , TYPE_DATE} from '../../../components/BeerTable';
import moment from 'moment';
import cn from 'classnames';

class BeerSellDetail extends Component {

    constructor(props) {
        super(props);
        let startDateOfMonth = new Date();
        startDateOfMonth.setDate(1);
        let endDateOfMonth = new Date();
        endDateOfMonth.setMonth(endDateOfMonth.getMonth() + 1);
        endDateOfMonth.setDate(1);
        endDateOfMonth.setDate(endDateOfMonth.getDate() - 1);
        this.state = {
            sPubList: [],
            sBeerName: '',
            sDraftTotal: '0',
            sBottleTotal: '0',
            sStartDate: moment(startDateOfMonth).format('YYYY-MM-DD'),
            sEndDate: moment(endDateOfMonth).format('YYYY-MM-DD'),
            sFetchStatus: false,
        }
    }

    componentDidMount = () => {
        const {sStartDate, sEndDate} = this.state;
        this.getPubInfo(sStartDate, sEndDate);
    };

    getPubInfo = (startdate, enddate) => {
        const beerId = _.get(this.props, 'match.params.id') || '';
        executeQuery({
            method: 'post',
            url: `/tap/provider-selldetail`,
            data: {
                id : beerId,
                start_date: startdate,
                end_date: enddate
            },
            success: (res) => {
                const pubList = _.get(res, 'pubList') || [];
                for(let i = 0 ; i < pubList.length ; i ++) {
                    pubList[i].draftCapacity = maskNumber( pubList[i].draftCapacity * 1 || 0 ) + " ml";
                    pubList[i].bottleCnt = maskNumber( pubList[i].bottleCnt * 1 || 0 );
                }
                const beerName = _.get(res, 'beer_name') || [];
                let draftTotal = _.get(res, 'draftTotal') * 1 || 0;
                draftTotal = maskNumber( draftTotal ) + " ml";
                let bottleTotal = _.get(res, 'bottleTotal') * 1 || 0;
                bottleTotal = maskNumber( bottleTotal );
                this.setState({
                    sPubList: pubList,
                    sBeerName: beerName,
                    sStartDate: startdate,
                    sDraftTotal: draftTotal,
                    sBottleTotal: bottleTotal,
                    sEndDate: enddate,
                    sFetchStatus: true
                })
            },
            fail: (err) => {
    
            }
        })
      }

    handleChangeDateRange = (aStartDate, aEndDate) => {
      const startDate = moment(aStartDate).format('YYYY-MM-DD');
      const endDate = moment(aEndDate).format('YYYY-MM-DD');
      this.getPubInfo(startDate, endDate);
  };

    render() {
        const {sPubList, sBeerName, sBottleTotal, sDraftTotal, sFetchStatus, sStartDate, sEndDate} = this.state;
        if (sFetchStatus) {
            return (
                <div className="container-page-pubmanager-detail">
                    <div className="container-page-pubmanager-detail-background">
                        <div className='container-page-pubmanager'>
                            <div className = 'container-page-pubmanager-background'>
                                <div>
                                    <div className='period-statistic-header seller-statistic-header'>
                                    <div className='seller-statistic-title'>맥주:{sBeerName}</div>
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
                                pData={sPubList}
                                pColumns={[
                                    {
                                    type: TYPE_NO,
                                    title: 'NO.'
                                    },
                                    {
                                    name: 'name',
                                    title: '판매매장',
                                    },
                                    {
                                    name: 'address',
                                    title: '주소',
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
                            
                                <div className='row'>
                                    <div className='col-md-offset-4 col-md-8'>
                                        <div className = 'pub-data-info-title col-sm-2'>Total</div>     
                                        <div className = 'pub-data-info-title col-sm-4'>{sDraftTotal}</div>     
                                        <div className = 'pub-data-info-title pub-data-info-beer col-sm-6'>{sBottleTotal}</div>              
                                    </div>
                                </div>
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

BeerSellDetail.propTypes = {};

BeerSellDetail.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(BeerSellDetail);
