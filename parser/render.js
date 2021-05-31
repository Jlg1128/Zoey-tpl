import Zoey from '../Zoey';
import parser, { ElementNode, ComponentNode } from './parser';
import { cloneDeep } from 'loadsh';
import { handleParseExpression } from '../util';
import { isComponentObj } from '../watcher';

export function setValue(astNode, data) {
  let context = this;
  let currentNode = astNode;
  let result = [];
  let finalAstNode = null;
  // 处理if条件，将conditions根据当前data赋值到currentNode的children上

  if (currentNode.conditions && currentNode.conditions.length) {
    // let currentCondition = getConditionResult(currentNode.conditions, data);
    currentNode = processConditionToChildren(currentNode, data);
  }
  console.log('astNode', astNode);
  if (astNode.isFake) {
    astNode = currentNode.children[0];
  }

  // delete currentNode.conditions;
  switch (currentNode.tag) {
    case 'text':
      if (/({[\s\S]+})/.test(currentNode.text)) {
        currentNode.text = currentNode.text.replace(/({[\s\S]+?})/, getParsedVariable(currentNode.text, '{}', data) || '')
      }
      break;
    default:
      break;
  }

  // 主要是相关赋值操作，接下来的render步骤需要着重区分component节点和普通Element节点
  if (currentNode.type === 'component') {
    let componentContext = currentNode.context;
    let componentInstanceData = Object.assign(componentContext.data, parseComponentParams(currentNode.params, data));
    componentContext.current = cloneDeep(componentContext.template);
    componentContext.rootContext = context;
    componentContext.setValue(componentContext.current, componentInstanceData);
    currentNode = componentContext;

  } else if (currentNode.type === 'expression' && currentNode.name === 'list') {
    if (currentNode.body instanceof ElementNode) {
      if (!currentNode.listsName) {
        throw new ReferenceError(`${currentNode.listsName}未定义`);
      }
      let list = context.data[currentNode.listsName]
      if (!Array.isArray(list)) {
        throw new TypeError(`${currentNode.listsName}必须为数组`)
      }
      let parentNode = null;
      console.log('cur😃', currentNode);
      if (currentNode.parentNode) {
        parentNode = currentNode.parentNode;
      } else {
        parentNode = new ElementNode('div');
        parentNode.isFake = true;
      }
      parentNode.children = list.map((item, index) => {
        let itemAst = cloneDeep(currentNode.body);
        if (!currentNode.itemKeyName || /index/.test(currentNode.itemKeyName)) {
          itemAst.key = index;
        } else {
          let vars = currentNode.itemKeyName.trim().replace(/{}/g, '').split('.').slice(1);
          itemAst.key = getDataFromTpl(vars, list[index]);
        }
        return setValue.call(context, itemAst, list[index])
      });
      console.log('fakeNode', parentNode);
      return parentNode;
    }
  } else {
    currentNode.attrs && currentNode.attrs.forEach((attr) => setAttrValue(attr, data))
    if (Array.isArray(currentNode.children) && currentNode.children.length) {
      currentNode.children = currentNode.children.map((childAst) => setValue.call(context, childAst, data)) || []
    }
  }
  return astNode;
}
function parseComponentParams(params, data) {
  let extraData = {};
  params.forEach((paramObj) => {
    let key = paramObj.name;
    let { value } = paramObj;
    value = handleParseExpression(value, false)
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
  let componentContext = null;
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
    let res = astNode instanceof ElementNode;
    if (isComponentObj(astNode)) {
      componentContext = astNode;
      astNode = astNode.current;
      data = astNode.data;
    }
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
      let currentContext = componentContext || context;
      function listener($event) {
        // 处理模版中携带的形式参数,例如on-click={this.handle($event, show)}
        function getProcessedParam(paramsArr) {
          return paramsArr.map((paramName) => {
            if (paramName === '$event') {
              return $event;
            }
            return currentContext.data[paramName] || paramName;
          })
        }
        if (currentContext[handlerName] instanceof Function) {
          currentContext[handlerName].apply(currentContext, getProcessedParam(paramsArr))
        }
        // 判断是否是组件的context;
        if (componentContext) {
          if (componentContext.watchersArr) {
            context.watchersArr = context.watchersArr.concat(componentContext.watchersArr);
          }
        }
        // 如果是组件的上下文则需要将context代入到digest中;
        context.digest();
        // componentContext.rootContext.update()
      }
      targetNode.addEventListener(eventName, listener.bind(currentContext));
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
            let paramsArr = parsedHandlerName.match(/\(([\s\S]*)\)/)[1].replace(/\s/g, '').split(',').filter((item) => item);
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
// 解析{user.name}这种表达式
function getDataFromTpl(arr, data) {
  let i = 0;
  let curData = data;
  while (i < arr.length) {
    curData = curData[arr[i]];
    i++;
  }
  return curData
}
function getParsedVariable(variableName, sign, data) {
  let signArr = sign.trim().split('');
  // new RegExp(`[\\s\\t\\n]*${signArr[0]}([\\s\\S]+?)${signArr[1]}`);
  variableName = variableName.match(/[\s\n]*{([\s\S]+?)}/)[1]
  if (variableName) {
    if (/\./.test(variableName)) {
      let vars = variableName.trim().split('.').slice(1);
      return getDataFromTpl(vars, data);
    } else if (/[\s\t\n]*{([\w]+?)}/.test(variableName)) {
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

function processConditionToChildren(currentNode, data) {
  if (currentNode.conditions) {
    let childAst = getConditionResult(currentNode.conditions, data);
    if (childAst && (childAst instanceof ElementNode || childAst instanceof ComponentNode)) {
      currentNode.children.push(childAst);
    }
    //@Todo 组件的data情况，待处理
    // processConditionToChildren(currentCondition, data);
  }
  return currentNode;
}
function getConditionResult(conditions, data) {
  let expressionKey = [];
  let result = [];
  let i = 0;
  while (i < conditions.length) {
    let conditionObj = conditions[i];
    if (conditionObj.level) {
      if (parseOption(conditionObj.parentOption, data)) {
        return getConditionResult(conditionObj.conditions, data)
      } else {

        i++;
        continue;
      }
    } else if (conditionObj.if && parseOption(conditionObj.if, data)) {
      expressionKey.push('if');
      result.push(conditionObj);
      return conditionObj;
    } else if (conditionObj.elseif && parseOption(conditionObj.elseif, data)) {
      expressionKey.push('elseif');
      result.push(conditionObj);
      return conditionObj;
    } else if (conditionObj.hasOwnProperty('else')) {
      expressionKey.push('else');
      result.push(conditionObj);
      return conditionObj;
    } else {
      // return null;
    }
    i++;
  }
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