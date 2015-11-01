var _ = require('lodash');
var inherits = require('inherits');
var TestNode = require('./testNode');
var constants = require('./constants');
var utils = require('./utils');

function TestClassNode (element, idManager) {
  TestNode.call(this, element);

  this._idManager = idManager;

  var innerTestRef = _.get(this.element, 'constructor.innerTestRef');
  if (innerTestRef) {
    return this.get(innerTestRef);
  }

  Object.defineProperty(this, 'state', {
    get: function () {
      return this.element.state;
    }
  });

  Object.defineProperty(this, 'ref', {
    get: function () {
      return this.element._reactInternalInstance._currentElement.ref;
    }
  });

  Object.defineProperty(this, 'key', {
    get: function () {
      return this.element._reactInternalInstance._currentElement.key;
    }
  });
}

inherits(TestClassNode, TestNode);

TestClassNode.prototype.get = function (key) {
  var nodeIds = utils.getTestStore(this.element).nodeIds[key];
  var idManager = this._idManager;

  if (nodeIds instanceof Array) {
    return _.map(nodeIds, getNode);
  } else {
    return getNode(nodeIds);
  }

  function getNode (nodeId) {
    var element = idManager.getElementById(nodeId);
    if (element) {
      return getTestNode(element, idManager);
    }
  }
};

TestClassNode.prototype.getIn = function (path) {
  if (!(path instanceof Array)) {
    throw new Error('Ref path must be an array');
  }
  return _.reduce(path, function (node, key) {
    if (node) {
      return node.get(key);
    }
  }, this);
};

function getTestNode (instance, idManager) {
  var node = instance[constants.NODE_KEY];
  if (!node) {
    if (utils.isClassInstance(instance)) {
      node = new TestClassNode(instance, idManager);
    } else {
      node = new TestNode(instance._reactInternalComponent._currentElement);
    }
    instance[constants.NODE_KEY] = node;
  }
  return node;
}

module.exports = TestClassNode;
