'use strict';

import 'babel/polyfill';

import d3 from 'd3';
import React from 'react';
import Im from 'immutable';
import topojson from 'topojson';

import colours from './econ_colours.js';
import countries from './countries.js';

import Header from './header.js';
import ToggleBar from './toggle-bar.js';
import ChartContainer from './chart-container.js';
import BordersTable from './borders-table.js';

import D3Map from './d3map.js';

import interactive from './interactive.js';
// just needs to be here...
import dummy from '../node_modules/d3-geo-projection/d3.geo.projection.js';

var projections = window.projections = {
  world : d3.geo.winkel3().scale(160).center([0,20]),
  europe : d3.geo.albers().scale(450).rotate([-10,-5]),
  middleEast : d3.geo.albers().scale(650).rotate([-34,10]),
  russia : d3.geo.albers().scale(1200).rotate([-24,-15])
};

var schengen = Im.Set([
  'FRA', 'DEU', 'NLD', 'BEL', 'PRT', 'ESP', 'LUX', 'ITA',
  'NOR', 'SWE', 'DNK', 'FIN', 'CHE', 'EST', 'LVA', 'LTU',
  'POL', 'CZE', 'SVK', 'HUN', 'AUT', 'ISL', 'SVN', 'GRC',
  'MLT', 'LIE'
]);

var soviet = Im.Set([
  'RUS',
  'EST', 'LVA', 'LTU',
  'BLR', 'UKR', 'MDA',
  'GEO', 'ARM', 'AZE',
  'KAZ', 'UZB', 'TKM', 'KGZ', 'TJK']);

var arabSpring = Im.Set([
  'EGY', 'TUN', 'LBY', 'YEM', 'SYR', 'BHR'
]);

interactive.createStore('meta', {
  setToggle : function(key, value) {
    this.set(`toggle-${key}`, value);
    interactive.action('setProjection', projections[value]);
  },
  setFocusCountry : function(iso_a3) {
    this.set('focusCountry', iso_a3);
  }
}, {
  'toggle-zoom' : 'world'
});

interactive.createStore('geodata', {
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
  },
  setLayerHandlers : function(layerHandlers) {
    this.set('layerHandlers', layerHandlers);
  }
}, {
  layerHandlers : {
    'countries' : {
      'click' : function(d) {
        var iso_a3 = d.properties.iso_a3;
        if(!interactive.stores['data'].get('fenceData-builders').has(iso_a3)) {
          interactive.action('setFocusCountry', 'NONE');
        }
        interactive.action('setFocusCountry', iso_a3);
        // var fences = interactive.stores['data'].get('fenceData')
        //   .filter((n) => { return iso_a3 === n.get('builder'); });
        // console.log('hello', fences.toJS());
      }
    }
  }
});

interactive.createStore('data', {
  addData : function(dataName, data) {
    this.set(dataName, data);
    this.set(`${dataName}-builders`, data.map(d => d.get('builder')).toSet());
  }
});

class Chart extends ChartContainer {
  render() {
    var mapProps = {
      height : this.props.height,
      duration : null,
      // projection : projections[interactive.stores['meta'].get('toggle-zoom')],
      storeBindings : [
        [interactive.stores['geodata'], function(store) {
          this.setState({
            layers : store.get('layers'),
            layerOrder : store.get('layerOrder'),
            projection : store.get('projection'),
            layerAttrs : store.get('layerAttrs'),
            layerHandlers : store.get('layerHandlers')
          });
        }],
        [interactive.stores['meta'], function(store) {
          this.setState({
            status : store.get('toggle-zoom'),
            focusCountry : store.get('focusCountry')
          });
        }]
      ]
    };

    var toggleProps = {
      name : 'zoom',
      activeKey : interactive.stores['meta'].get('toggle-zoom'),
      items : Im.fromJS([
        { title : 'World', value : 'world' },
        { title : 'Europe', value : 'europe' },
        { title : 'Middle East', value : 'middleEast' },
        { title : 'Russian Border', value : 'russia' }
      ])
    };

    var tableProps = {
      storeBindings : [
        [interactive.stores['data'], function(store) {
          this.setState({
            fenceData : store.get('fenceData')
          });
        }],
        [interactive.stores['meta'], function(store) {
          this.setState({
            focusCountry : store.get('focusCountry')
          });
        }]
      ]
    };

    return(
      <div className='chart-container'>
        <Header title="Man the barricades" subtitle="Walls to stop migration, by date of construction"/>
        <ToggleBar {...toggleProps} />
        <D3Map {...mapProps} />
        <BordersTable {...tableProps} />
      </div>
    );
  }
}

interactive.action('orderLayers', [
  'coastline', 'countries', 'borders', 'fences'
]);
interactive.action('setProjection', projections.world);
interactive.action('setLayerAttrs', {
  'countries' : {
    'data-iso' : function(d) { return d.properties.iso_a3; },
    'data-focus' : function(d) { return d.properties.iso_a3 === interactive.stores['meta'].get('focusCountry'); },
    fill : function(d) {
      var iso_a3 = d.properties.iso_a3;
      var zoomMode = interactive.stores['meta'].get('toggle-zoom');
      var focused = iso_a3 === interactive.stores['meta'].get('focusCountry');
      var builder = interactive.stores['data'].get('fenceData-builders').has(iso_a3);

      switch(zoomMode) {
        case 'europe':
          if(schengen.has(iso_a3)) {
            if(focused) { return colours.blue[2]; }
            if(builder) { return colours.blue[4]; }
            return colours.blue[5];
          }
          break;
        case 'russia':
          if(soviet.includes(iso_a3)) {
            if(focused) { return colours.red[1]; }
            if(builder) { return colours.red[2]; }
            return colours.red[3];
          }
          break;
        case 'middleEast':
          if(arabSpring.includes(iso_a3)) {
            if(focused) { return colours.green[1]; }
            if(builder) { return colours.green[2]; }
            return colours.green[3];
          }
      }
      if(focused) { return colours.grey[5]; }
      if(builder) { return colours.grey[8]; }
      return colours.grey[9];
    }
  },
  'fences' : {
    'data-immigration' : function(d) { return !!d.properties.cause_imm; },
    'data-security' : function(d) { return !!d.properties.cause_secu; },
    stroke : function(d) {
      if(d.properties.builder === interactive.stores['meta'].get('focusCountry')) { return 'red'; };
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

d3.csv('./data/walls-data.csv', function(error, data) {
  interactive.action('addData', 'fenceData', Im.fromJS(data));
});
