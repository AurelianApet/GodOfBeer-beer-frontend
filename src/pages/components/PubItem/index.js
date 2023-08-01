import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';
import ModalImage from '../ModalImage'

class PubItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sBeerCount: 0
        }
    }

    componentDidMount = () => {
    };


    handlePushToDetail = () => {
        const {pData} = this.props;
        this.props.history.push(`/common/pubs/detail/${pData._id}`);
    };

    getAddress = () => {
        const {pData} = this.props;
        let result = '';
        const address = _.get(pData, 'uid.address') || {};
        const addressDetail = pData.uid.addressDetail;
        if (typeof address === 'object') {
            result = `${address.buildingName || ''} ${address.roadAddress || ''} ${addressDetail || ''} ${address.zonecode || ''}`;
        } else {
            result = address;
        }
        return result;
    };

    render() {
        const {pData} = this.props;
        const pubImg = _.get(pData, 'uid.image') || '';
        const address = this.getAddress();
        return (
            <div className='container-component-pub-item'>
                <div className='pub-item-image'>
                    <ModalImage
                        pContent={{src: pubImg}}
                    />
                </div>
                <div className='pub-detail-container'>
                    <div className="pub-detail-tag-content">
                        <div className='pub-detail-item pub-name'
                             onClick={this.handlePushToDetail}>
                            <label>{pData.name || ''}</label>
                            {
                                pData.point !== 2 && <span className={'point'}>포인트</span>
                            }
                        </div>


                    </div>
                    <div className='pub-detail-item'>
                        <span>{address}</span>
                    </div>
                    <div className='pub-detail-item'>
                        <span>{`${_.get(pData, 'count') || 0} Beers`}</span>
                    </div>
                </div>
            </div>
        );
    }
}

PubItem.propTypes = {
    pData: PropTypes.object,
};

PubItem.defaultProps = {
    pData: {},
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(PubItem);
