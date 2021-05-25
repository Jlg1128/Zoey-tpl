import { isEqual, cloneDeep } from 'lodash';
import parser from './parser/parser';
import render from './parser/render';

function watcher(property, callback, value) {
  if (!this.watchersArr) {
    this.watchersArr = [];
  }
  this.watchersArr.push({ property, callback, oldValue: value })
};

function digest() {
  this.dirty = false;
  this.watchersArr.forEach((watcher) => {
    let { property, callback, oldValue } = watcher;
    let newValue = this[watcher.property];
    if (isEqual(oldValue, newValue)) {
      watcher.dirty = false;
    } else if (oldValue === newValue) {
      watcher.dirty = false;
    } else {
      watcher.dirty = true;
      this.dirty = true;
      if (this.count === undefined) {
        this.count = 0;
      }
      this.count++;
      watcher.callback(oldValue, newValue);
      watcher.oldValue = JSON.parse(JSON.stringify(newValue));
    }
  })
  if (this.count >= 20) {
    throw new Error('超过10次')
  }
  if (this.dirty) {
    this.dirty = false;
    this.digest();
  } else {
    if (this.count > 0) {
      this.patch();
    }
    this.count = 0;
  }
};

function patch() {
  let context = this;
  if (context.current) {
    context.old = context.current;
    context.current = cloneDeep(context.template);
    context.setValue(context.current, context.data)
    console.log('oldAst', context.old);
    console.log('newAst', context.current);
    console.log('renderDom', context.renderDom);
  }
  diff.call(context, context.$root, context.old, context.current);
  console.log(context.$root);
  // let currentAstNode = this.parser(null, this.template);
  // let dom = this.parser();
  // let $root = this.$root;
  // if ($root) {
  //   console.log('root', $root);
  // } else {
  //   document.body.appendChild(dom);
  // }
}

function diff(parentDom, oldAst, newAst) {
  let context = this;
  if (parentDom && (oldAst && newAst)) {
    updateElement(parentDom, parentDom.children[0], oldAst, newAst);
  }
  function updateElement(parentDom, currentDom, oldAst, newAst) {
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
            currentDom.innerHTML = newAst.text;
          }
        }
        updateAttr(parentDom, currentDom, oldAst.attrs, newAst.attrs);
        updateChildren(parentDom, oldAst.children, newAst.children);
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
        updateElement(parentDom, parentDom.children[newStartIndex], oldCh, newCh);
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

  function updateAttr(parentDom, currentDom, oldNodeAttrs, newNodeAttrs) {
    let i = 0;
    while (i < newNodeAttrs.length) {
      let newNodeAttr = newNodeAttrs[i];
      if (newNodeAttr.type === 'attribute') {
        if (newNodeAttr.value !== oldNodeAttrs.value) {
          currentDom.setAttribute('class', newNodeAttr.value)
        }
      }
      i++;
    }
  }
  return parentDom;
}

export {
  watcher,
  digest,
  patch,
};