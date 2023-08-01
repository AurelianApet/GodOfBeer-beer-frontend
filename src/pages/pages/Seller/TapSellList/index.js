import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';

import {executeQuery} from '../../../../library/utils/fetch';
import Loading from '../../../components/Loading';
import TapSellListView from '../TapSellList/TapSellListView';
import WineSellListView from '../TapSellList/WineSellListView';
import cn from 'classnames';

class TapSellList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sTapList: [],
            sWineList: [],
            sFetchStatus: false,
            showTab: 1,
        }
    }

    componentDidMount = () => {
        this.getPubData();
    };

    getPubData = () => {
        const userId = _.get(this.props, 'user._id') || '';
        executeQuery({
            method: 'get',
            url: `/tap/tap-sell?id=${userId}`,
            success: (res) => {
                const taplist = _.get(res, 'taplist') || [];
                const winelist = _.get(res, 'winelist') || [];
                this.setState({
                    sTapList: taplist,
                    sWineList: winelist,
                    sFetchStatus: true,
                })
            },
            fail: (err) => {

            }
        })
    };

    handleShowSellerDetail = () => {
        const userId = _.get(this.props, 'match.params._id') || '';
        this.props.history.push(`/seller/tapsell/${userId}`);
    };

    handleShowTab = (val) => {
        this.setState({showTab: val});
    };

    render() {
        const {sTapList, sWineList, sFetchStatus, showTab} = this.state;
        const userId = _.get(this.props, 'match.params.id') || '';
        if (sFetchStatus) {
            return (
                <div className="container-page-pubmanager-detail">
                    <div className="container-page-pubmanager-detail-background">
                        <div className='pub-data-info-header-container row'>
                            <div className='col-md-offset-8 col-md-4'>
                                <button className={cn('btn-seller-detail-show', showTab === 1 && 'active')} onClick={() => {this.handleShowTab(1)}}>TAP별</button>
                                <button className={cn('btn-seller-detail-show', showTab === 2 && 'active')} onClick={() => {this.handleShowTab(2)}}>상품별</button>
                            </div>
                        </div>

                        <div>
                            {
                                showTab === 1 &&
                                <TapSellListView
                                    sTapList={sTapList}
                                />
                            }
                            {
                                showTab === 2 &&
                                <WineSellListView
                                    sWineList={sWineList}
                                />
                            }
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

TapSellList.propTypes = {};

TapSellList.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(TapSellList);
