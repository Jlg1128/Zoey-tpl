import extend from "./extend";
import { implement, inject } from "./util";
import parser from './parser/parser';
import render from './parser/render';
import { ElementNode } from '../j-tpl/parser/parser';

function Zoey(options) {
  // const { template = '', name = '', data = {} } = options;
  // this._children = [];
  // this.$refs = [];
  // this.$root = null;
  // this.$parent = null;
  let context = this;
  let rootNode = new ElementNode('div');
  let template = this.parser(rootNode, this.template);
  context.constructor.prototype.template = template;
  console.log('ast🦊', template);
  let resultDom = context.render(context);
  console.log('resultDom🦊', resultDom);
  document.body.appendChild(resultDom)
  console.log('context😡', context);
}
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

export default Zoey;