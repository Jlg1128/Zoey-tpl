import { getRootNode } from './env';
import extend from './extend';
import Zoey from './Zoey';

const template = '<a-user></a-user>';
let rootNode = getRootNode();
rootNode.innerHTML = template;
let node = document.createElement('div');
node.innerHTML = '呵呵';

// new Zoey().$inject(getRootNode(), node);

let Com1 = Zoey.extend({
  template: `<div class='show'>{#if show}<span>123</span>{#elseif ok}<h1>ok</h1>{/if}</div>`,
  // template: `{#if username === obj}<span>{#if ok}<div></div>{/if}</span>{/if}`,
  data: {
    show: '蒋隆贵',
    ok: true,
  }
})

console.log(new Com1());