import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import moment from 'moment';
import {connect} from 'react-redux';
import _ from 'lodash';

import NewChart, {CHART_SERIAL} from '../../../components/NewChart';

import {executeQuery} from '../../../../library/utils/fetch';
import {findIndexFromArray, findFromArray} from '../../../../library/utils/array';

import UserStatistic from './UserStatistic';
import FavouriteUsers from './FavouriteUsers';
import FavouriteSearchWords from './FavoutiteSearchWords';

const ONLINE_USERS_STATISTICS_ID = 'online-users-statistics';
const FAVOURITE_USERS_ID = 'favourite-users';
const FAVOURITE_SEARCH_WORDS_ID = 'favourite-search-word';

const FETCH_URLS = [
    {
        key: 'pageView',
        url: '/connect/fetchall',
        callback: (that, res) => {
            let {sOnlineUsers} = that.state;
            _.map(res, (resItem, resIndex) => {
                const crrDate = new Date(resItem.reg_datetime);
                const date = moment(crrDate).format('M-DD');
                const index = findIndexFromArray(sOnlineUsers, 'date', date);
                if (index || index === 0) {
                    const path = resItem.uid ? `[${index}].visitor` : `[${index}].pageView`;
                    const crrCount = _.get(sOnlineUsers, path) || 0;
                    _.set(sOnlineUsers, path, crrCount + 1);
                } else {
                    sOnlineUsers.push({
                        date: date,
                        dateString: moment(crrDate).format('YYYY-M-DD'),
                        pageView: resItem.uid * 1 ? 0 : 1,
                        visitor: resItem.uid * 1 ? 1 : 0,
                    });
                }
            });
            that.setState({
                sOnlineUsers: _.orderBy(sOnlineUsers, ['date'], ['asc']),
            })
        }
    },
    {
        key: 'searchKey',
        url: 'searchkey/fetchall',
        data: (res) => {
            let result = [];
            _.map(res, (resItem, resIndex) => {
                const crrKey = resItem.key || '';
                const index = findIndexFromArray(result, 'title', crrKey);
                const crrDate = new Date(resItem.reg_datetime);
                if (index || index === 0) {
                    const crrCount = _.get(result, `[${index}].count`) || 0;
                    let crrDateArray = _.get(result, `[${index}].dates`) || [];
                    crrDateArray.push(moment(crrDate).format('YYYY-MM-DD'));
                    _.set(result, `[${index}].count`, crrCount + 1);
                    _.set(result, `[${index}].dates`, crrDateArray);
                } else {
                    result.push({
                        title: crrKey,
                        count: 1,
                        dates: [moment(crrDate).format('YYYY-MM-DD')],
                    });
                }
            });
            return _.orderBy(result, ['count', 'title'], ['desc', 'asc']);
        }
    },
    {
        key: 'visit',
        url: '/visit/fetchall',
        data: (res) => {
            let result = {};
            _.map(res, (resItem, resIndex) => {
                const typeStr = ['beer', 'brewery', 'pub'];
                const crrType = typeStr[resItem.type * 1 || 0];
                let crrArray = result[crrType] || [];
                const crrName = resItem.name;
                const index = findIndexFromArray(crrArray, 'title', crrName);
                const crrDate = new Date(resItem.reg_datetime);
                if (index || index === 0) {
                    const crrCount = _.get(crrArray, `[${index}].count`) || 0;
                    let crrDateArray = _.get(crrArray, `[${index}].dates`) || [];
                    crrDateArray.push(moment(crrDate).format('YYYY-MM-DD'));
                    _.set(crrArray, `[${index}].count`, crrCount + 1);
                    _.set(crrArray, `[${index}].dates`, crrDateArray);
                } else {
                    crrArray.push({
                        title: crrName,
                        count: 1,
                        dates: [moment(crrDate).format('YYYY-MM-DD')],
                    })
                }
                result[crrType] = _.orderBy(crrArray, ['count', 'title'], ['desc', 'asc']);
            });
            return result;
        }
    }
];

class Statistics extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sFetchedData: {},
            sOnlineUsers: [],
        }
    }

    componentDidMount = () => {
        this.getData();
    };

    getData = () => {
        _.map(FETCH_URLS, (urlItem, urlIndex) => {
            this.getDataItem(urlItem);
        });
    };

    getDataItem = (aUrlItem) => {
        let {sFetchedData} = this.state;
        executeQuery({
            method: 'get',
            url: aUrlItem.url,
            success: (res) => {
                const result = res.docs || [];
                if (result.length > 0) {
                    if (aUrlItem.callback) {
                        aUrlItem.callback(this, result);
                    }
                    sFetchedData[aUrlItem.key] = aUrlItem.data ? aUrlItem.data(result) : result;
                    this.setState({
                        sFetchedData,
                    })
                }
            },
            fail: (err, res) => {
                setTimeout(() => {
                    this.getDataItem(aUrlItem);
                }, 5000);
            }
        })
    };

    getRecentData = () => {
        const {sOnlineUsers} = this.state;
        let resultOnline = [], resultMobile = [];
        for (let i = 14; i >= 0; i--) {
            let crrDate = new Date();
            crrDate.setDate(crrDate.getDate() - i);
            const crrDateString = moment(crrDate).format('YYYY-M-DD');
            const target = findFromArray(sOnlineUsers, 'dateString', crrDateString) || {
                date: moment(crrDate).format('M-DD'),
                pageView: 0,
                visitor: 0
            };
            resultOnline.push(target);
            resultMobile.push({
                date: moment(crrDate).format('M-DD'),
                pageView: 0,
                visitor: 0
            });
        }
        return {
            online: resultOnline,
            mobile: resultMobile,
        };
    };

    renderFavouriteTargetItem = (aKey, aTitle) => {
        const {sFetchedData} = this.state;
        const targetData = _.get(sFetchedData, aKey) || [];
        let resultHtml = [];
        resultHtml.push(
            <div key={`${aKey}-title`} className='statistic-container-item-title'>{aTitle}</div>
        );
        if (targetData.length > 0) {
            for (let i = 0; i < 5; i++) {
                const targetItem = _.get(targetData, `[${i}].title`) || '';
                if (targetItem) {
                    resultHtml.push(
                        <div key={`${aKey}-${i}`} className='favourite-item'>
                            <span className='favourite-item-heading'>{`${i + 1}.`}</span>
                            <span className='favourite-item-title'>{targetItem}</span>
                        </div>
                    );
                }
            }
        } else {
            resultHtml.push(
                <div key={`${aKey}-no-data`} className='favourite-item'>조회한 대상이 없습니다.</div>
            )
        }
        return (
            <div className='statistic-container-item'>
                {resultHtml}
            </div>
        );
    };

    render() {
        const {sOnlineUsers, sFetchedData} = this.state;
        const recentFifteenData = this.getRecentData();
        return (
            <div className='conatainer-page-statistic'>
                <div className="page-title">
                    통계
                </div>
                <div className='statistic-dashboard'>
                    <div className='statistic-online-mobile-users'>
                        <div className='statistic-item-title'>접속자통계</div>
                        <div className='statistic-container'>
                            <div className='online-users'>
                                <NewChart
                                    type={CHART_SERIAL}
                                    data={recentFifteenData.online}
                                    title={{
                                        visitor: '방문자',
                                        pageView: '페이지뷰',
                                    }}
                                    graphSetting={{
                                        mainAxis: 'date',
                                        graphType: {
                                            visitor: 'line',
                                            pageView: 'line',
                                        }
                                    }}
                                    theme={{}}
                                />
                                <div className='chart-title'>{'<웹>'}</div>
                            </div>
                            <div className='mobile-users'>
                                <NewChart
                                    type={CHART_SERIAL}
                                    data={recentFifteenData.mobile}
                                    title={{
                                        visitor: '방문자',
                                        pageView: '페이지뷰',
                                    }}
                                    graphSetting={{
                                        mainAxis: 'date',
                                        graphType: {
                                            visitor: 'line',
                                            pageView: 'line',
                                        }
                                    }}
                                    theme={{}}
                                />
                                <div className='chart-title'>{'<모바일>'}</div>
                            </div>
                        </div>
                    </div>
                    <div className='statistic-favourite-targets'>
                        <div className='favourite-users'>
                            <div className='statistic-item-title'>많이 조회한 대상</div>
                            <div className='statistic-container'>
                                {this.renderFavouriteTargetItem('visit.beer', '맥주')}
                                {this.renderFavouriteTargetItem('visit.brewery', '브루어리')}
                                {this.renderFavouriteTargetItem('visit.pub', '매장')}
                            </div>
                        </div>
                        <div className='favourite-searchword'>
                            <div className='statistic-item-title'>검색어</div>
                            <div className='statistic-container'>
                                {this.renderFavouriteTargetItem('searchKey', '검색어')}
                            </div>
                        </div>
                    </div>
                </div>
                <UserStatistic
                    id={ONLINE_USERS_STATISTICS_ID}
                    pData={sOnlineUsers}
                />
                <FavouriteUsers
                    id={FAVOURITE_USERS_ID}
                    pData={sFetchedData.visit || {}}
                />
                <FavouriteSearchWords
                    id={FAVOURITE_SEARCH_WORDS_ID}
                    pData={sFetchedData.searchKey || []}
                />
            </div>
        );
    }
}

Statistics.propTypes = {};

Statistics.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(Statistics);