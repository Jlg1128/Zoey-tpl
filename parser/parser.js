import {
  getExpressionBody,
  parseIfExpression,
  getElseIfExpressionBody
} from '../util';
// 词法分析
// let tpl = `<div class='show'>{#if show}<span>{username}</span>{/if}</div>`;
let tpl = `<div><span>{show}</span></div>`;

const tag = ['div', 'span', 'p', 'img'];

let tagTypesMap = {
  div: 'element',
  span: 'element',
  p: 'element',
  img: 'element',
  text: 'text',
  expression: 'expression',
}
let attrTypesMap = {
  class: 'attribute',
  style: 'style',
  event: 'event',
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

function AttrNode(name, value) {
  this.name = name; // 'class'
  this.type = attrTypesMap[name]; // 'attribute' | 'if'
  this.value = value.toString();
}

function ExpressionNode(name, expressionTpl, data, option) {
  this.expressionTpl = expressionTpl;
  let self = this;;
  this.body = null;
  this.setBody = function (data) {
    self.value = parse(self, expressionTpl);
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
let tagPrefixReg = /^<[a-zA-Z]*[\t\n\s]*/;
// 匹配标签内部属性值
let attrReg = /[\w]*[=]{1}[^\s\t\n>]*/g
// 匹配闭合标签
let tagSuffixReg = /^<\/[\t\n\s]*[a-zA-Z]*>/;
// 匹配非英文
let notWordReg = /[^\w]/g;
// 是否为innerHtml
let innerReg = /^>(?!{|[\s\t\n])([\s\S]*?)</;
// 是否是表达式
let expressionReg = /{/g

// 表达式是否为传参
let isParam = function (tpl) {
  return !/{(?=#)/.test(tpl) && /{/.test(tpl);
}

function parse(parentNode, tpl, type) {
  let nodeStack = [];
  let expressionStack = [];
  let context = this;
  function pushChilren(node) {
    let isExpmode = !!type;
    if (isExpmode && (getParentNode()['if'] || getParentNode()['elseif'])) {
      pushConditionOrChildren(node, type);
    } else {
      if (nodeStack.length) {
        nodeStack[nodeStack.length - 1].children.push(node);
      } else {
        parentNode.children.push(node);
      }
    }
    return getParentNode();
  }
  function pushConditionOrChildren(condition, type) {
    if (typeof condition === 'string') {
      if (type) {
        getParentNode()[type] = condition;
      }
      getParentNode().condition = condition;
    } else if (condition instanceof ElementNode) {
      getParentNode().conditions.push(condition);
    } else {
      throw new Error('condition类型错误');
    }
  }
  function getParentNode() {
    if (nodeStack.length) {
      return nodeStack[nodeStack.length - 1];
    } else {
      return parentNode;
    }
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
          if (i === 0) {
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
      if (nodeStack.length) {
        nodeStack[nodeStack.length - 1].children.push(node);
      }
      nodeStack.push(node);
      tpl = tpl.slice(tagInitialStr.length);
    }
    else if (/^{/.test(tpl)) {
      if (/^{#if/.test(tpl)) {
        let len = tpl.match(/^{#if([\s\S]+?)}/).length;
        let option = tpl.match(/^{#if([\s\S]+?)}/)[1].trim();
        let ifBody = getExpressionBody(tpl);
        console.log('ifBody', ifBody);
        len = ifBody.length;
        ifBody = ifBody.body.match(/^{#if[\s\S]*}([\s\S]*){\/if}$/)[1];
        pushConditionOrChildren(option, 'if');
        let node = parse(getParentNode(), ifBody, 'if');
        console.log('parent', getParentNode());
        tpl = tpl.slice(len);
      }
      else if (/^{#elseif/.test(tpl)) {
        let len = tpl.match(/^{#elseif([\s\S]+?)}/).length;
        let option = tpl.match(/^{#elseif([\s\S]+?)}/)[1].trim();
        let ifBody = getExpressionBody(tpl);
        len = ifBody.length;
        ifBody = ifBody.body.match(/^{#elseif[\s\S]*}([\s\S]*){$/)[1];
        pushConditionOrChildren(option, 'elseif');
        let node = parse(getParentNode(), ifBody, 'elseif');
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
    else if (attrReg.test(tpl)) {
      let tagInitialStr = tpl.match(attrReg)[0];
      let typeAndValueArr = tagInitialStr.split('=');
      let attrNode = handleParseAttr(typeAndValueArr[0], typeAndValueArr[1].replace(/'/g, ''));
      nodeStack[nodeStack.length - 1].attrs.push(attrNode);
      tpl = tpl.slice(tagInitialStr.length);
    }
    else if (innerReg.test(tpl)) {
      let innerTpl, len;
      // 判断是否是表达式
      innerTpl = tpl.match(innerReg)[1];
      len = tpl.match(innerReg)[0].length - 1
      let textNode = new ElementNode('text', innerTpl);
      pushChilren(textNode);
      tpl = tpl.slice(len);
    }
    else {
      tpl = tpl.slice(1);
      console.log('无匹配🦊🦊🦊🦊🦊', tpl);
    }
  }

}

function handleParseAttr(key, value) {
  switch (key) {
    case 'class':
      return new AttrNode('class', value);
    case 'style':
      return new AttrNode('style', value);
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

export default parse;