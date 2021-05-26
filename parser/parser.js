import {
  getExpressionBody,
  parseIfExpression,
  getElseIfExpressionBody,
  getElseExpressionBody,
  handleParseExpression,
} from '../util';
// 词法分析
// let tpl = `<div class='show'>{#if show}<span>{username}</span>{/if}</div>`;
let tpl = `<div><span>{show}</span></div>`;

const elementTag = ['div', 'span', 'p', 'h1', 'ul', 'li', 'img', 'text'];
const textTag = ['text'];

let tagTypesMap = Object.assign(getTagTypesMap(elementTag, 'element'), getTagTypesMap(textTag, 'text'))

function getTagTypesMap(tagsArr, type) {
  let result = {};
  tagsArr.map((tag) => {
    result[tag] = type;
  })
  return result;
}

let attrTypesMap = {
  class: 'attribute',
  style: 'style',
}

export function ElementNode(tag, text = '', type) {
  this.attrs = [];
  this.children = [];
  this.tag = tag;
  this.type = tagTypesMap[tag];
  if (tag === 'text') {
    this.text = text;
  }
  if (type && type === 'if') {
    this.if = this.condition;
  };
  if (type && type === 'elseif') {
    this.elseif = type || '';
  }
  this.conditions = [];
}

function AttrNode(attrName, value) {
  this.name = attrName; // 'class'
  this.type = attrTypesMap[attrName] || 'params'; // 'attribute' | 'if'
  this.value = value.toString();
}

function EventNode(eventName, handler) {
  this.name = eventName;
  this.handler = handler;
  this.type = 'event';
}

export function ComponentNode(componentName, componentInstance, params) {
  this.type = 'component';
  this.name = componentName;
  this.context = componentInstance;
  this.params = params;
}
function ExpressionNode(name, expressionTpl, data, option) {
  // this.expressionTpl = expressionTpl;
  // this.tpl = 
  // let self = this;;
  // this.body = null;
  // this.setBody = function (data) {
  //   self.value = parser(self, expressionTpl);
  // }
  // // 条件表达式
  // this.option = option;
  // this.type = 'expression';
  // this.name = name; // 'attribute' | 'if'
  // this.value = null;
}

function IfExpressionNode(name, expressionTpl, data, option) {
  let self = this;
  // 条件表达式
  this.optionList = [];
  this.type = 'expression';
  this.name = name; // 'attribute' | 'if'
  this.value = null;
}

let reg = /\w/g;
let next = 0;
// /^<(?!\/[a-zA-Z]+?)[\t\n\s]*/
// 匹配开始标签
let tagPrefixReg = /^<[\w-]*[\t\n\s]*/;
// 匹配标签内部属性值
let attrReg = /^[\w-]+[=]{1}[^\s\t\n>]*/g
// 匹配闭合标签
let tagSuffixReg = /^<\/[\t\n\s]*[\w-]*>/;
// 匹配非英文
let notWordReg = /[^\w-]/g;
// 是否为innerHtml
let innerReg = /^>(?![\t\n])([\s\S]*?)</;
// 是否是表达式
let expressionReg = /{/g

// 表达式是否为传参
let isParam = function (tpl) {
  return !/{(?=#)/.test(tpl) && /{/.test(tpl);
}

function parser(parentNode, tpl, type, condition) {
  let nodeStack = [];
  let expressionStack = [];
  let context = this;
  let isExpmode = !!type;
  function pushChilren(node) {
    let parent = getParentNode();
    if (isExpmode && (parent['if'] || parent['elseif'] || parent['else']) && nodeStack.length === 0) {
      pushConditionOrChildren(node, parent[type], type);
    } else {
      if (nodeStack.length) {
        // @todo 写入body
        let currentNode = nodeStack[nodeStack.length - 1];
        if (currentNode.type !== 'component') {
          nodeStack[nodeStack.length - 1].children.push(node);
        }
      } else {
        if (parentNode) {
          parentNode.children.push(node); ``
        } else {
          parentNode = node;
        }
      }
    }
    return getParentNode();
  }
  function pushConditionOrChildren(conditionNode, condition, type) {
    if (conditionNode && conditionNode instanceof ElementNode) {
      conditionNode[type] = condition;
      conditionNode.condition = condition;
      getParentNode().conditions.push(conditionNode);
    }
  }
  function getParentNode() {
    if (nodeStack.length) {
      return nodeStack[nodeStack.length - 1];
    } else {
      // 具体逻辑待处理
      if (!parentNode) {
        parentNode = context.$root;
      };
      return parentNode;
    }
  }
  if (tpl && typeof tpl === 'string') {
    tpl = tpl.replace(/\n/g, '');
  }
  while (true) {
    if (!tpl || tpl.length === 0) {
      break;
    }
    // 匹配标签开始前缀
    if (!/<|>/g.test(tpl)) {
      pushChilren(new ElementNode('text', tpl));
      tpl = tpl.slice(tpl.length);
    }
    else if (tagSuffixReg.test(tpl)) {
      let tagInitialStr = tpl.match(tagSuffixReg)[0];
      let tag = tagInitialStr.replace(notWordReg, '');
      if (nodeStack.length === 0) {
        throw new SyntaxError('语法错误');
      }
      for (let i = nodeStack.length - 1; i >= 0; i--) {
        if (nodeStack[i].tag === tag) {
          let result = nodeStack[0];
          nodeStack = nodeStack.slice(0, i);
          if (i === 0 && tpl.length === 0) {
            return pushChilren(result);
          }
          break;
        }
      }
      tpl = tpl.slice(tagInitialStr.length);
    }
    else if (tagPrefixReg.test(tpl)) {
      let tagInitialStr = tpl.match(tagPrefixReg)[0];
      let tag = tagInitialStr.replace(notWordReg, '');
      let node;
      if (!elementTag.includes(tag)) {
        // 代表是Component，直接获取组件
        if (context.components && context.components[tag]) {
          node = new ComponentNode(tag, context.components[tag], [])
        } else {
          node = new ElementNode('text', '')
        }
      } else {
        node = new ElementNode(tag);
      }
      pushChilren(node);
      nodeStack.push(node);
      tpl = tpl.slice(tagInitialStr.length);
    }
    else if (attrReg.test(tpl)) {
      let tagInitialStr = tpl.match(attrReg)[0];
      // 防止函数参数中间有空格
      if (/\(/.test(tpl)) {
        tagInitialStr = tpl.match(/[\w-]+[=]{1}[\s\S]+?}/g)[0];
      }
      let typeAndValueArr = tagInitialStr.split('=');
      let attrNode = handleParseAttr(typeAndValueArr[0], typeAndValueArr[1].replace(/'/g, ''));
      let currentNode = nodeStack[nodeStack.length - 1];
      if (currentNode.type === 'component') {
        currentNode.params.push(attrNode);
      } else {
        currentNode.attrs.push(attrNode);
      }
      tpl = tpl.slice(tagInitialStr.length);
    }
    else if (/^{/.test(tpl)) {
      if (/^{#if/.test(tpl)) {
        let len = tpl.match(/^{#if([\s\S]+?)}/).length;
        let option = tpl.match(/^{#if([\s\S]+?)}/)[1].trim();
        let ifBody = getExpressionBody(tpl);
        len = ifBody.length;
        ifBody = ifBody.body.match(/^{#if[\s\S]+?}([\s\S]+?){\/if}$/)[1];
        getParentNode().if = option;
        pushConditionOrChildren(null, option, 'if');
        let node = parser(getParentNode(), ifBody, 'if', option);
        tpl = tpl.slice(len);
      }
      else if (/^{#elseif/.test(tpl)) {
        let elseifBodyObj = getElseIfExpressionBody(tpl);
        let option = elseifBodyObj.option;
        let optionLen = elseifBodyObj.optionLen;
        let elseifBody = elseifBodyObj.body.slice(optionLen);
        getParentNode().elseif = option;
        pushConditionOrChildren(null, option, 'elseif');
        let node = parser(getParentNode(), elseifBody, 'elseif', option);
        tpl = tpl.slice(elseifBodyObj.length);
      }
      else if (/^{#else[\s\n\t]*}/.test(tpl)) {
        pushConditionOrChildren(null, '', 'else');
        let len = tpl.match(/^{#else[\s\n\t]*}([\s\S]+?)$/)[0].length;
        let elseBody = tpl.match(/^{#else[\s\n\t]*}([\s\S]+?)$/)[1]
        parser(getParentNode(), elseBody, 'else', '');
        tpl = tpl.slice(len);
      }
      else if (/^{#inc[\s\n\t]*[\s\S]+}/.test(tpl)) {
        let len = tpl.match(/^{#inc[\s\n\t]*([\s\S]+?)}/)[0].length;
        let incBody = tpl.match(/^{#inc[\s\n\t]*([\s\S]+?)}/)[1];
        let resultTpl = handleParseExpression.call(context, incBody, false);
        parser(getParentNode(), eval(resultTpl));
        tpl = tpl.slice(len);
      }
      else {
        if (tpl.match(/{[\s\S]+?}/)[0]) {
          let node = new ElementNode('text', tpl.match(/{[\s\S]+?}/)[0]);
          pushChilren(node);
          tpl = tpl.slice(tpl.match(/{[\s\S]+?}/)[0].length);
        } else {
          tpl = tpl.slice(1);
        }
      }
    }
    else if (innerReg.test(tpl.trim()) && !/^{#/.test(tpl.match(innerReg)[1].trim())) {
      let innerTpl, len;
      innerTpl = tpl.match(innerReg)[1];
      len = tpl.match(innerReg)[0].length - 1
      if (innerTpl) {
        let textNode = new ElementNode('text', innerTpl);
        pushChilren(textNode);
      }
      tpl = tpl.slice(len);
    }
    else {
      if (tpl.length === 0) {
        return getParentNode();
      }
      tpl = tpl.slice(1);
    }
  }
  return getParentNode();
}

function handleParseAttr(key, value) {
  switch (key) {
    case 'class':
      return new AttrNode('class', value);
    case 'style':
      return new AttrNode('style', value);
    case 'on-click':
      return new EventNode('click', value);
    default:
      // 参数
      return new AttrNode(key, value);
  }
}



export default parser;