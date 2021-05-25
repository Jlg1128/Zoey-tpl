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
  template: `<span>{username}{pid}</span>`,
  data: {
    pid: 10211,
  },
})

let Com1 = Zoey.extend({
  // template: `<h1
  // on-click={this.handleClick(show,$event)} 
  // class={myclass}>
  // {#if show}
  // <span>这是{username}
  // </span>
  // {#else}
  // <span>哈哈哈哈</span>
  // {/if}
  // </h1>`,
  template: `<div><span>{myclass}</span><modal username={modalName}></modal></div>`,
  data: {
    ok: true,
    show: false,
    myclass: 'show',
    username: 1,
    modalName: '这是modal的名字'
  },
  show: true,
  body: '<h1>你好我是何帆</h1>',
  handleClick(value, $event) {
    this.data.show = !this.data.show;
  }
})

let Com3 = Zoey.extend({
  template: `<div><modal></modal></div>`,
  data: {
  }
})

let Component = new Com1();
console.dir(rootNode);
new Com3().$inject(rootNode)
console.log('Component', Component);
console.log('Component2', new Com2());
console.log('Component3', new Com3());