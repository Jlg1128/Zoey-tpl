const _ = require('loadsh');

let obj = {
  name: 'jlg',
}

let newobj = _.cloneDeep(obj);
obj.age = 10;
console.log(newobj);


