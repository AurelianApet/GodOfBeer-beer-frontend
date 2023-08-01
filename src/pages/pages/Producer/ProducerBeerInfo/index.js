import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';

import {
    MODE_CREATE, MODE_UPDATE, MODE_READ,
} from '../../../components/APIForm';
import NewBeerEnroll from './NewBeerEnroll';
import {confirmAlertMsg} from '../../../../library/utils/confirmAlert';
import LANG from '../../../../language';
import BeerTable, {TYPE_NO, TYPE_IMG, TYPE_DETAIL, TYPE_TITLE} from '../../../components/BeerTable';
import RateViewer from '../../../components/RateViewer';
import {executeQuery} from '../../../../library/utils/fetch';
import {
    pushNotification,
    NOTIFICATION_TYPE_WARNING,
    NOTIFICATION_TYPE_SUCCESS
} from '../../../../library/utils/notification';

class ProducerBeerInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sUpdateId: '',
            sIsShowUpdateModal: false,
            sModalMode: MODE_READ,
            sColumns: [
                {
                    type: TYPE_NO,
                    title: 'No',
                },
                {
                    name: 'image',
                    title: '로고',
                    type: TYPE_IMG,
                },
                {
                    name: 'name',
                    title: '맥주명',
                    type: TYPE_TITLE,
                    clickFunc: this.handleClickBeerTable,
                    className: 'pointer font-bold'
                },
                {
                    name: 'description',
                    title: 'Information',
                    customRender: this.renderDescription
                }
            ]
        };
    }

    componentDidMount() {
    }

    /**
     * handle functinos
     **/

    handleModalShowChange = (aState, aComState) => {
        this.setState({
            sIsShowUpdateModal: aState,
        });
        if (aComState) {
            this.beerTable.refresh();
        }
    };

    handleClickBeerTable = (value, dataItem, columnItem) => {
        this.setState({
            sUpdateId: dataItem._id,
            sModalMode: MODE_UPDATE,
            sIsShowUpdateModal: true,
        })
    };

    handleCreateNewBeer = () => {
        this.setState({
            sIsShowUpdateModal: true,
            sModalMode: MODE_CREATE,
        })
    };

    handleDeleteBeer = () => {
        const {location: {pathname}} = this.props;
        const selectedBeer = this.beerTable.getCheckedItems();
        if (selectedBeer.length === 0) {
            pushNotification(NOTIFICATION_TYPE_WARNING, '선택된 데이터가 없습니다')
        } else {
            let confirmParam = {
                title: LANG('BASIC_DELETE'),
                detail: LANG('BASIC_ALERTMSG_DELETE_BEER'),
                confirmTitle: LANG('BASIC_ALERTMSG_YES'),
                noTitle: LANG('BASIC_ALERTMSG_NO'),
                confirmFunc: this.processDeleteBeer,
            };
            confirmAlertMsg(confirmParam, pathname);
        }
    };

    processDeleteBeer = () => {
        const selectedBeer = this.beerTable.getCheckedItems();
        let ids = [];
        _.map(selectedBeer, (beerItem, beerIndex) => {
            ids.push(beerItem._id);
        });
        if (ids.length > 0) {
            executeQuery({
                method: 'post',
                url: '/beer/multidel',
                data: {
                    ids,
                },
                success: (res) => {
                    const warnings = res.warnings || [];
                    if (warnings.length > 0) {
                        _.map(warnings, (warningItem, index) => {
                            pushNotification(NOTIFICATION_TYPE_WARNING, warningItem);
                        })
                    } else {
                        pushNotification(NOTIFICATION_TYPE_SUCCESS, '삭제가 완료되었습니다');
                        this.beerTable.refresh();
                    }
                },
                fail: (err, res) => {

                }
            })
        } else {
        }
    };


    /**
     * process functions
     **/


    /**
     * other functions
     **/


    /**
     * render functions
     **/

    renderDescription = (value, dataItem, columnItem) => {
        const pubs = dataItem.pubs || [];
        const reviews = dataItem.reviews || [];
        let rate = 0;
        _.map(reviews, (reviewItem, reviewIndex) => {
            rate += Number(reviewItem.marks) || 0;
        });
        if (reviews.length !== 0) {
            rate = rate / reviews.length;
            rate = Math.round(rate * 100) / 100;
        }
        return (
            <div>
                {/*<div>{dataItem.name}</div>*/}
                {/*<div>{dataItem.breweryId.beerName}</div>*/}
                <div style={{textAlign: 'left'}}>{`스타일: ${dataItem.styles} / 나라: ${dataItem.country}`}</div>
                <div style={{textAlign: 'left'}}>{`ABU: ${dataItem.alcohol}% / IBU : ${dataItem.ibu}`}</div>
                {/*<div>{`매 장 수 : ${pubs.length}개`}</div>*/}
                <div className='review-container' style={{justifyContent: 'flex-start'}}>
                    <RateViewer
                        value={rate}
                    />
                    <span className='rate-container'>{rate}</span>
                    <span>{`리뷰 (${reviews.length})`}</span>
                </div>
            </div>
        );
    };

    renderPhoto = (aRow, aColumn, aRowId) => {
        const url = _.get(aRow, 'avatar') || '';
        return (
            <div className='small-photo'>
                <img src={url || '/assets/images/producer/user-profile-not-found.jpeg'} onError={(e) => {
                    e.target.src = '/assets/images/producer/user-profile-not-found.jpeg'
                }} alt=''/>
            </div>
        )
    };

    renderBeerTable = () => {
        const {sColumns} = this.state;
        const userId = _.get(this.props, 'user._id') || '';
        if (userId) {
            return (
                <BeerTable
                    onRef={(ref) => {
                        this.beerTable = ref
                    }}
                    url={`/beer/fetchlist?uid=${userId}`}
                    getDataFunc={(res) => {
                        return res.beer || []
                    }}
                    pColumns={sColumns}
                    operation={{
                        multiCheck: true,
                    }}
                />
            )
        }

    };

    render() {
        const {sModalMode, sUpdateId, sIsShowUpdateModal} = this.state;
        return (
            <div className="container-page-producer-beerinfo">
                <div className="commonBorder border-style">
                    <div className="overflow">
                        <div className="panel-heading div-heading flex-heading">
                            <div id="header-title1"><p>등록한 맥주</p></div>
                            <div className="margin-bottom">
                                <button className="createBeer" onClick={this.handleCreateNewBeer}>추가</button>
                                <button className="createBeer" onClick={this.handleDeleteBeer}>삭제</button>
                            </div>
                        </div>
                        <div className="TableList">
                            {this.renderBeerTable()}
                        </div>
                    </div>
                </div>
                {sIsShowUpdateModal &&
                <NewBeerEnroll
                    handleModalClose={this.handleModalShowChange}
                    pMode={sModalMode}
                    pId={sUpdateId}
                />
                }
            </div>
        );
    }
}

ProducerBeerInfo.propTypes = {};

ProducerBeerInfo.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(ProducerBeerInfo);
