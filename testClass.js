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
  return { length: 0, body: '' }
}
let mystr = '{#if show}<span>123{#elseif username==="jlg"}<span></span>{/if}';

let res = getElseIfExpressionBody(mystr);
console.log(res);