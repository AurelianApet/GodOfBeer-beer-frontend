import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import BeerItem from '../BeerItem';
import moment from 'moment';
import { findFromArray } from '../../../library/utils/array';

class PubBeerMenuItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sRecentData: [],
			sIsMobileDimension: props.isMobileDimension,
    }
    this.bottleType = [
      'Draft',
      'Bottle & Can'
    ]
  }

  componentDidMount () {
    this.getRecentItem();
  }

  componentWillReceiveProps = ( newProps ) => {
		this.setState({
			sIsMobileDimension: newProps.isMobileDimension,
		})
	}

  getRecentItem = () => {
    const { pMenuArray } = this.props;
    let monthBeforeNow = new Date();
    let beerFilterArray = [];
    monthBeforeNow.setMonth(monthBeforeNow.getMonth() - 2);
    _.map( pMenuArray, (beerItem, beerIndex) => {
      const beer = _.get(beerItem, 'beer') || {};
      const date = new Date(beerItem.createdAt);
      if (moment(monthBeforeNow).isBefore(date)) {
        const crrBeerId = beer._id;
        const beerIdArray = findFromArray( beerFilterArray, 'beer._id', crrBeerId);
        if (!beerIdArray) {
          beerFilterArray.push(beerItem)
        }
      }
    }) 
    this.setState({ sRecentData: beerFilterArray });
  }

  renderBeerItem = (menu) => {
    const { pBeerArray } = this.props;
    const { sIsMobileDimension } = this.state;
    return (
      _.map (pBeerArray, (beer, index) => {
      
        if (_.get(menu, 'beer._id') === beer._id) {
          return (
            <BeerItem key = {index}
              pData={beer}
              isMobileDimension={sIsMobileDimension}
            />
          )
        }
      })
    )
  }

  render() {
    const { pMenuArray } = this.props;
    const { sRecentData } = this.state;
    let isRecentMenu = 0;
    return (
      <div className='container-component-beer-menu-item'>
        <div className="recent-beer-menu">
          <div className="recent-beer-menu-title">최근추가</div>
          <div className="recent-beer-menu-content">
          {
            _.map( sRecentData, (beer, index) => {
              isRecentMenu = 1;
              return (
                  this.renderBeerItem(beer)
              )
            })
          }
          {
            isRecentMenu === 0 &&
            <div>없음</div>
          }
          </div>
        </div>
        <div className="recent-beer-menu">
          {
            _.map(this.bottleType, (type, index) => {
              let isMenu = 0;
              return (
                <div key = {`bottleType - ${index}`}>
                  <div className="type-beer-menu-title">{type}</div>
                  <div className="type-beer-menu-content">
                  {
                    _.map( pMenuArray, (menu, index) => {
                        if (menu.bottleType === type) {
                          isMenu = 1;
                          return (
                            this.renderBeerItem(menu)
                          )
                        }
                    })
                  }
                  {
                    (isMenu === 0) &&
                    <div>없음</div>
                  }
                  </div>
                </div>
              )
            })
          }
        </div>
        
      </div>
    );
  }
}

PubBeerMenuItem.propTypes = {
  pMenuArray: PropTypes.array,
  pBeerArray: PropTypes.array
};

PubBeerMenuItem.defaultProps = {
  pMenuArray: [],
  pBeerArray: []
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(PubBeerMenuItem);