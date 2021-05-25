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

function extend(fn, obj) {
  Object.keys(obj).forEach((property) => {
    if (obj.hasOwnProperty(property)) {
      if (fn.prototype[property] === undefined) {
        fn.prototype[property] = obj[property];
      }
    }
  })
  return fn;
}

function inject(parentNode) {
  if (!isHtmlELement(parentNode)) {
    throw new Error('注入的不是dom节点');
  }
  this.$root = parentNode;
  parentNode.appendChild(this.renderDom);
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
        optionLen: resultTpl.match(/^{#elseif([\s\S]+?)}/) ? resultTpl.match(/^{#elseif([\s\S]+?)}/)[0].length : 0,
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

function isHtmlELement(node) {
  return node && typeof node === 'object' && node.nodeType && typeof node.nodeName === 'string';
}

// 解析表达式，this必须指向实例
function handleParseExpression(tpl, needThis) {
  tpl = tpl.replace(/{|}/g, '');
  tpl = tpl.replace(/([\w\$\.\{\}'"]+)/g, ($1, $2) => {
    $2 = $2.trim();
    if (!/^this./.test($2) && !/'|"/.test($2)) {
      return needThis ? `this.data.${$2}` : `data.${$2}`;
    }
    return $2;
  })
  return tpl;
}
export {
  mergeObject,
  setProtoFromOptions,
  implement,
  inject,
  getExpressionBody,
  getElseIfExpressionBody,
  getElseExpressionBody,
  extend,
  isHtmlELement,
  handleParseExpression,
}

