'use strict';

import 'babel/polyfill';

import d3 from 'd3';
import React from 'react';
import Im from 'immutable';
import topojson from 'topojson';
import chroma from 'chroma-js';

import colours from './econ_colours.js';
import countries from './countries.js';

import Header from './header.js';
import ToggleBar from './toggle-bar.js';
import ChartContainer from './chart-container.js';
import BordersTable from './borders-table.js';
import ColourLegend from './colour-legend.js';

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

window.chroma = chroma;
window.colours = colours;
// var immigrationColours = chroma.hsl(355.771, 1, 0.4451); // red
// var securityColour = chroma.hsl(175.939, 1, 0.4451); // aquamarine
var immigrationColour = 37.724;
var securityColour = 186.789;

var startChroma = 92.904;
var startLightness = 47.461;

var endChroma = 33.969;
var endLightness = 73.097;
var colourDomain = [2000, 2005, 2009, 2011, 2013, 2014, 2015];
//
// var immigrationScale = chroma.scale([
//   chroma.hcl(immigrationColour, endChroma, endLightness).hex(),
//   chroma.hcl(immigrationColour, startChroma, startLightness).hex()
// ]).mode('hcl').domain(colourDomain);
// var securityScale = chroma.scale([
//   chroma.hcl(securityColour, endChroma, endLightness).hex(),
//   chroma.hcl(securityColour, startChroma, startLightness).hex()
// ]).mode('hcl').domain(colourDomain);
// var otherScale = chroma.scale([
//   chroma.hcl(0,0, endLightness),
//   chroma.hcl(0, 0, startLightness)
// ]).mode('hcl').domain(colourDomain);


function generateMonoScale(h, c, startL, endL) {
  return chroma.scale([
    chroma.hcl(h, c, startL), chroma.hcl(h, c, endL)
  ]).mode('hcl');
}

var blues = generateMonoScale(238, 8, 60, 90);
var highlightBlues = generateMonoScale(210, 15, 50, 80);

var rawColours = Im.fromJS([
  {
    label : 'Countries',
    colours : [
      blues(0),
      blues(0.7),
      blues(1)
    ]
  }
]);
var offColours = Im.fromJS([
  highlightBlues(0),
  highlightBlues(0.7),
  highlightBlues(1)
]);
function generateColourGroup(title) {
  return rawColours.push(Im.fromJS({
    label : title,
    colours : offColours
  }));
}

interactive.createStore('meta', {
  setToggle : function(key, value) {
    this.set(`toggle-${key}`, value);
    interactive.action('setProjection', projections[value]);

    if(key==='zoom') {
      switch(value) {
        case 'world':
          this.set('country-colours', rawColours);
          break;
        case 'europe':
          this.set('country-colours', generateColourGroup('Schengen area'));
          break;
        case 'russia':
          this.set('country-colours', generateColourGroup('Former Soviet Union'));
          break;
        case 'middleEast':
          this.set('country-colours', generateColourGroup('Recent instability'));
          break;
      }
    }
  },
  setFocusCountry : function(iso_a3) {
    this.set('focusCountry', iso_a3);
  }
}, {
  'toggle-zoom' : 'world',
  'country-colours' : rawColours
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
        } else {
          interactive.action('setFocusCountry', iso_a3);
        }
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
}, {
  fenceData : Im.Map()
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

    var countryColours = {
      name : 'country',
      storeBindings : [
        [interactive.stores['meta'], function(store) {
          this.setState({
            colours : store.get(`${this.props.name}-colours`)
          });
        }]
      ]
    };

    return(
      <div className='chart-container'>
        <Header title="Man the barricades" subtitle="Walls to stop migration, by date of construction"/>
        <ToggleBar {...toggleProps} />
        <ColourLegend {...countryColours} />
        <D3Map {...mapProps} />
        <BordersTable {...tableProps} />
      </div>
    );
  }
}

function assureDataJoin(d) {
  var props = d.properties;
  if(!d.dataCombined) {
    var fenceData = interactive.stores['data'].get('fenceData').filter(
      (f) => {
        return d.properties.builder === f.get('builder') && d.properties.target === f.get('target')
      }
    ).get(0);
    for(let k of [
      'planned?', 'construction?', 'completed?',
      'announced_year', 'begun_year', 'completed_year',
      'immigration_yes', 'security_yes', 'border_yes'
    ]) {
      props[k] = fenceData.get(k);
    }

    d.dataCombined = true;
  }
  return d;
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
            if(focused) { return highlightBlues(0); }
            if(builder) { return highlightBlues(0.7); }
            return highlightBlues(1);
          }
          break;
        case 'russia':
          if(soviet.includes(iso_a3)) {
            if(focused) { return highlightBlues(0); }
            if(builder) { return highlightBlues(0.7); }
            return highlightBlues(1);
          }
          break;
        case 'middleEast':
          if(arabSpring.includes(iso_a3)) {
            if(focused) { return highlightBlues(0); }
            if(builder) { return highlightBlues(0.7); }
            return highlightBlues(1);
          }
      }
      if(focused) { return blues(0) }
      if(builder) { return blues(0.7) }
      return blues(1);
    }
  },
  'fences' : {
    'data-immigration' : function(d) { return !!d.properties.cause_imm; },
    'data-security' : function(d) { return !!d.properties.cause_secu; },
    stroke : function(d) {
      d = assureDataJoin(d);
      var targetYear = d.properties['planned?'] ? d.properties.announced_year : d.properties.begun_year;
      if(d.properties.immigration_yes === 'TRUE') { return colours.red[0]; }
      if(d.properties.security_yes === 'TRUE') { return colours.aquamarine[0]; }
      return colours.grey[4];
    },
    'stroke-dasharray' : function(d) {
      d = assureDataJoin(d);
      if(d.properties['planned?']) { return '2 2'; }
      if(d.properties['construction?']) { return '2 4'; }
      if(d.properties['completed?']) { return '1 0'; }
    },
    'stroke-width' : function(d) {
      d = assureDataJoin(d);
      if(d.properties.builder === interactive.stores['meta'].get('focusCountry')) { return 3.5; };
      // if(d.properties['planned?']) { return 1; }
      return 2;
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
// fetchTopojson('coastline', './data/coastline.json', '50m_coastline');
fetchTopojson('borders', './data/borders.json', 'ne_50m_admin_0_boundary_lines_land');
fetchTopojson('fences', './data/fences.json', 'fences-out');

d3.csv('./data/walls-data.csv', function(error, data) {
  interactive.action('addData', 'fenceData', Im.fromJS(data));
});
