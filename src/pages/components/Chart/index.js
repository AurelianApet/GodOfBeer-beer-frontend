import React, { Component } from 'react';
import PropTypes from 'prop-types';

export const CHART_PIE = 1;
export const CHART_CYLINDER = 2;
export const CHART_INTERACTIVE = 3;
export const CHART_CIRCLE = 4;
export const CHART_STACK = 5;
export const CHART_BARLINE = 6;
export const CHART_DYNAMIC = 7;


global.gChartID = 0;

class Chart extends Component {

  constructor(props) {
    super(props);
    global.gChartID++;
    this.state = {
      sIdName: this.getIdName(props.type),
    }
  }

  componentDidMount() {
    this.chooseChart_init(this.props);
  }
  componentWillReceiveProps(newProps) {
    if(newProps.type !== CHART_DYNAMIC)
      this.chooseChart_init(newProps);
  }

  chooseChart_init = (props) => {
    switch(props.type)
    {
      case CHART_PIE:
        window.onDidMount_pieChart_init(this.state.sIdName, props.data);
        break;
      case CHART_CYLINDER:
        window.onDidMount_cylinderChart_init(this.state.sIdName, props.data);
        break;
      case CHART_INTERACTIVE:
        window.onDidMount_interactiveChart_init(this.state.sIdName, props.data);
        break;
      case CHART_CIRCLE:
        window.onDidMount_circleChart_init(this.state.sIdName, props.data);
        break;
      case CHART_STACK:
        window.onDidMount_stackChart_init(this.state.sIdName, props.data);
        break;
      case CHART_BARLINE:
        window.onDidMount_barlineChart_init(this.state.sIdName, props.data, props.title);
        break;
      case CHART_DYNAMIC:
        window.onDidMount_dynamicChart_init(this.state.sIdName, props.data);
        break;
      default:
        break;
    }
  }
  
  getIdName = (type) => {
    let sIdName = "";
    switch(type)
    {
      case CHART_PIE:
        sIdName = "pieChart" + global.gChartID;
        break;
      case CHART_CYLINDER:
        sIdName = "cylinderChart" + global.gChartID;
        break;
      case CHART_INTERACTIVE:
        sIdName = "interactiveChart" + global.gChartID;
        break;
      case CHART_CIRCLE:
        sIdName = "circleChart" + global.gChartID;
        break;
      case CHART_STACK:
        sIdName = "stackChart" + global.gChartID;
        break;
      case CHART_BARLINE:
        sIdName = "barAndLineChart" + global.gChartID;
        break;
      case CHART_DYNAMIC:
        sIdName = "dynamicChart" + global.gChartID;
        break;
      default:
        break;
    }
    return sIdName;
  }

  render() {
    return (
      <div className="chart-container"> 
        <div 
          className="chart-body" 
          id={this.state.sIdName} 
          style={{ height: "400px" }} 
        />
      </div>
    )
  }
}

Chart.propTypes = {
  type: PropTypes.number.isRequired,
  data: PropTypes.array,
  title: PropTypes.object,
};

Chart.defaultProps = {
  title: {
    column: '',
    line: '',
    line2: '',
  },
  data: [],
};

export default Chart;