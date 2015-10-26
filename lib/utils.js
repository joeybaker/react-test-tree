var ReactDOM = require('react-dom');
var testUtils = require('react/lib/ReactTestUtils');
var constants = require('./constants');

function getInstanceOwner (instance) {
  if (isClassInstance(instance)) {
    return instance._reactInternalInstance._currentElement._owner;
  } else {
    return instance._reactInternalComponent._currentElement._owner;
  }
}

function getInstanceProps (instance) {
  if (isClassInstance(instance) || isReactElement(instance)) {
    return instance.props;
  } else {
    return instance._reactInternalComponent._currentElement.props;
  }
}

function isClassInstance (instance) {
  return !!instance._reactInternalInstance;
}

function isReactElement (instance) {
  return !!instance._isReactElement;
}

function getDOMNode (element) {
  if (element.getInputDOMNode) {
    return element.getInputDOMNode();
  } else if (isClassInstance(element)) {
    return ReactDOM.findDOMNode(element);
  } else {
    var props = getInstanceProps(element);
    var elementId = props[constants.ID_KEY];
    return testUtils.findAllInRenderedTree(element._owner._instance, function (node) {
      var nodeProps = getInstanceProps(node);
      return nodeProps[constants.ID_KEY] === elementId;
    })[0];
  }
}

module.exports = {
  getInstanceOwner: getInstanceOwner,
  getInstanceProps: getInstanceProps,
  isClassInstance: isClassInstance,
  getDOMNode: getDOMNode,
  ID_KEY: '__rttId',
  CHILD_IDS_KEY: '__rttChildIds',
  NODE_KEY: '__rttNode'
};
