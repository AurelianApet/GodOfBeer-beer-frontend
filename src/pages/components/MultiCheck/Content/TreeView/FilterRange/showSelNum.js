import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LANG from '../../../../../../language';

class ShowSelNum extends Component {
    constructor(props) {
        super(props);
        this.state= {
            sSelNum: 0,
        }
    }

    componentDidMount() {
        const { onRef } = this.props;
        onRef( this );
        this.setState({ sSelNum : this.props.pSelNum });
    }

    handleRender = (aSelNum) => {
        this.setState({ sSelNum : aSelNum });
    }

    render() {
        return (
            <div className = "selectedDataShow">
                <span className="selectedData-numLabel">{LANG('BASIC_SELECT')} : </span>
                <span className="selectedData-number">{this.state.sSelNum}</span>
            </div>
        )
    }
}

ShowSelNum.propTypes = {
  pSelNum: PropTypes.number,
};

export default ShowSelNum;