import { ElementNode } from './parser';
// 赋值
function render() {
  let context = this;
  let result = [];
  let ast = context.template;
  let { data } = context;
  let finalDomNode = null;
  if (ast) {
    finalDomNode = renderElement(ast, data);
  }
  function renderElement(astNode, data) {
    let node = createElement(astNode);
    if (astNode.conditions && astNode.conditions.length) {
      let currentCondition = getConditionResult(astNode.conditions);
      astNode.children = currentCondition ? currentCondition : [];
      astNode.children.forEach((childAst) => {
        node.appendChild(renderElement(childAst, data));
      })
    } else {
      if (astNode.children) {
        astNode.children.forEach((childAst) => {
          node.appendChild(renderElement(childAst, data));
        })
      }
    }
    return node;
  }
  function createElement(astNode) {
    let { tag, attrs, text, type } = astNode;
    let domnode;
    if (type === 'element') {
      domnode = document.createElement(tag);
    } else if (type === 'text') {
      let textValue = text.replace(/{[\s\S]+}/, getParsedVariable(text, '{}') || '')
      domnode = document.createTextNode(textValue);
    } else {
      console.error(`未识别该标签名--${type}`);
    }
    if (domnode && attrs && Array.isArray(attrs)) {
      domnode = createAttrNode(domnode, attrs)
    }

    function createEvent(targetNode, eventName, handlerName, paramsArr) {
      let event = new Event(eventName);
      targetNode.addEventListener(eventName, function($event) {
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
            targetNode.setAttribute(attrObj.name, getParsedVariable(attrObj.value, '{}'));
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
    function getParsedVariable(variableName, sign) {
      let signArr = sign.trim().split('');
      new RegExp(`[\\s\\t\\n]*${signArr[0]}([\\s\\S]+?)${signArr[1]}`)
      if (variableName) {
        if (/[\s\t\n]*{([\w]+?)}/.test(variableName)) {
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
    function getParsedVariableName(variableName) {
      let variableNameMatchedArr = variableName.match(/[\s\t\n]*{([\s\S]+?)}/);
      return variableNameMatchedArr[1].trim();
    }
    return domnode;
  }
  function getConditionResult(conditions) {
    let expressionKey = [];
    let result = conditions.map((conditionObj) => {
      if (conditionObj.if && parseOption(conditionObj.if)) {
        expressionKey.push('if');
        return conditionObj;
      } else if (conditionObj.elseif && parseOption(conditionObj.elseif)) {
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
  function parseOption(optionTpl) {
    if (/=/.test(optionTpl)) {
      let optionArr = option.replace(/[\s\n\t]/g, '').match(/([\w\.]+)\=*([\w\.]+)/);
      let result = eval('data.' + optionArr[1]) === eval('data.' + optionArr[2]);
      return eval('data.' + optionArr[1]) === eval('data.' + optionArr[2]);
    } else {
      let result = !!eval('data.' + optionTpl.trim());
      return !!eval('data.' + optionTpl.trim())
    }
  }
  return finalDomNode;
}



export default render;