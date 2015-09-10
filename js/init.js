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
// just needs to be here...
import dummy from '../node_modules/d3-geo-projection/d3.geo.projection.js';

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
  },
  setProjection : function(projection) {
    this.set('projection', projection);
  },
  setLayerAttrs : function(layerAttrs) {
    this.set('layerAttrs', layerAttrs);
  }
});


class Chart extends ChartContainer {
  render() {
    var mapProps = {
      height : this.props.height,
      duration : null,
      projection : d3.geo.winkel3()
        .scale(120).translate([595/2,this.props.height/2]),
      storeBindings : [
        [interactive.stores['geodata'], function(store) {
          this.setState({
            layers : store.get('layers'),
            layerOrder : store.get('layerOrder'),
            projection : store.get('projection'),
            layerAttrs : store.get('layerAttrs')
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
interactive.action('setProjection',
  d3.geo.winkel3().scale(110)
);
interactive.action('setLayerAttrs', {
  'countries' : {
    'data-iso' : function(d) { return d.properties.iso_a3; }
  },
  'fences' : {
    'data-immigration' : function(d) { return !!d.properties.cause_imm; },
    'data-security' : function(d) { return !!d.properties.cause_secu; },
    stroke : function(d) {
      return 'green';
    }
  }
});

var props = {
  height : 350
};

var chart = React.render(<Chart {...props} />, document.getElementById('interactive'));

function fetchTopojson(name, file, featureGroup) {
  d3.json(file, function(err, data) {
    // console.log(data.objects);
    interactive.action('addLayer', name, topojson.feature(data, data.objects[featureGroup]).features);
  });
}

window.interactive = interactive;

fetchTopojson('countries', './data/countries.json', 'ne_50m_admin_0_countries');
fetchTopojson('coastline', './data/coastline.json', '50m_coastline');
fetchTopojson('borders', './data/borders.json', 'ne_50m_admin_0_boundary_lines_land');
fetchTopojson('fences', './data/fences.json', 'fences-out');
