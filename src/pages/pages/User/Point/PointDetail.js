import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import BeerTable, { MODE_DATA, TYPE_DATETIME } from '../../../components/BeerTable';
import { executeQuery } from '../../../../library/utils/fetch';
import _ from 'lodash';
import { compose } from 'redux';
import { connect } from 'react-redux';

class PointDetail extends Component {
	constructor(props) {
		super(props)
		this.state = {
			sData: []
    };
    this.columns = [
      {
        title: '날짜',
        name: 'createdAt',
        type:TYPE_DATETIME
      },
      {
        title: '매장',
        name: 'pubId.name',
      },
      {
        title: '포인트',
        name: 'point',
        thousandNumber: true,
      },
      {
        title: '구분',
        name: 'type',
      },
      {
        title: '잔여포인트',
        name: 'remain',
        thousandNumber: true,
      },
    ]
  }
  
  componentDidMount = () => {
    this.getPointData(this.props);
  }

  componentWillReceiveProps = (newProps) => {
    this.getPointData(newProps)
  }

  getPointData = (aProps) => {
    const userId = _.get( aProps, 'match.params.id' ) || '';
    if (userId) {
      executeQuery({
        method: 'get',
        url: `/point/fetchlist?uid=${userId}`,
        success: (res) => {
          const result = _.get(res, 'point') || [];
          this.setState({ sData: result });
        },
        fail: (err, res) => {
  
        }
      })
    }
  }

	/**
	 * handle functinos
	 **/

	/**
	 * process functions
	 **/


	/**
	 * render functions
	 **/
	render() {
    const { sData } = this.state;
		return (
      <div>
        <div className="container-page-user-pointdetail">
          <div className="pointdetail-table-title">맥주의 신 포인트</div>
          <BeerTable
            onRef={(ref) => {this.beerTable = ref}}
            mode={MODE_DATA}
            pColumns={this.columns}
            pData={sData}
          />
        </div>
      </div>
		);
	}
}

PointDetail.propTypes = {
};

PointDetail.defaultProps = {
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
    }),
  )
)(PointDetail);