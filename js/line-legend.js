import React from 'react';
import interactive from './interactive.js';
import InteractiveComponent from './interactive-component.js';

class LineGroup extends InteractiveComponent {
  render() {
    var colourBlocks = this.props.colours.map((c) => {
      var lineAttrs = {
        stroke : c,
        strokeWidth : 2,
        fill : 'transparent',
        x1: 0, y1: 0,
        x2: '100%', y2: '100%'
      }
      return (<svg className='colour-block'>
        <line {...lineAttrs}></line>
      </svg>)
    })

    return (<span className='colour-group'>
      {colourBlocks}
      <span className='colour-block-label'>{this.props.label}</span>
    </span>);
  }
}

export default class LineLegend extends InteractiveComponent {
  // constructor(props) {
  //   super(...arguments);
  //   this.state = {
  //     colours: props.colours
  //     // colours : interactive.stores['meta'].get(`${props.name}-colours`)
  //   };
  // }
  // static get defaultProps() {
  //   return {
  //     name : 'main'
  //   };
  // }
  render() {
    var colours = this.props.colours.map((c) => {
      return(<LineGroup {...c} />);
    });
    return(<div className='colour-legend'>
      {colours}
    </div>);
  }
}
