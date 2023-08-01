import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import ModalImage from '../ModalImage'

class BreweryItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sBeerCount: 0
        }
    }

    componentDidMount = () => {
        this.getBeerCount(this.props);
    }

    componentWillReceiveProps = (newProps) => {
        this.getBeerCount(newProps);
    }

    getBeerCount = (aProps) => {
        const {pBreweryData, pBeerData} = aProps;
        const breweryId = _.get(pBreweryData, '_id') || '';
        const aBeerGroups = _.groupBy(pBeerData, 'brewery_id') || {};
        const beers = aBeerGroups[breweryId] || [];
        this.setState({sBeerCount: beers.length})
    }

    handlePushToDetail = () => {
        const {pBreweryData} = this.props;
        this.props.history.push(`/common/brewerys/detail/${pBreweryData._id}`);
    }

    render() {
        const {pBreweryData} = this.props;
        const {sBeerCount} = this.state;
        const breweryImg = pBreweryData.image || '';
        let breweryType = _.get(pBreweryData, 'type') || '';
        const address = pBreweryData.address || {};
        return (
            <div className='container-component-brewery-item'>
                <div className='brewery-item-image'>
                    <ModalImage
                        pContent={{src: breweryImg}}
                    />
                </div>
                <div className='brewery-detail-container'>
                    <div className='brewery-detail-item brewery-name'
                         onClick={this.handlePushToDetail}>{pBreweryData.name || ''}</div>
                    {
                        breweryType === 'abroad' &&
                        <div className='brewery-detail-item'>
                            <span>{`${_.get(pBreweryData, 'country') || ''} / ${_.get(pBreweryData, 'city') || ''}`}</span>
                            <span>{`${_.get(pBreweryData, 'uid.storeName') || ''}`}</span>
                            <span>{`${sBeerCount} Beers`}</span>
                        </div>
                    }
                    {
                        breweryType === 'domestic' &&
                        <div className='brewery-detail-item'>
                            <span>{`${address.zoncode || ''} ${address.roadAddress || ''} ${address.buildingName || ''}`}</span>
                            <span>{`${sBeerCount} Beers`}</span>
                        </div>
                    }

                </div>
            </div>
        );
    }
}

BreweryItem.propTypes = {
    pBreweryData: PropTypes.object,
    pBeerData: PropTypes.array,
};

BreweryItem.defaultProps = {
    pBreweryData: {},
    pBeerData: [],
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(BreweryItem);