var _ = require('lodash');
var inherits = require('inherits');
var utils = require('react/lib/ReactTestUtils');
var TestNode = require('./testNode');

var ID_KEY = '__rttId';
var CHILD_IDS_KEY = '__rttChildIds';
var NODE_KEY = '__rttNode';

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

  this._previousRefNodes = [];
  this._previousRefCollectionKeys = [];

  var protectedProperties = Object.getOwnPropertyNames(this);

  updateRefs(this);

  wrapComponentDidUpdate(this);
  wrapShouldComponentUpdate(this);

  function wrapComponentDidUpdate (node) {
    var oldComponentDidUpdate = node.element.componentDidUpdate;

    node.element.componentDidUpdate = function () {
      updateRefs(node);
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

    var nextRefNodes = _.map(nextRefs, function (nextRef, refKey) {
      var nextRefNode = getTestNode(nextRef, updateManager);
      ensureSafeRefName(refKey);
      node[refKey] = nextRefNode;
      return nextRefNode;
    });

    _(node._previousRefNodes)
      .difference(nextRefNodes)
      .each(function (deadRefNode) {
        delete node[deadRefNode.ref];
      })
      .value();

    node._previousRefNodes = nextRefNodes;

    updateRefCollections(node);
  }

  function updateRefCollections (node) {
    var nodeID = node.element._reactInternalInstance._rootNodeID;
    var nextRefCollections = utils.findAllInRenderedTree(node.element, function (child) {
      var childProps = getInstanceProps(child);
      var ownerInstance = getInstanceOwner(child);
      var isOwned = ownerInstance && nodeID === ownerInstance._rootNodeID;
      return isOwned && _.has(childProps, 'refCollection');
    });

    var nextRefCollectionKeys = _.map(nextRefCollections, function (nextRefCollection) {
      var props = getInstanceProps(nextRefCollection);
      var refKey = props.refCollection;
      var childIds = props[CHILD_IDS_KEY];

      ensureSafeRefName(refKey);

      var children = utils.findAllInRenderedTree(node.element, function (child) {
        var childProps = getInstanceProps(child);
        return _.contains(childIds, childProps[ID_KEY]);
      });

      node[refKey] = _.map(children, getTestNode);

      return refKey;
    });

    _(node._previousRefCollectionKeys)
      .difference(nextRefCollectionKeys)
      .each(function (deadRefCollectionKey) {
        delete node[deadRefCollectionKey];
      })
      .value();

    node._previousRefCollectionKeys = nextRefCollectionKeys;
  }

  function ensureSafeRefName (refName) {
    if (_.contains(protectedProperties, refName)) {
      console.warn('Attempted to overwrite protected TestClassNode method with ref: ' + refName);
    }
  }

  function getTestNode (instance) {
    var node = instance[NODE_KEY];
    if (!node) {
      if (isClassInstance(instance)) {
        node = new TestClassNode(instance, updateManager);
      } else {
        node = new TestNode(instance._reactInternalComponent._currentElement);
      }
      instance[NODE_KEY] = node;
    }
    return node;
  }
}

inherits(TestClassNode, TestNode);

function getInstanceOwner (instance) {
  if (isClassInstance(instance)) {
    return instance._reactInternalInstance._currentElement._owner;
  } else {
    return instance._reactInternalComponent._currentElement._owner;
  }
}

function getInstanceProps (instance) {
  if (isClassInstance(instance)) {
    return instance.props;
  } else {
    return instance._reactInternalComponent._currentElement.props;
  }
}

function isClassInstance (obj) {
  return !!obj._reactInternalInstance;
}

module.exports = TestClassNode;
