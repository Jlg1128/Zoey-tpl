function getRootNode() {
  return document.getElementById('app')
}

let env = {
  getRootNode,
  isBroser: typeof document !== "undefined" && !!document.nodeType,
  isNode: typeof process !== "undefined" && ( '' + process ) === '[object process]',
}

export default env;