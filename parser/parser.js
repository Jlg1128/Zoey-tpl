import {
  getExpressionBody,
  parseIfExpression,
  getElseIfExpressionBody,
  getElseExpressionBody,
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
  this.type = attrTypesMap[attrName]; // 'attribute' | 'if'
  this.value = value.toString();
}

function EventNode(eventName, handler) {
  this.name = eventName;
  this.handler = handler;
  this.type = 'event';
}

function ExpressionNode(name, expressionTpl, data, option) {
  this.expressionTpl = expressionTpl;
  let self = this;;
  this.body = null;
  this.setBody = function (data) {
    self.value = parser(self, expressionTpl);
  }
  // 条件表达式
  this.option = option;
  this.type = 'expression';
  this.name = name; // 'attribute' | 'if'
  this.value = null;
}

function IfExpressionNode(name, expressionTpl, data, option) {
  let self = this;
  // 条件表达式
  this.optionList = [];
  this.type = 'expression';
  this.name = name; // 'attribute' | 'if'
  this.value = null;
}

function parseExpression(expressionTpl, data) {
  let variableName = expressionTpl.replace(/[^\w]+/g, '');
  variableName = data[variableName];
  return data[variableName];
}

let reg = /\w/g;
let next = 0;
// /^<(?!\/[a-zA-Z]+?)[\t\n\s]*/
// 匹配开始标签
let tagPrefixReg = /^<[\w]*[\t\n\s]*/;
// 匹配标签内部属性值
let attrReg = /[\w-]+[=]{1}[^\s\t\n>]*/g
// 匹配闭合标签
let tagSuffixReg = /^<\/[\t\n\s]*[\w]*>/;
// 匹配非英文
let notWordReg = /[^\w]/g;
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
    console.log('🦊parent', nodeStack.length);
    let parent = getParentNode();
    if (isExpmode && (parent['if'] || parent['elseif'] || parent['else']) && nodeStack.length === 0) {
      // if (isExpmode) {
      pushConditionOrChildren(node, parent[type], type);
    } else {
      if (nodeStack.length) {
        nodeStack[nodeStack.length - 1].children.push(node);
      } else {
        parentNode.children.push(node); ``
      }
    }
    return getParentNode();
  }
  function pushConditionOrChildren(conditionNode, condition, type) {
    // console.log('node🦊', conditionNode);
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
      return parentNode;
    }
  }
  console.log('tpl', tpl);
  if (tpl) {
    tpl = tpl.replace(/\n/g, '');
  }
  while (true) {
    if (!tpl || tpl.length === 0) {
      break;
    }
    // 匹配标签开始前缀
    if (!/<|>/g.test(tpl)) {
      return new ElementNode('text', tpl)
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
        }
      }
      tpl = tpl.slice(tagInitialStr.length);
    }
    else if (tagPrefixReg.test(tpl)) {
      let tagInitialStr = tpl.match(tagPrefixReg)[0];
      let tag = tagInitialStr.replace(notWordReg, '');
      let node = new ElementNode(tag);
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
      console.log('😁', tagInitialStr);
      let typeAndValueArr = tagInitialStr.split('=');
      let attrNode = handleParseAttr(typeAndValueArr[0], typeAndValueArr[1].replace(/'/g, ''));
      nodeStack[nodeStack.length - 1].attrs.push(attrNode);
      tpl = tpl.slice(tagInitialStr.length);
    }
    else if (/^{/.test(tpl)) {
      if (/^{#if/.test(tpl)) {
        console.log('🦊tpl', tpl);
        let len = tpl.match(/^{#if([\s\S]+?)}/).length;
        let option = tpl.match(/^{#if([\s\S]+?)}/)[1].trim();
        let ifBody = getExpressionBody(tpl);
        console.log('ifBody', ifBody);
        len = ifBody.length;
        ifBody = ifBody.body.match(/^{#if[\s\S]+?}([\s\S]+?){\/if}$/)[1];
        getParentNode().if = option;
        pushConditionOrChildren(null, option, 'if');
        let node = parser(getParentNode(), ifBody, 'if', option);
        console.log('parent', getParentNode());
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
        console.log('parentelse', getParentNode());
        tpl = tpl.slice(elseifBodyObj.length);
      }
      else if (/^{#else[\s\n\t]*}/.test(tpl)) {
        getParentNode().elseif = 'true';
        pushConditionOrChildren(null, '', 'else');
        let len = tpl.match(/^{#else[\s\n\t]*}([\s\S]+?)$/)[0].length;
        let elseBody = tpl.match(/^{#else[\s\n\t]*}([\s\S]+?)$/)[1]
        let node = parser(getParentNode(), elseBody, 'else', '');
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
      let textNode = new ElementNode('text', innerTpl);
      pushChilren(textNode);
      tpl = tpl.slice(len);
    }
    else {
      if (tpl.length === 0) {
        return getParentNode();
      }
      console.log('🐽🐽', tpl.slice(0, 1));
      tpl = tpl.slice(1);
      console.log('无匹配🦊🦊🦊🦊🦊', tpl);
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
      console.log('value', value);
      return new ExpressionNode(value.replace(/[{}]+/g, ''), value);
      break;
  }
}

function handleParseExpressionTpl(tpl) {
  // 判断是否是表达式
  if (/{(?=#)/.test(tpl)) {
    if (!ifEndReg.test(tpl)) {
      console.error('if语法错误');
    } else {
      // if (/{(?=#if)/.test(tpl))
    }
  } else {
    // 是普通的参数赋值进入此处
    return new ExpressionNode()
  }
}

function parseIf(tpl) {

}

export default parser;