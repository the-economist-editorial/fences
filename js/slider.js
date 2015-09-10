import d3 from 'd3';
import React from 'react';
import SVGComponent from './svg-component.js';
import interactive from './interactive.js'
import { bindValueToRange } from './utilities.js';

export default class Slider extends SVGComponent {
  constructor(props) {
    super(...arguments);
    this.drag = this.drag.bind(this);
    this.release = this.release.bind(this);

    this.state = {
      value : props.scale.domain()[0],
      playing : false
    };
  }
  static get defaultProps() {
    return {
      name : 'slider',
      margin : [0, 30],
      axisThickness : 1,
      axisFormat : d3.format(),
      playButton : true,
      refineValue : (v) => { return v; },
      width : 540,
      height : 50,
      duration : 1000,
      stopCallback : () => { /* stub */ }
    };
  }
  get domain() { return this.props.scale.domain(); }
  get range() { return this.props.scale.range(); }
  drawPlay() {
    if(!this.props.playButton) { return; }
    return;
  }
  render() {
    this.props.scale.range([this.margin.left, this.props.width - this.margin.right]);

    var playButton = this.drawPlay();

    var position = this.props.scale(this.state.value);

    var handleProps = {
      ref : 'handle', className : 'slider-handle',
      d : 'M-10,0L-10,20Q-6,23,0,25Q6,23,10,20L10,0Z',
      transform : `translate(${position},0)`
    };
    var backdropProps = {
      ref : 'backdrop', className : 'slider-backdrop',
      width : this.props.width,
      height : this.props.height,
      fill : 'transparent'
    }

    return(<svg height={this.props.height} width={this.props.width} ref='container'>
      <rect {...backdropProps}></rect>
      <path {...handleProps} />
      <g ref='axis' className='axis handle-axis' transform='translate(0, 25)'></g>
    </svg>);
  }
  componentDidMount() {
    super.componentDidMount(...arguments);

    var axis = d3.svg.axis()
      .scale(this.props.scale)
      .outerTickSize(this.axisThickness)
      .orient('bottom')
      .tickFormat(this.axisFormat);
    this.selectRef('axis').call(axis)
      .selectAll('.tick')
      .on('click', (d) => {
        d3.event.stopPropagation();
        this.set(d);
      });

    var drag = d3.behavior.drag()
      .on('drag', this.drag)
      .on('dragend', this.release);
    this.selectRef('handle').call(drag);

    this.selectRef('backdrop')
      .call(drag)
      .on('click', () => {
        this._setToPosition(d3.event.x);
      });
  }
  _setToPosition(xValue, noRefine) {
    var finalX = bindValueToRange(xValue, this.range);

    if(!noRefine) {
      finalX = this.props.scale(
        this.props.refineValue(this.props.scale.invert(finalX))
      );
    }

    var value = this.props.scale.invert(finalX);
    // this.setState({
    //   value : value,
    //   position : finalX
    // });
    interactive.action('sliderValue', this.props.name, value);

    return value;
  }
  set(value) {
    var value = this._setToPosition(this.props.scale(value));
    if(this.props.releaseCallback) { this.releaseCallback(value); }
    return value;
  }
  drag() {
    this.lastDrag = d3.event.x;

    var x = bindValueToRange(d3.event.x, this.range);
    this._setToPosition(x);
  }
  release() {
    var x = this.lastDrag ? this.lastDrag :
      d3.event.sourceEvent.pageX - React.findDOMNode(this.refs.container)
        .getBoundingClientRect().left;

    var value = this._setToPosition(x);
    if(this.releaseCallback) { this.releaseCallback(value); }

    return value;
  }


  play() {
    this.setState({
      playing : true
    });

    var current = this.domain[0];
    var perSecond = (domain[1] - domain[0]) / this.props.duration;

    this.set(domain[0]);

    d3.timer((elapsed) => {
      if(this.state.playing === false) {
        this.stop();
        // returning true stops a d3 timer
        return true;
      }

      current = this.set(domain[0] + elapsed * perSecond);
      // since the return of set is capped at domain[1], it is safe for
      // us to use this return: it will always eventually exactly equal
      // domain[1] and end the loop
      if(domain[1] === current) {
        this.stop();
        return true;
      }

      this.setState({
        playing : true
      });
    });
  }
  _togglePlay() {
    this[this.state.playing ? 'stop' : 'play']();
  }
  stop() {
    this.setState({
      playing : false
    }, this.props.stopCallback);
  }
}
