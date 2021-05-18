// 赋值
function compile(ast, data) {
  let result = [];
  while (ast.children && Array.isArray(ast.children)) {

  }
  return compileElement(ast, data);
}

function compileElement(elementNode, data) {
  switch (elementNode.type) {
    case 'element':
      let node = document.createElement('div');
      elementNode.attrs.forEach((attrnode) => {
        node.setAttribute(createAttrNode(attrnode))
      })
      if (elementNode.children.length) {
        node.children = elementNode.children.map((child) => {
          compileElement(document)
        });
      }
    case 'expression':
      elementNode.setBody(data);

    default:
      break;
  }
}


function createAttrNode(attrnode) {
  switch (attrnode.name) {
    case 'class':
      let node = document.createAttribute('class');
      node.value = attrnode.value;
      return node;
    default:
      return currentElementNode.setAttribute('class', attrnode.value);
  }
}

export default compile;