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
    context.current = cloneDeep(template);
    context.setValue(context.current, this.data);
    let renderDom = context.render();
    if (context.$root) {
      context.$root.appendChild(renderDom);
      renderDom = $root;
    }
    context.renderDom = renderDom;
  }
}
Zoey.prototype.data = {};
Zoey.extend = extend;
Zoey.implement = implement;
Zoey.implement({
  $inject: inject,
  config: function () {
    console.log('config');
  },
  init() {
    console.log('init');
  },
});

Zoey.prototype.inject = inject;
Zoey.prototype.parser = parser;
Zoey.prototype.render = render;
Zoey.prototype.watcher = watcher;
Zoey.prototype.digest = digest;
Zoey.prototype.patch = patch;
Zoey.prototype.update = update;
Zoey.prototype.setValue = setValue;

export default Zoey;