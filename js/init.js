'use strict';

import d3 from 'd3';
import React from 'react';
import { parseNumerics } from './utilities.js';

import colours from './econ_colours.js';

import Header from './header.js';
import Slider from './slider.js';
import ChartContainer from './chart-container.js';
import BarChart from './bar-chart.js';
import USStateMap from './us-states-map.js';

import Interactive from './interactive.js';

Interactive.createStore('meta', {
  'sliderValue' : function(key, value) {
    this.set('slider-' + key, value);
  }
});

class Chart extends ChartContainer {
  // constructor() {
  //   super();
  // }
  render() {
    var barChartProps = {
      data : this.props.data,
      xScale : d3.scale.linear().domain([0,5]),
      yScale : d3.scale.linear().domain([0,150]),
      height : this.props.height
    };

    var mapProps = {
      height : this.props.height,
      colourFn : function(v) {
        return v > 10 ? colours.red[0] : colours.blue[1];
      }
    }

    var sliderProps = {
      name : 'year',
      scale : d3.scale.linear().domain([1980,2010]),
      storeBindings : [
        [interactive.stores['meta'], function(store) {
          this.setState({
            value : store.get('slider-year')
          });
        }]
      ]
    }

    return(
      <div className='chart-container'>
        <Header title="Oh geez" subtitle="Seriously now"/>
        <Slider {...sliderProps} />
        <USStateMap {...mapProps} />
      </div>
    );
  }
}
var props = {
  height : 320
};

var chart = React.render(<Chart/>, document.getElementById('interactive'));

d3.json('data/bar-data.json', (err, data) => {
  props.data = parseNumerics(data.data);
  chart = React.render(<Chart {...props} />, document.getElementById('interactive'));
});
