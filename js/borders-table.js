import Im from 'immutable';
import React from 'react';
import InteractiveComponent from './interactive-component.js'

import countries from './countries.js';
import interactive from './interactive.js';

var core_purposes = Im.OrderedSet(['immigration', 'security', 'trafficking', 'smuggling', 'territorial']);
function formatPurpose(d) {
  return core_purposes.map((p) => {
    // console.log(p, d.get(`${p}_yes`));
    return d.get(`${p}_yes`) === 'TRUE' ? p : null
  }).delete(null).toArray().join(', ') || 'other';
}

var importantKeys = Im.Set([
  'target', 'announced_year', 'begun_year', 'completed_year', 'TEXT'
]);

var emptyRows = Array.apply(null, Array(10)).map(()=>{
  return (<tr><td></td></tr>);
});

export default class BordersTable extends InteractiveComponent {
  constructor() {
    super(...arguments);
    this.state = {
      focusCountry : null
    }
  }
  render() {
    if(!this.state.focusCountry || this.state.focusCountry === 'NONE') {
      return (<div className='border-table-container'>
        <div className='instruction'><em>Click a country to see the barriers it has built</em></div>
        <table className='border-table'>
          <thead><tr><td></td></tr></thead>
          <tbody>{emptyRows}</tbody>
        </table>
      </div>);
    }

    var country = countries[this.state.focusCountry];

    var fences = interactive.stores['data'].get('fenceData')
      .filter(d => d.get('builder') === this.state.focusCountry)
      .sort((a, b) => {
        var aVal = +a.get('begun_year') + a.get('announced_year') * 10;
        var bVal = +b.get('begun_year') + b.get('announced_year') * 10;
        return bVal < aVal;
      });

    var fenceKeys = fences.reduce((memo, value) => {
      var neededKeys = Im.Set(value.filter(v => !!v).keys()).intersect(importantKeys).toJS();
      // console.log(memo.union(neededKeys).toJS(), neededKeys);
      return memo.union(neededKeys);
    }, Im.Set());

    var fenceElements = fences.map((d) => {
        var year_items = [];
        if(fenceKeys.includes('announced_year')) {
          year_items.push(<td className='announced'>{d.get('announced_year')}</td>);
        }
        if(fenceKeys.includes('begun_year')) {
          year_items.push(<td className='begun'>{d.get('begun_year')}</td>);
        }
        if(fenceKeys.includes('completed_year')) {
          year_items.push(<td className='completed'>{d.get('completed_year')}</td>);
        }
        var text_item = fenceKeys.includes('TEXT') ?
          (<td>{d.get('TEXT')}</td>) : null;
        return (<tr>
          <td>{d.get('target_name')}</td>
          {year_items}
          <td>{formatPurpose(d)}</td>
          {text_item}
        </tr>)
      });

    while(fenceElements.size < 10) {
      // just a lot here...
      fenceElements = fenceElements.push(<tr><td colSpan='10'></td></tr>);
    }

    var yearHeaderItems = [];
    if(fenceKeys.includes('announced_year')) {
      yearHeaderItems.push(<th className='announced'>Announced</th>);
    }
    if(fenceKeys.includes('begun_year')) {
      yearHeaderItems.push(<th className='begun'>Begun</th>);
    }
    if(fenceKeys.includes('completed_year')) {
      yearHeaderItems.push(<th className='completed'>Completed</th>);
    }
    var textHeaderItem = fenceKeys.includes('TEXT') ?
      (<th>Notes</th>) : null;

    var countryName = [country.name];
    if(country.name === 'Brazil') { countryName.push(<super>†</super>) }
    return(<div className='border-table-container'>
      <h1>{countryName}</h1>
      <table className='border-table'>
        <thead>
        <tr>
          <th>Against</th>
          {yearHeaderItems}
          <th>Stated reasons</th>
          {textHeaderItem}
        </tr>
        </thead>
        <tbody>
          {fenceElements}
        </tbody>
      </table>
    </div>);
  }
}
