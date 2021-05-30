import { getRootNode } from './env';
import extend from './extend';
import Zoey from './Zoey';
import './index.css'

let rootNode = getRootNode();
let node = document.createElement('div');
node.innerHTML = '呵呵';

// new Zoey().$inject(getRootNode(), node);
// let Com2 = Zoey.extend({
//   name: 'modal',
//   template: `<span on-click={this.handleShow()} class={modalclass}>{modalName}{pid}我是</span>`,
//   data: {
//     pid: 10211,
//     modalclass: 'modal-show'
//   },
//   handleShow() {
//     this.data.pid ++;
//     console.log('🥶🥶🥶🥶');
//   },
// })

let Modal = Zoey.extend({
  name: 'modal',
  template: '<div>这是Modal</div>',
  data: {
    modal: '123',
  },
});

let Com1 = Zoey.extend({
  template: `<div id='com1'>
  <button class='btn-style' on-click={this.handleClick()}>测试</button>
  {#if show}
  {#if ok}
  <modal></modal>
  {#else}
  <span>哈哈哈哈</span>
  {/if}
  {#else}
  <div>
  <span>不展示</span>
  </div>
  {/if}
  </div>`,
  data: {
    ok: false,
    show: true,
    myclass: 'show',
    username: 1,
    id: 'wrapper',
    modalName: '这是modal的名字',
    needok: true,
  },
  show: true,
  body: '<h1>你好我是何帆</h1>',
  handleClick(value, $event) {
    console.log('🦊🦊');
    console.log('value', value);
    console.log('$event', $event);
    this.data.show = !this.data.show;
    this.data.ok = true;
  }
})

new Com1().$inject(rootNode);
console.log('com1', new Com1());
// console.log('com2', new Com2());