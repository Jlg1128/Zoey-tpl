const { isEqual } = require('loadsh');
var watchers = [];

var $watcher = {
  watcher(variable, callback, option) {
    watchers.push(callback);
    console.log();
  },
  digest(oldVar, newVar) {
    
  }
}

function Father() {
  this.age = 10;
}

function Son() {
}

function test() {
  if (this.user) {
    this.user.push(1);
  } else {
    this.user = [1];
  }
} 
Father.prototype.test = test;
Son.prototype = new Father();
Son.prototype.constructor = Son;

let father = new Father();
father.test();

let son = new Son();
son.test();

console.log(father.user);
console.log(son.user);

