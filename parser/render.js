import parser, { ElementNode } from './parser';
import { cloneDeep } from 'loadsh';
import { handleParseExpression } from '../util';

export function setValue(astNode, data) {
  let currentNode = astNode;
  let result = [];
  let finalAstNode = null;
  if (currentNode.conditions && currentNode.conditions.length) {
    let currentCondition = getConditionResult(currentNode.conditions, data);
    currentNode.children = currentCondition ? currentCondition : [];
  }
  delete currentNode.conditions;
  switch (currentNode.tag) {
    case 'text':
      while (/({[\s\S]+})/.test(currentNode.text)) {
        currentNode.text = currentNode.text.replace(/({[\s\S]+?})/, getParsedVariable(currentNode.text, '{}', data) || '')
      }
      break;
    default:
      break;
  }

  if (currentNode.type === 'component') {
    let componentInstanceData = cloneDeep(currentNode.context.data);
    let currentAst = cloneDeep(currentNode.context.template);
    componentInstanceData = Object.assign(componentInstanceData, parseComponentParams(currentNode.params, data));
    currentNode = setValue(currentAst, componentInstanceData);
  } else {
    currentNode.attrs.forEach((attr) => setAttrValue(attr, data))
    currentNode.children = currentNode.children.map((childAst) => setValue(childAst, data))
  }
  return currentNode;
}
function parseComponentParams(params, data) {
  let extraData = {};
  params.forEach((paramObj) => {
    let key = paramObj.name;
    let { value } = paramObj;
    value = handleParseExpression(value, false)
    console.log('🐽', value);
    extraData[key] = eval(value);
  })
  return extraData;
}
// 赋值
function render(astNode) {
  let context = this;
  let result = [];
  let { data } = context;
  let { current } = context;
  let needRenderASt = null;

  if (astNode) {
    needRenderASt = astNode;
  } else {
    needRenderASt = current;
  }
  let finalDomNode = null;
  let currentRenderDom = renderElement(needRenderASt, data);
  finalDomNode = currentRenderDom;

  function renderElement(astNode, data) {
    let node = createElement(astNode);
    astNode.children.forEach((childAst) => {
      // 无法appendChild的节点
      if (![3].includes(node.nodeType)) {
        node.appendChild(renderElement(childAst, data));
      }
    })
    return node;
  }

  function createElement(astNode) {
    let { tag, attrs, text, type } = astNode;
    let domnode;
    switch (type) {
      case 'element':
        domnode = document.createElement(tag);
        break;
      case 'text':
        domnode = document.createTextNode(text);
        break;
      case 'component':

      default:
        throw new TypeError(`未识别该标签名--${type}`)
        break;
    }

    if (domnode && attrs && Array.isArray(attrs)) {
      domnode = createAttrNode(domnode, attrs)
    }

    function createEvent(targetNode, eventName, handlerName, paramsArr) {
      let event = new Event(eventName);
      targetNode.addEventListener(eventName, function ($event) {
        function getProcessedParam(paramsArr) {
          return paramsArr.map((paramName) => {
            if (paramName === '$event') {
              return $event;
            }
            return context.data[paramName];
          })
        }
        if (context[handlerName] instanceof Function) {
          context[handlerName].apply(context, getProcessedParam(paramsArr))
        }
        context.digest();
      });
      return targetNode;
    }

    function createAttrNode(targetNode, tagPropArr) {
      tagPropArr.forEach((attrObj) => {
        switch (attrObj.type) {
          case 'attribute':
            targetNode.setAttribute(attrObj.name, attrObj.value);
            break;
          case 'event':
            let parsedHandlerName = getParsedVariableName(attrObj.handler, '{(')
            let paramsArr = parsedHandlerName.match(/\(([\s\S]*)\)/)[1].replace(/\s/g, '').split(',')
            createEvent(targetNode, attrObj.name, parsedHandlerName.replace(/^this./, '').replace(/(\([\s\S]*\))/, ''), paramsArr);
            break;
          default:
            console.error(`🦊${attrObj.type}不是attribute`);
            break;
        }
      })
      return targetNode;
    }
    return domnode;
  }

  return finalDomNode;
}
function getParsedVariable(variableName, sign, data) {
  let signArr = sign.trim().split('');
  new RegExp(`[\\s\\t\\n]*${signArr[0]}([\\s\\S]+?)${signArr[1]}`)
  if (variableName) {
    if (/[\s\t\n]*{([\w]+?)}/.test(variableName)) {
      console.log('data', data)
      return data[getParsedVariableName(variableName)];
    } else {
      if (variableName) {
        return variableName.trim();
      } else {
        return ''
      }
    }
  } else {
    return '';
  }
}

function setAttrValue(attrNode, data) {
  switch (attrNode.name) {
    case 'class':
      attrNode.value = attrNode.value.replace(/{[\s\S]+}/, getParsedVariable(attrNode.value, '{}', data) || '');
      break;
    default:
      break;
  }
}

function getParsedVariableName(variableName) {
  let variableNameMatchedArr = variableName.match(/[\s\t\n]*{([\s\S]+?)}/);
  return variableNameMatchedArr[1].trim();
}

function getConditionResult(conditions, data) {
  let expressionKey = [];
  let result = conditions.map((conditionObj) => {
    if (conditionObj.if && parseOption(conditionObj.if, data)) {
      expressionKey.push('if');
      return conditionObj;
    } else if (conditionObj.elseif && parseOption(conditionObj.elseif, data)) {
      expressionKey.push('elseif');
      return conditionObj;
    } else if (conditionObj.hasOwnProperty('else')) {
      expressionKey.push('else');
      return conditionObj;
    } else {
      return null;
    }
  });
  // 筛选if表达式情况Fragment类型的元素
  result = result.filter((item) => item);
  return result.filter((item) => item[expressionKey[0]] === result[0][expressionKey[0]]);
}
function ifConditionRepeat(parentNodeConditions, currentConditionNode, type) {
  let result = false, resultIndex = -1;
  parentNodeConditions.forEach((parentConditionNode, index) => {
    if (parentConditionNode.hasOwnProperty(type) && parentConditionNode[type] === currentConditionNode[type]) {
      result = true;
      resultIndex = index;
    }
  });
  return { isRepeat: result, index: resultIndex };
}
function parseOption(optionTpl, data) {
  if (/=/.test(optionTpl)) {
    let optionArr = option.replace(/[\s\n\t]/g, '').match(/([\w\.]+)\=*([\w\.]+)/);
    let result = eval('data.' + optionArr[1]) === eval('data.' + optionArr[2]);
    return eval('data.' + optionArr[1]) === eval('data.' + optionArr[2]);
  } else {
    let result = !!eval('data.' + optionTpl.trim());
    return !!eval('data.' + optionTpl.trim())
  }
}

export default render;