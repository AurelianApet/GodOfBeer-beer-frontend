import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export const CHART_BARLINE = 1;
export const CHART_PIE = 2;
export const CHART_SERIAL = 3;


global.gChartID = 0;

class NewChart extends Component {

  constructor(props) {
    super(props);
    global.gChartID++;
    this.state = {
      sIdName: this.getIdName( props.type ),
    }
  }

  componentDidMount() {
    this.chooseChart_init( this.props );
  }

  componentWillReceiveProps( newProps ) {
    this.chooseChart_init( newProps );
  }

  chooseChart_init = ( props ) => {
    const { data, title, theme, graphSetting } = props;
    const { sIdName } = this.state;
    let graph = [];
    let graphType = {};
    switch( props.type )
    {
      case CHART_PIE:
        window.onDidMount_pieChart_init(this.state.sIdName, props.data, theme, graphSetting);
        break;
      case CHART_SERIAL:
        graphType = graphSetting.graphType || {};
        _.map( graphType, ( typeItem, typeIndex ) => {
          if ( typeItem === 'column' ) {
            graph.push({
              balloonText: theme.hasBalloonText? "<span style='font-size:13px;'>[[category]]의 [[title]]:<b>[[value]]</b></span>" : "",
              title: title[typeIndex] || typeIndex,
              type: "column",
              fillAlphas: 0.8,
              valueField: typeIndex
            })
          } else {
            graph.push({
              balloonText: theme.hasBalloonText? "<span style='font-size:13px;'>[[category]]의 [[title]]:<b>[[value]]</b></span>" : "",
              bullet: theme.bullet || 'round',
              bulletBorderAlpha: 1,
              bulletColor: theme.bulletColor || '#FFFFFF',
              useLineColorForBulletBorder: true,
              fillAlphas: 0,
              lineThickness: theme.lineThickness || 2,
              lineAlpha: theme.lineAlpha || 1,
              bulletSize: theme.bulletSize || 7,
              title: title[typeIndex] || typeIndex,
              valueField: typeIndex
            })
          }
        });
        graphSetting.graph = graph;
        window.onDidMount_serialChart_init(this.state.sIdName, props.data, theme, graphSetting);
        break;
      case CHART_BARLINE:
        graphType = graphSetting.graphType || {};
        _.map( graphType, ( typeItem, typeIndex ) => {
          if ( typeItem === 'column' ) {
            graph.push({
              alphaField: 'alpha',
              balloonText: theme.hasBalloonText? "<span style='font-size:13px;'>[[title]] in [[category]]:<b>[[value]]</b> [[additional]]</span>" : "",
              dashLengthField: 'dashLengthColumn',
              fillAlphas: 1,
              title: title[typeIndex] || typeIndex,
              type: 'column',
              valueField: typeIndex
            });
          } else {
            graph.push({
              balloonText: theme.hasBalloonText? "<span style='font-size:13px;'>[[category]]의 [[title]]:<b>[[value]]</b> [[additional]]</span>" : "",
              bullet: theme.bullet || 'round',
              dashLengthField: 'dashLengthLine',
              lineThickness: theme.lineThickness || 3,
              bulletSize: theme.bulletSize || 7,
              bulletBorderAlpha: 1,
              bulletColor: theme.bulletColor || '#FFFFFF',
              useLineColorForBulletBorder: true,
              bulletBorderThickness: 3,
              fillAlphas: 0,
              lineAlpha: theme.lineAlpha || 1,
              title: title[typeIndex] || typeIndex,
              valueField: typeIndex
          })
          }
        });
        graphSetting.graph = graph;
        window.onDidMount_barlineChart_init( sIdName, data, title, theme, graphSetting );
        break;
      default:
        break;
    }
  }
  
  getIdName = ( type ) => {
    let sIdName = 'default' + global.gChartID;
    switch(type)
    {
      case CHART_PIE:
        sIdName = 'pieChart' + global.gChartID;
        break;
      case CHART_BARLINE:
        sIdName = 'barAndLineChart' + global.gChartID;
        break;
      default:
        break;
    }
    return sIdName;
  }

  render() {
     const { sIdName } = this.state;
    return (
      <div className='chart-container'> 
        <div 
          className='chart-body' 
          id={sIdName} 
          style={{ height: '400px', width: '100% !important' }} 
        />
      </div>
    )
  }
}

NewChart.propTypes = {
  type: PropTypes.number.isRequired,
  data: PropTypes.array,
  graphSetting: PropTypes.object,
  title: PropTypes.object,
  theme: PropTypes.object,
};

NewChart.defaultProps = {
  title: {
    column: '',
    line: '',
    line2: '',
  },
  data: [],
  graphSetting: {},
  theme: {},
};

export default NewChart;