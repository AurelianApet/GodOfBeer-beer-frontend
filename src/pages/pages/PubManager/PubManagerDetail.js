import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';

import BeerTable, {MODE_DATA, TYPE_DATETIME} from '../../components/BeerTable';
import {executeQuery} from '../../../library/utils/fetch';
import Loading from '../../components/Loading';
import SellerMenuComponent from '../Seller/SellerMenu/SellerMenuComponent';
import SellerRemainComponent from '../../components/SellerRemain/index';
import cn from 'classnames';

class PubManagerDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sPubData: {},
            sFetchStatus: false,
            showTab: 1,
            sBeerRemainData: []
        }
    }

    componentDidMount = () => {
        this.getPubData();

    };

    getPubData = () => {
        const userId = _.get(this.props, 'match.params.id') || '';
        executeQuery({
            method: 'get',
            url: `/pub/fetchone?id=${userId}`,
            success: (res) => {
                const result = _.get(res, 'pub[0]') || {};
                const equipment = _.get(res, 'equipment') || {};
                this.setState({
                    sBeerRemainData: equipment,
                    sFetchStatus: true,
                    sPubData: result
                })
            },
            fail: (err) => {

            }
        })
    };

    handleShowSellerDetail = () => {
        const userId = _.get(this.props, 'match.params.id') || '';
        this.props.history.push(`/seller/sellerdetail/${userId}/sellerstatistic`);
    };

    handleShowTab = (val) => {
        this.setState({showTab: val});
    };

    render() {
        const {sPubData, sFetchStatus, showTab, sBeerRemainData} = this.state;
        const userId = _.get(this.props, 'match.params.id') || '';
        if (sFetchStatus) {
            return (
                <div className="container-page-pubmanager-detail">
                    <div className="container-page-pubmanager-detail-background">
                        <div className='pub-data-info-header-container'>
                            <div className="pub-data-info-title">{sPubData.name}</div>
                            <div>
                                <button className={cn('btn-seller-detail-show', showTab === 1 && 'active')} onClick={() => {this.handleShowTab(1)}}>메뉴등록</button>
                                <button className={cn('btn-seller-detail-show', showTab === 2 && 'active')} onClick={() => {this.handleShowTab(2)}}>맥주잔량</button>
                                {/*<button className="btn-seller-detail-show" onClick={this.handleShowSellerDetail}>매출보기</button>*/}
                            </div>
                        </div>
                        <div>
                            {
                                showTab === 1 &&
                                <SellerMenuComponent
                                    userKind={'id'}
                                    userId={userId}
                                />
                            }
                            {
                                showTab === 2 &&
                                <SellerRemainComponent
                                    sBeerRemainData={sBeerRemainData}
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

PubManagerDetail.propTypes = {};

PubManagerDetail.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(PubManagerDetail);
