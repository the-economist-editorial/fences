'use strict';

import d3 from 'd3';
import React from 'react';
import Im from 'immutable';
import topojson from 'topojson';

import colours from './econ_colours.js';

import Header from './header.js';
import ChartContainer from './chart-container.js';

import D3Map from './d3map.js';

import Interactive from './interactive.js';

Interactive.createStore('meta', {
  'sliderValue' : function(key, value) {
    this.set('slider-' + key, value);
  }
});

Interactive.createStore('geodata', {
  addLayer : function(layerName, data) {
    let layers = this.get('layers');
    if(!layers) { layers = Im.Map(); }

    layers = layers.set(layerName, data);

    this.set('layers', layers);
  },
  orderLayers : function(layerOrder) {
    this.set('layerOrder', layerOrder);
  }
});

class Chart extends ChartContainer {
  render() {
    var mapProps = {
      height : this.props.height,
      storeBindings : [
        [interactive.stores['geodata'], function(store) {
          this.setState({
            layers : store.get('layers'),
            layerOrder : store.get('layerOrder')
          });
        }]
      ]
    }

    return(
      <div className='chart-container'>
        <Header title="Man the barricades" subtitle="Walls to stop migration, by date of construction"/>
        <D3Map {...mapProps} />
      </div>
    );
  }
}
var props = {
  height : 320
};

var chart = React.render(<Chart {...props} />, document.getElementById('interactive'));

d3.json('./data/countries.json', function(err, data) {
  // console.log(data);
  interactive.action('addLayer', 'countries', topojson.feature(data, data.objects.ne_50m_admin_0_countries).features);
});
