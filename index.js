import { getRootNode } from './env';
import extend from './extend';
import Zoey from './Zoey';
import './index.css'

const template = '<a-user></a-user>';
let rootNode = getRootNode();
rootNode.innerHTML = template;
let node = document.createElement('div');
node.innerHTML = '呵呵';

// new Zoey().$inject(getRootNode(), node);

let Com1 = Zoey.extend({
  // template: `<div class='show'>{#if show}<span><div>12323</div></span>{#elseif ok}<h1>ok</h1>{#else}<img>这是else</img>{/if}</div>`,
  // template: `<span class='show' on-click={handleClick}>{username}</span>`,
  template: `<h1
  on-click={this.handleClick(show,$event)} 
  class='show'>
  {#if show}
  <span>这是{username}
  </span>
  {#else}
  <span>哈哈哈哈</span>
  <span>哈哈哈哈</span>
  {/if}
  </h1>`,
  // template: `{#if username === obj}<span>{#if ok}<div></div>{/if}</span>{/if}`,
  data: {
    ok: true,
    show: true,
    username: 1,
  },
  handleClick(value, $event) {
    this.data.username = 'hefan';
    console.log('点击之后this', this);
  }
})

let Com2 = Zoey.extend({
  template: `<div>Com2</div>`,
  data: {
    pid: 10211,
  },
})

let Component = new Com1();
console.dir(rootNode);
Component.$inject(rootNode)
// console.log(new Zoey());
// console.log(new Com2());