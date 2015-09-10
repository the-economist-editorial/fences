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
    if(!layers) { layers = Im.OrderedMap(); }

    layers = layers.set(layerName, data);

    this.set('layers', layers);
  },
  orderLayers : function(layerOrder) {
    this.set('layerOrder', Im.OrderedSet(layerOrder));
  }
});


class Chart extends ChartContainer {
  render() {
    var mapProps = {
      height : this.props.height,
      projection : d3.geo.mercator(),
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

interactive.action('orderLayers', [
  'coastline', 'countries', 'borders', 'fences'
]);

var props = {
  height : 350
};

var chart = React.render(<Chart {...props} />, document.getElementById('interactive'));

function fetchTopojson(name, file, featureGroup) {
  d3.json(file, function(err, data) {
    console.log(data.objects);
    interactive.action('addLayer', name, topojson.feature(data, data.objects[featureGroup]).features);
  });
}

fetchTopojson('countries', './data/countries.json', 'ne_50m_admin_0_countries');
fetchTopojson('coastline', './data/coastline.json', '50m_coastline');
fetchTopojson('borders', './data/borders.json', 'ne_50m_admin_0_boundary_lines_land');
fetchTopojson('fences', './data/fences.json', 'fences-out');
