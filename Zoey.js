import extend from "./extend";
import { implement, inject } from "./util";
import parser from './parser/parser';
import render, { setValue } from './parser/render';
import {
  watcher,
  digest,
  patch,
  update,
} from './watcher';
import { ElementNode } from '../j-tpl/parser/parser';
import { cloneDeep } from 'loadsh';
import im from 'immutable';

function Zoey(options) {
  let context = this;
  let template;

  if (typeof this.template === 'string') {
    template = this.parser(null, this.template);
  }

  function listener(oldValue, newValue) {
    console.log('😀值改变了')
  }


  if (template) {
    let oldValue = JSON.parse(JSON.stringify(this.data));
    this.watcher('data', listener, oldValue);
    context.constructor.prototype.template = template;
    context.current = context.setValue(cloneDeep(template), this.data);
    // 相关生命周期，暂时先放在这里
    // context.config && context.config(context.data)
    // context.init && context.init(context.data)
    // context.destroy && context.destroy()
    console.log('current1', context.current);
    console.log('👹👹👹contextbeforerender', context);
    console.log('👹👹👹templatebeforerender', context.template);
    let renderDom = context.render();
    if (context.$root) {
      context.$root.appendChild(renderDom);
      renderDom = $root;
    }
    console.log('👹👹👹context', context);
    console.log('👹👹👹template', context.template);
    context.renderDom = renderDom;
  }
}
Zoey.prototype.data = {};
Zoey.extend = extend;
Zoey.implement = implement;
Zoey.implement({
  $inject: inject,
  inject,
  parser,
  render,
  watcher,
  digest,
  patch,
  update,
  setValue,
  config: function (data) {
    console.log('config');
  },
  init() {
    console.log('init');
  },
});

export default Zoey;