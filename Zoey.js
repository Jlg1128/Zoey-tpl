import extend from "./extend";
import { implement, inject } from "./util";
import parser from './parser/parser';
import compile from './parser/complie';
import { ElementNode } from '../j-tpl/parser/parser';

function Zoey(options) {
  // const { template = '', name = '', data = {} } = options;
  // this._children = [];
  // this.$refs = [];
  // this.$root = null;
  // this.$parent = null;
  let rootNode = new ElementNode('div');
  console.log('ast👹', this.parser(rootNode, this.template));
  console.log('template', this.template);
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
Zoey.prototype.compile = compile;

export default Zoey;