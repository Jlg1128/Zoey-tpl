let classReg = /({[\w]+})/g
let str = `<span>{#if username === obj}<span>{#if ok}<div></div>{/if}</span>{/if}</span>`
let classStr = `<div class='show'></div>`

function getExpressionBody(tpl) {
  let originStr = tpl;
  let expressionStack = [];
  let start = 0;
  let end = 0;
  let len = 0;
  while (tpl.length) {
    if (/^{#if[\s\S]+?}/.test(tpl)) {
      let optionTpl = tpl.match(/^{#if[\s\S]+?}/);
      let matchLen = optionTpl[0].length;
      if (expressionStack.length === 0) {
        start = len;
      }
      len += matchLen;
      expressionStack.push('if');
      tpl = tpl.slice(matchLen);
    } else if (/^{\/if}/.test(tpl)) {
      let endTpl = tpl.match(/^{\/if}/);
      let matchLen = endTpl[0].length;
      if (!expressionStack.length) {
        throw new SyntaxError('Unexpected Token');
      } else if (expressionStack.length === 1) {
        end = matchLen + len;
        return { length: end - endTpl[0].length, body: originStr.slice(start, end) };
      } else {
        expressionStack.pop();
        tpl = tpl.slice(matchLen);
        len += matchLen;
      }
    } else if (/^{#elseif[\s\S]+?}/.test(tpl)) {

    }
    else {
      tpl = tpl.slice(1);
      len += 1;
    }
  }
}

function getElseIfExpressionBody(tpl) {
  let originStr = tpl;
  let expressionStack = [];
  let start = 0;
  let end = 0;
  let len = 0;

  while (tpl.length) {
    if (expressionStack.length !== 0 && (/^{#elseif[\s\S]+?}/.test(tpl) || /^{#if[\s\S]+?}/.test(tpl) || /^{\/if}/.test(tpl))) {
      let resultTpl = originStr.slice(start, len);
      return {
        length: len - start,
        body: resultTpl,
        option: resultTpl.match(/^{#elseif([\s\S]+?)}/) ? resultTpl.match(/^{#elseif([\s\S]+?)}/)[1].trim() : '',
        optionLen: resultTpl.match(/^{#elseif([\s\S]+?)}/) ? resultTpl.match(/^{#elseif([\s\S]+?)}/)[0].length : 0,
      }
    } else if (/^{#elseif[\s\S]+?}/.test(tpl)) {
      let optionTpl = tpl.match(/^{#elseif[\s\S]+?}/);
      let matchLen = optionTpl[0].length;
      expressionStack.push('elseif');
      start = len;
      len += matchLen;
      tpl = tpl.slice(matchLen);
    } else {

      tpl = tpl.slice(1);
      len += 1;
    }
  }
  let resultTpl = originStr.slice(start, len);
  if (tpl.length === 0 && expressionStack.length) {
    return {
      length: len - start,
      body: originStr.slice(start),
      option: resultTpl.match(/^{#elseif([\s\S]+?)}/) ? resultTpl.match(/^{#elseif([\s\S]+?)}/)[1].trim() : '',
      optionLen: resultTpl.match(/^{#elseif([\s\S]+?)}/) ? resultTpl.match(/^{#elseif([\s\S]+?)}/)[0].length : 0,
    }
  }
  return { length: 0, body: '' }
}

function getElseExpressionBody(tpl) {
  let originStr = tpl;
  let expressionStack = [];
  let start = 0;
  let end = 0;
  let len = 0;

  while (tpl.length) {
    if (/^{#else[\s\n\t]*}/.test(tpl)) {
      start = len;
      return {
        length: originStr.length - start,
        body: originStr.slice(start),
      }
    } else {
      tpl = tpl.slice(1);
      len += 1;
    }
  }
  return {
    length: originStr.length - start,
    body: originStr.slice(start),
  }
}
let mystr = '{username}';
let res = mystr.match(/[\s\t\n]*{([\w]+?)}/);

let final = 'obj.name';
let data = {
  obj: {
    name: 12
  },
  age: 12,
}

final = 'data.' + final;

let teststr2 = 'on-click={this.handleClick(show, $event)} ';

let value = `123
</span>`

function MyTest() {
  this.name = '10';
}

function Child() {
  this.test = '20';
}

Child.prototype = new MyTest();

let instance = new Child();
instance.constructor.prototype.log2 = function () {
  console.log('哈哈哈');
};
instance.log2();
let instance2 = new Child();
instance2.log2();
