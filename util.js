function mergeObject(toObj, fromObj, override) {
  for (var i in fromObj) {
    if (!toObj[i] || override) {
      toObj[i] = fromObj[i];
    }
  }
  return toObj;
}

function setProtoFromOptions(obj) {
  function Foo() {

  }
  Foo.prototype = new obj();
  return fn;
}

function implement(obj) {
  let proto = this.prototype;
  for (var i in obj) {
    if (!proto.hasOwnProperty(i)) {
      proto[i] = obj[i];
    }
  }
}

function inject(parentNode, node) {
  parentNode.appendChild(node);
}

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
        return { length: end, body: originStr.slice(start, end) };
      } else {
        expressionStack.pop();
        tpl = tpl.slice(matchLen);
        len += matchLen;
      }
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

function parseIfExpression(parentNode, tpl) {
  if (/^{\/if}/.test(tpl)) {
    console.log(tpl.match(/^{\/if[\s\S]+?}/)[0]);
    let condition = tpl.match(/^{#if[\s\t\n]+([\s\S]+?)}/)[1];
    // let conditionObj = {
    //   children: [],
    //   if: condition,
    //   ifConditions: [],
    // }
  }
}
export {
  mergeObject,
  setProtoFromOptions,
  implement,
  inject,
  getExpressionBody,
  getElseIfExpressionBody,
}

