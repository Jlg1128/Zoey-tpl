import * as util from './util';

function extend(options) {
  function inheritPrototype(subType, superType) {
    var prototype = Object.create(superType.prototype); // 创建对象，创建父类原型的一个副本
    prototype.constructor = subType;                    // 增强对象，弥补因重写原型而失去的默认的constructor 属性
    subType.prototype = prototype;                      // 指定对象，将新创建的对象赋值给子类的原型
  }
  // 父类初始化实例属性和原型属性
  let supr = this;
  let suprOptions = supr.prototype;
  // 借用构造函数传递增强子类实例属性（支持传参和避免篡改）
  function fn(ops) {
    supr.apply(this, options);
  }

  fn.prototype = new supr();
  fn.prototype.constructor = fn;
  let proto = fn.prototype;
  function implement(options) {
    for (var key in options) {
      // util.mergeObject(proto[key], options[key]);
      proto[key] = options[key];
    }
  }

  fn.extend = extend;
  fn.implement = implement;
  
  fn.implement(options);
  // util.mergeObject(new fn(), options);
  // 将父类原型指向子类
  // inheritPrototype(fn, supr);
  return fn;
}

export default extend;