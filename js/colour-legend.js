import React from 'react';
import interactive from './interactive.js';
import InteractiveComponent from './interactive-component.js';

class ColourGroup extends InteractiveComponent {
  render() {
    var colourBlocks = this.props.colours.map((c) => {
      var style = {
        backgroundColor : c
      };
      return (<span className='colour-block' style={style}></span>)
    })

    return (<span className='colour-group'>
      {colourBlocks}
      <span className='colour-block-label'>{this.props.label}</span>
    </span>);
  }
}

export default class ColourLegend extends InteractiveComponent {
  constructor(props) {
    super(...arguments);
    this.state = {
      colours : interactive.stores['meta'].get(`${props.name}-colours`)
    };
  }
  static get defaultProps() {
    return {
      name : 'main'
    };
  }
  render() {
    var colours = this.state.colours.map((c) => {
      return(<ColourGroup {...c.toJS()} />);
    });
    return(<div className='colour-legend'>
      {colours}
    </div>);
  }
}
