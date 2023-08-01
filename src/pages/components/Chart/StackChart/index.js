import React, { Component } from 'react';
import PropTypes from 'prop-types';

class StackChart extends Component {

  constructor(props) {
    super(props);
    global.gChartID++;
    this.state = {
      sIdName: "StackChart" + global.gChartID,
    };
  }
  
  componentDidMount() {
    window.onDidMount_stackChart_init(this.state.sIdName, this.props.data);
  }

  render() {
    return (
      <div className="stackchart-container"> 
        <div className="stackchart-body" id={this.state.sIdName} style={{ height: "400px" }} />
      </div>
    )
  }
}

StackChart.propTypes = {
  data: PropTypes.array.isRequired,
};

export default StackChart;