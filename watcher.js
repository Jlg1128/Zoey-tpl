import { isEqual, cloneDeep } from 'lodash';
import parser, { ElementNode } from './parser/parser';
import render from './parser/render';
import Zoey from './Zoey';

// 监听data改变
function watcher(property, callback, value) {
  if (!this.watchersArr) {
    this.watchersArr = [];
  }
  this.watchersArr.push({ property, callback, oldValue: value })
};

// 脏检查
function digest(componentContext) {
  this.dirty = false;
  let context = componentContext || this;
  context.watchersArr.forEach((watcher) => {
    let { property, callback, oldValue } = watcher;
    let newValue = context[watcher.property];
    if (isEqual(oldValue, newValue)) {
      watcher.dirty = false;
    } else if (oldValue === newValue) {
      watcher.dirty = false;
    } else {
      watcher.dirty = true;
      this.dirty = true;
      if (this.digestCount === undefined) {
        this.digestCount = 0;
      }
      this.digestCount++;
      watcher.callback(oldValue, newValue);
      watcher.oldValue = JSON.parse(JSON.stringify(newValue));
    }
  })
  if (this.digestCount >= 20) {
    throw new Error('超过10次')
  }
  if (this.dirty) {
    this.dirty = false;
    this.digest(componentContext);
  } else {
    if (this.digestCount > 0) {
      this.patch();
    }
    this.digestCount = 0;
  }
};

// 准备diff了
function patch() {
  let context = this;
  if (context.current) {
    context.old = context.current;
    context.current = cloneDeep(context.template);
    context.setValue(context.current, context.data)
  }
  diff.call(context, context.$root, context.old, context.current);
}

function diff(parentDom, oldAst, newAst) {
  let context = this;
  if (parentDom && (oldAst && newAst)) {
    updateElement(parentDom, oldAst, newAst);
  }
  function updateElement(parentDom, oldAst, newAst) {
    if (newAst.type !== oldAst.type || newAst.tag !== oldAst.tag) {
      parentDom.appendChild(context.render(newAst));
    } else {
      if (newAst.children === null) {
        parentDom.innerHTML = '';
      } else if (oldAst.children === null) {
        parentDom.appendChild(context.render(newAst));
      } else {
        if (newAst.type === 'text') {
          if (newAst.text !== oldAst.text) {
            parentDom.innerHTML = newAst.text;
          }
        }

        if (!(oldAst instanceof ElementNode) || !(newAst instanceof ElementNode)) {
          updateAttr(parentDom, oldAst.current.attrs, newAst.current.attrs);
        } else {
          updateAttr(parentDom, oldAst.attrs, newAst.attrs);
        }
        let oldAstChildren = getAstChildren(oldAst.children);
        let newAstChildren = getAstChildren(newAst.children);
        updateChildren(parentDom, oldAstChildren, newAstChildren);
      }
    }
    return parentDom;
  }

  function updateChildren(parentDom, oldChildren, newChildren) {
    let oldStartIndex = 0;
    let oldENdIndex = oldChildren.length - 1;
    let newStartIndex = 0;
    let newEndIndex = newChildren.length - 1;
    while (newStartIndex <= newChildren.length - 1 && oldStartIndex <= oldChildren.length - 1) {
      let newCh = newChildren[newStartIndex];
      let oldCh = oldChildren[oldStartIndex];
      if (newCh.type !== oldCh.type || newCh.tag !== oldCh.tag) {
        parentDom.replaceChild(context.render(oldCh), context.render(newCh));
      } else if (newCh === oldCh) {

      } else {
        if (parentDom.children !== null) {
          updateElement(parentDom.children[newStartIndex], oldCh, newCh);
        }
      }
      oldStartIndex++;
      newStartIndex++;
    }
    if (oldChildren.length < newChildren.length) {
      for (var i = 0; i < newChildren.length - oldChildren.length; i++) {
        parentDom.appendChild(context.render(newChildren[oldChildren.length + i]))
      }
    }
  }

  function updateAttr(currentDom, oldNodeAttrs, newNodeAttrs) {
    let i = 0;
    while (i < newNodeAttrs.length) {
      let newNodeAttr = newNodeAttrs[i];
      let oldNodeAttr = oldNodeAttrs[i];
      if (newNodeAttr.type === 'attribute') {
        if (newNodeAttr.value !== oldNodeAttr.value) {
          currentDom.setAttribute('class', newNodeAttr.value)
        }
      }
      i++;
    }
  }
  return parentDom;
}

function isComponentObj(obj) {
  return obj && obj.current && (obj.current instanceof ElementNode) && !(obj instanceof ElementNode);
}

function getAstChildren(astChildren) {
  return astChildren.map((child) => {
    if (isComponentObj(child)) {
      return child.current;
    }
    return child;
  })
}

export {
  watcher,
  digest,
  patch,
};