import { isEqual } from 'lodash';

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
  let dom = this.render();
  let $root = this.$root;
  if ($root) {
    $root.rep(dom);

  } else {
    document.body.appendChild(dom);
  }
}


export {
  watcher,
  digest,
  patch,
};