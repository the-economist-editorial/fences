import React from 'react';
import Im from 'immutable';
import interactive from './interactive.js';
import InteractiveComponent from './interactive-component.js';

class Option extends InteractiveComponent {
  constructor() {
    super(...arguments);
    this.clickAction = this.clickAction.bind(this);
  }
  clickAction() {
    this.props.action(this.props.value);
  }
  render() {
    var classes = ['tab'];
    if(this.props.active) { classes.push('active-tab'); }
    return(<li className={classes.join(' ')} onClick={this.clickAction}>{this.props.title}</li>);
  }
}

export default class ToggleBar extends InteractiveComponent {
  constructor(props) {
    super(...arguments);
    this.state = { activeKey : interactive.stores['meta'].get(`toggle-${props.name}`) };
  }
  static get defaultProps() {
    return {
      name : 'toggle',
      items : Im.fromJS([
        { title : 'Foo', key : 'foo', value : 'foo' },
        { title : 'Bar', key : 'bar', value : 'bar' }
      ])
    };
  }
  get itemElements () {
    return this.props.items.map((item) => {
      item = item.merge({
        key : item.get('value'),
        action : (v) => { interactive.action('setToggle', this.props.name, v) },
        active : item.get('value') === this.state.activeKey
      });
      return (<Option {...item.toObject()} />);
    });
  }
  componentDidMount() {
    super.componentDidMount(...arguments);
    interactive.stores['meta'].on('change', (store) => {
      this.setState({
        activeKey : store.get(`toggle-${this.props.name}`)
      });
    });
  }
  render() {
    return (<ul className='toggle-bar tab-bar'>{this.itemElements}</ul>);
  }
}
