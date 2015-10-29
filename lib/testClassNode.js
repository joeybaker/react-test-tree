var _ = require('lodash');
var inherits = require('inherits');
var testUtils = require('react/lib/ReactTestUtils');
var TestNode = require('./testNode');
var constants = require('./constants');
var utils = require('./utils');

function TestClassNode (element, updateManager) {
  TestNode.call(this, element);

  var innerComponentRef = _.get(this.element, 'constructor.innerComponentRef');
  if (innerComponentRef) {
    return new TestClassNode(this.element.refs[innerComponentRef], updateManager);
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

  this._refs = {};
  this._refCollections = {};

  updateRefs(this);
  updateRefCollections(this);

  wrapComponentDidUpdate(this);
  wrapShouldComponentUpdate(this);

  function wrapComponentDidUpdate (node) {
    var oldComponentDidUpdate = node.element.componentDidUpdate;

    node.element.componentDidUpdate = function () {
      updateRefs(node);
      updateRefCollections(node);
      if (oldComponentDidUpdate) {
        oldComponentDidUpdate.apply(this, arguments);
      }
      updateManager.nodeHasUpdated(node);
    };
  }

  function wrapShouldComponentUpdate (node) {
    var oldShouldComponentUpdate = node.element.shouldComponentUpdate || _.constant(true);

    node.element.shouldComponentUpdate = function () {
      if (updateManager.shouldNodeUpdate(node) === false) {
        return false;
      }
      return oldShouldComponentUpdate.apply(this, arguments);
    };
  }

  function updateRefs (node) {
    var nextRefs = node.element.refs;
    node._refs = _.mapValues(nextRefs, function (nextRef, refKey) {
      return getTestNode(nextRef, updateManager);
    });
  }

  function updateRefCollections (node) {
    var nodeID = node.element._reactInternalInstance._rootNodeID;
    var nextRefCollections = testUtils.findAllInRenderedTree(node.element, function (child) {
      var childProps = utils.getInstanceProps(child);
      var ownerInstance = utils.getInstanceOwner(child);
      var isOwned = ownerInstance && nodeID === ownerInstance._rootNodeID;
      return isOwned && _.has(childProps, 'refCollection');
    });

    node._refCollections = _.reduce(nextRefCollections, function (result, nextRefCollection) {
      var props = utils.getInstanceProps(nextRefCollection);
      var store = utils.getInstanceStore(nextRefCollection);
      var refKey = props.refCollection;
      var childIds = store[constants.CHILD_IDS_KEY];

      var children = testUtils.findAllInRenderedTree(node.element, function (child) {
        var childStore = utils.getInstanceStore(child);
        return _.contains(childIds, childStore[constants.ID_KEY]);
      });

      result[refKey] = _.map(children, getTestNode);

      return result;
    }, {});
  }

  function getTestNode (instance) {
    var node = instance[constants.NODE_KEY];
    if (!node) {
      if (utils.isClassInstance(instance)) {
        node = new TestClassNode(instance, updateManager);
      } else {
        node = new TestNode(instance._reactInternalComponent._currentElement);
      }
      instance[constants.NODE_KEY] = node;
    }
    return node;
  }
}

inherits(TestClassNode, TestNode);

TestClassNode.prototype.get = function (key) {
  return this._refs[key] || this._refCollections[key];
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

module.exports = TestClassNode;
