import d3 from 'd3';
import React from 'react';
import Im from 'immutable';
import { generateTranslateString, values } from './utilities.js';
import SVGComponent from './svg-component.js';

var space = 55.4256 - 17.3205;

var evenCols = d3.range(17.3205, 570, space);
var oddCols = d3.range(36.3731, 570, space);
var rows = d3.range(20, 400, 33);
var cols = [evenCols, oddCols];

var states = Im.Map({
  AK : Im.Map({ col :  1, row : 0, abbr : 'AK', key : 'AK' }),
  ME : Im.Map({ col : 12, row : 0, abbr : 'ME', key : 'ME' }),

  VT : Im.Map({ col : 10, row : 1, abbr : 'VT', key : 'VT' }),
  NH : Im.Map({ col : 11, row : 1, abbr : 'NH', key : 'NH' }),

  WA : Im.Map({ col :  2, row : 2, abbr : 'WA', key : 'WA' }),
  MT : Im.Map({ col :  3, row : 2, abbr : 'MT', key : 'MT' }),
  ND : Im.Map({ col :  4, row : 2, abbr : 'ND', key : 'ND' }),
  MN : Im.Map({ col :  5, row : 2, abbr : 'MN', key : 'MN' }),
  WI : Im.Map({ col :  6, row : 2, abbr : 'WI', key : 'WI' }),
  MI : Im.Map({ col :  8, row : 2, abbr : 'MI', key : 'MI' }),
  NY : Im.Map({ col : 10, row : 2, abbr : 'NY', key : 'NY' }),
  MA : Im.Map({ col : 11, row : 2, abbr : 'MA', key : 'MA' }),
  RI : Im.Map({ col : 12, row : 2, abbr : 'RI', key : 'RI' }),

  ID : Im.Map({ col :  2, row : 3, abbr : 'ID', key : 'ID' }),
  WY : Im.Map({ col :  3, row : 3, abbr : 'WY', key : 'WY' }),
  SD : Im.Map({ col :  4, row : 3, abbr : 'SD', key : 'SD' }),
  IA : Im.Map({ col :  5, row : 3, abbr : 'IA', key : 'IA' }),
  IL : Im.Map({ col :  6, row : 3, abbr : 'IL', key : 'IL' }),
  IN : Im.Map({ col :  7, row : 3, abbr : 'IN', key : 'IN' }),
  OH : Im.Map({ col :  8, row : 3, abbr : 'OH', key : 'OH' }),
  PA : Im.Map({ col :  9, row : 3, abbr : 'PA', key : 'PA' }),
  NJ : Im.Map({ col : 10, row : 3, abbr : 'NJ', key : 'NJ' }),
  CT : Im.Map({ col : 11, row : 3, abbr : 'CT', key : 'CT' }),

  OR : Im.Map({ col :  2, row : 4, abbr : 'OR', key : 'OR' }),
  NV : Im.Map({ col :  3, row : 4, abbr : 'NV', key : 'NV' }),
  CO : Im.Map({ col :  4, row : 4, abbr : 'CO', key : 'CO' }),
  NE : Im.Map({ col :  5, row : 4, abbr : 'NE', key : 'NE' }),
  MO : Im.Map({ col :  6, row : 4, abbr : 'MO', key : 'MO' }),
  KY : Im.Map({ col :  7, row : 4, abbr : 'KY', key : 'KY' }),
  WV : Im.Map({ col :  8, row : 4, abbr : 'WV', key : 'WV' }),
  VA : Im.Map({ col :  9, row : 4, abbr : 'VA', key : 'VA' }),
  MD : Im.Map({ col : 10, row : 4, abbr : 'MD', key : 'MD' }),
  DE : Im.Map({ col : 11, row : 4, abbr : 'DE', key : 'DE' }),

  CA : Im.Map({ col :  2, row : 5, abbr : 'CA', key : 'CA' }),
  UT : Im.Map({ col :  3, row : 5, abbr : 'UT', key : 'UT' }),
  NM : Im.Map({ col :  4, row : 5, abbr : 'NM', key : 'NM' }),
  KS : Im.Map({ col :  5, row : 5, abbr : 'KS', key : 'KS' }),
  AR : Im.Map({ col :  6, row : 5, abbr : 'AR', key : 'AR' }),
  TN : Im.Map({ col :  7, row : 5, abbr : 'TN', key : 'TN' }),
  NC : Im.Map({ col :  8, row : 5, abbr : 'NC', key : 'NC' }),
  SC : Im.Map({ col :  9, row : 5, abbr : 'SC', key : 'SC' }),
  DC : Im.Map({ col : 10, row : 5, abbr : 'DC', key : 'DC' }),

  AZ : Im.Map({ col :  4, row : 6, abbr : 'AZ', key : 'AZ' }),
  OK : Im.Map({ col :  5, row : 6, abbr : 'OK', key : 'OK' }),
  LA : Im.Map({ col :  6, row : 6, abbr : 'LA', key : 'LA' }),
  MS : Im.Map({ col :  7, row : 6, abbr : 'MS', key : 'MS' }),
  AL : Im.Map({ col :  8, row : 6, abbr : 'AL', key : 'AL' }),
  GA : Im.Map({ col :  9, row : 6, abbr : 'GA', key : 'GA' }),

  TX : Im.Map({ col :  5, row : 7, abbr : 'TX', key : 'TX' }),
  FL : Im.Map({ col :  9, row : 7, abbr : 'FL', key : 'FL' }),

  HI : Im.Map({ col :  0, row : 6, abbr : 'HI', key : 'HI' }),
});

class State extends SVGComponent {
  get x() {
    return cols[this.props.row % 2][this.props.col];
  }
  get y() {
    return rows[this.props.row];
  }
  get colour() {
    return this.props.colourFn(this.props.value);
  }
  render() {
    return (<g transform={generateTranslateString(this.x, this.y)}>
      <polygon fill={this.colour} points="-10,-17.3 -20,0 -10,17.3 10,17.3 20,0 10,-17.3" transform="translate(20,20) rotate(90)"/>
      <text x='20' y='25.79' textAnchor='middle' fill='white'>{this.props.abbr}</text>
    </g>);
  }
}

export default class USStateMap extends SVGComponent {
  static get defaultProps() {
    return {
      colourFn : () => '#333',
      width : 595
    };
  }
  render() {
    var contents = states.map((stateProps) => {
      var props = stateProps.set('colourFn', this.props.colourFn);
      return (<State {...props.toObject()} />)
    }).toList();

    return(<svg height={this.props.height} width={this.props.width}>{contents}</svg>);
  }
}
