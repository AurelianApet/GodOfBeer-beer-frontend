import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {executeQuery} from "../../../../library/utils/fetch";
import _ from "lodash";
import {NOTIFICATION_TYPE_ERROR, pushNotification} from "../../../../library/utils/notification";
import cn from 'classnames';

export class CommonOrder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sDate: '',
            busId: '',
            orderSeq: '',
            tableName: '',
            pubName: '',
            totalPrice: 0,
            menuList: []
        }
    }

    componentDidMount () {
        let searchString = this.props.location.search;
        if (searchString && searchString.indexOf('?') >= 0) {
            searchString = searchString.substr(1);
            let parts = searchString.split('&');
            let obj = {};
            for (let i = 0; i < parts.length; i ++) {
                let partItem = parts[i];
                if (partItem.indexOf('=') >= 0) {
                    let key = partItem.split('=')[0];
                    let val = partItem.split('=')[1];
                    obj[key] = val;
                }
            }
            this.setState(obj);
            this.getOrderInfo(obj);
        }
    }

    getOrderInfo = (obj) => {
        const {busId, tableNo} = obj;
        let url = '/pos/pub/order/info?tableNo=' + tableNo + '&busId=' + busId;
        executeQuery({
            method: 'get',
            url: url,
            success: ( res ) => {
                console.log(res);
                this.setState({
                    menuList: res.menuList,
                    pubName: res.pub_name,
                    tableName: res.table_name,
                    totalPrice: res.total_price
                })
            },
            fail: ( err ) => {
                const errResult = _.get(err, 'data.error');
                if (errResult) {
                    pushNotification(NOTIFICATION_TYPE_ERROR, errResult);
                }
            }
        })
    };

    filterCurrencyInt = (src) => {
        if (!src) src = 0;
        src = (src * 1).toFixed(2);
        const strSrc = src + "";
        let strPrefix = strSrc.split(".")[0];

        strPrefix = strPrefix.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return strPrefix;
    };

    render() {
        const {menuList, pubName, tableName, totalPrice} = this.state;
        return (
            <div className="mobile-order-info">
                <div className='pub-name-container'>
                    <label>{pubName}</label>
                    <label>{tableName}</label>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>메뉴</th>
                            <th>수량</th>
                            <th>금액</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        menuList.map((item, index) => (
                            <tr key={index} className={cn(index % 2 === 0 ? 'even' : 'odd')}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.amount}</td>
                                <td>{this.filterCurrencyInt(item.price)}</td>
                            </tr>
                        ))
                    }
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={4}>TOTAL {this.filterCurrencyInt(totalPrice)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
}

CommonOrder.propTypes = {
    location: PropTypes.object.isRequired,
};

CommonOrder.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            auth: state.auth,
        }),
        {}
    )
)(CommonOrder);

