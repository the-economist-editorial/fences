import Im from 'immutable';
import React from 'react';
import InteractiveComponent from './interactive-component.js'

import countries from './countries.js';
import interactive from './interactive.js';

var core_purposes = Im.OrderedSet(['immigration', 'security', 'trafficking', 'smuggling', 'border']);
function formatPurpose(d) {
  return core_purposes.map((p) => {
    // console.log(p, d.get(`${p}_yes`));
    return d.get(`${p}_yes`) === 'TRUE' ? p : null
  }).delete(null).toArray().join(', ');
}

export default class BordersTable extends InteractiveComponent {
  constructor() {
    super(...arguments);
    this.state = {
      focusCountry : null
    }
  }
  render() {
    if(!this.state.focusCountry) {
      return (<div></div>);
    }

    var country = countries[this.state.focusCountry];
    var fences = interactive.stores['data'].get('fenceData')
      .filter(d => d.get('builder') === this.state.focusCountry)
      .map((d) => {
        // console.log(d.toJS());
        return (<tr>
          <td>{countries[d.get('target')].name}</td>
          <td>{d.get('announced_year')}</td>
          <td>{d.get('begun_year')}</td>
          <td>{d.get('completed_year')}</td>
          <td>{formatPurpose(d)}</td>
          <td>{d.get('TEXT')}</td>
        </tr>)
      });

    return(<div>
      <h1>{country.name}</h1>
      <table>
        <thead>
        <tr>
          <th rowSpan="2">Target country</th>
          <th colSpan="3">Year</th>
          <th rowSpan="2">Purpose</th>
          <th rowSpan="2">Notes</th>
        </tr>
        <tr>
          <th>announced</th>
          <th>started</th>
          <th>completed</th>
        </tr>
        </thead>
        <tbody>
          {fences}
        </tbody>
      </table>
    </div>);
  }
}
