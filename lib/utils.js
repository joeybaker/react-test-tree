var ReactDOM = require('react-dom');
var _ = require('lodash');
var testUtils = require('react/lib/ReactTestUtils');

function getInstanceProperty (instance, prop) {
  var paths = ['', '_reactInternalComponent._currentElement.', '_reactInternalInstance._currentElement.'];
  return _.reduce(paths, function (found, path) {
    if (!found) {
      return _.get(instance, path + prop);
    } else {
      return found;
    }
  }, null);
}

function getTestStore (instance) {
  var store = getInstanceProperty(instance, '_store');
  if (store) {
    if (!store._rtt) {
      store._rtt = {};
    }
    return store._rtt;
  }
}

function isClassInstance (instance) {
  return !!instance._reactInternalInstance;
}

function getDOMNode (element) {
  if (element.getInputDOMNode) {
    return element.getInputDOMNode();
  } else if (isClassInstance(element)) {
    return ReactDOM.findDOMNode(element);
  } else {
    var store = getTestStore(element);
    if (store) {
      return testUtils.findAllInRenderedTree(element._owner._instance, function (node) {
        var nodeStore = getTestStore(node);
        return nodeStore.id === store.id;
      })[0];
    }
  }
}

module.exports = {
  getTestStore: getTestStore,
  isClassInstance: isClassInstance,
  getDOMNode: getDOMNode
};
