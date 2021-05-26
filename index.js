import { getRootNode } from './env';
import extend from './extend';
import Zoey from './Zoey';
import './index.css'

let rootNode = getRootNode();
let node = document.createElement('div');
node.innerHTML = '呵呵';

// new Zoey().$inject(getRootNode(), node);
let Com2 = Zoey.extend({
  name: 'modal',
  template: `<span on-click={this.handleShow()} class={modalclass}>{modalName}{pid}我是</span>`,
  data: {
    pid: 10211,
    modalclass: 'modal-show'
  },
  handleShow() {
    this.data.pid ++;
    console.log('🥶🥶🥶🥶');
    console.log(this);
  },
})

let Com1 = Zoey.extend({
  template: `<div class='show' on-click={this.handleClick()}><modal modalName={modalName}></modal></div>`,
  data: {
    ok: true,
    show: false,
    myclass: 'show',
    username: 1,
    id: 'wrapper',
    modalName: '这是modal的名字'
  },
  show: true,
  body: '<h1>你好我是何帆</h1>',
  handleClick(value, $event) {
    console.log('🦊🦊');
    console.log(this);
    this.data.myclass = 'hhh';
  }
})

new Com1().$inject(rootNode);
console.log('com1', new Com1());
// console.log('com2', new Com2());