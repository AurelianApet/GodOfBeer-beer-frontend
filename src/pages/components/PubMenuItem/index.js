import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {findFromArray} from '../../../library/utils/array';
import ModalImage from '../ModalImage';

class PubMenuItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sMenuKind: [],
        }
    }

    componentDidMount = () => {
        this.getMenuKind();
    };

    getMenuKind = () => {
        const {pMenuArray} = this.props;
        const sortedMenu = _.sortBy(pMenuArray, [function (menuItem) {
            return _.get(menuItem, 'no') || 0;
        }]);
        let menuKind = [];
        _.map(sortedMenu, (menu, index) => {
            const isSame = findFromArray(menuKind, 'kind', menu.kind);
            if (!isSame) {
                menuKind.push({
                    kind: menu.kind
                })
            }
        });
        this.setState({sMenuKind: menuKind})
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
        const {pMenuArray} = this.props;
        const {sMenuKind} = this.state;
        const sortedMenu = _.sortBy(pMenuArray, [function (menuItem) {
            return _.get(menuItem, 'no') || 0;
        }]);
        return (
            <div className='container-component-menu-item'>
                <div className='pub-menu-item-content'>
                    {
                        _.map(sMenuKind, (menuKind, kindIndex) => {
                            let contentHtml = [];
                            _.map(sortedMenu, (menuItem, index) => {
                                if (_.get(menuItem, 'kind') === menuKind.kind && !menuItem.isHidden) {
                                    contentHtml.push(
                                        <div key={`menu ${index}`} className='menu-item-content'>
                                            <div className='menu-item-image'>
                                                {
                                                    menuItem.image &&
                                                    <ModalImage
                                                        pContent={{src: menuItem.image}}
                                                        style={{
                                                            width: 80,
                                                            height: 80,
                                                            borderRadius: 15
                                                        }}/>
                                                }
                                            </div>
                                            <div className='menu-item'>
                                                <div className='menu-item-title'><span>{menuItem.foodName}</span></div>
                                                <div className='menu-item-info'>
                                                    <pre>{menuItem.content}</pre>
                                                </div>
                                                <div className='menu-item-price'><span>{this.filterCurrencyInt(menuItem.price)}</span></div>
                                            </div>
                                        </div>
                                    )
                                }
                            })
                            if (contentHtml.length > 0) {
                                return (
                                    <div key={`kind ${kindIndex}`}>
                                        <div className='menu-kind-title'>{menuKind.kind}</div>
                                        {contentHtml}
                                    </div>
                                )
                            }
                        })
                    }
                </div>

            </div>
        );
    }
}

PubMenuItem.propTypes = {
    pMenuArray: PropTypes.array,
};

PubMenuItem.defaultProps = {
    pMenuArray: [],
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(PubMenuItem);