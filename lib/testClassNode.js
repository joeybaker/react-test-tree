var _ = require('lodash');
var inherits = require('inherits');
var utils = require('react/lib/ReactTestUtils');
var TestNode = require('./testNode');
var getDOMNode = require('./getDOMNode');

function TestClassNode (element, updateManager) {

  TestNode.call(this, element);

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

    var nextRefNodes = _.map(nextRefs, function (nextRef, refKey) {
      var nextRefNode = node[refKey];
      if (!nextRefNode) {
        if (isClassInstance(nextRef)) {
          nextRefNode = new TestClassNode(nextRef, updateManager);
        } else {
          nextRefNode = new TestNode(nextRef._reactInternalComponent._currentElement);
        }
      }
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
  }

  function updateRefCollections (node) {
    var nodeID = node.element._reactInternalInstance._rootNodeID;
    var nextRefCollections = utils.findAllInRenderedTree(node.element, function (child) {
      var childProps;
      var ownerInstance;
      if (isClassInstance(child)) {
        childProps = child.props;
        ownerInstance = element._reactInternalInstance._currentElement._owner;
      } else {
        var component = child._reactInternalComponent;
        childProps = component._currentElement.props;
        ownerInstance = component._currentElement._owner;
      }
      var isOwned = ownerInstance && nodeID === ownerInstance._rootNodeID;
      return isOwned && _.has(childProps, 'refCollection');
    });

    var nextRefCollectionKeys = _.map(nextRefCollections, function (nextRefCollection) {
      var refKey;
      if (isClassInstance(nextRefCollection)) {
        refKey = nextRefCollection.props.refCollection;
      } else {
        refKey = nextRefCollection._reactInternalComponent._currentElement.props.refCollection;
      }
      ensureSafeRefName(refKey);

      node[refKey] = node[refKey] || [];

      var children = getDirectChildren(nextRefCollection);
      node[refKey] = _.map(children, function (child) {
        if (!isClassInstance(child)) {
          child = child._currentElement;
        }
        var childDOMNode = getDOMNode(child);
        var previousNode = _.find(node[refKey], function (previousNode) {
          return getDOMNode(previousNode.element) === childDOMNode;
        });
        if (previousNode) {
          return previousNode;
        } else if (isClassInstance(child)) {
          return new TestClassNode(child, updateManager);
        } else {
          return new TestNode(child);
        }
      });

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

}

inherits(TestClassNode, TestNode);

function isClassInstance (obj) {
  return !!obj._reactInternalInstance;
}

function getDirectChildren (element) {
  var children;
  if (isClassInstance(element)) {
    children = element
      ._reactInternalInstance
      ._renderedComponent
      ._renderedChildren;
  } else {
    children = element
      ._reactInternalComponent
      ._renderedChildren;
  }

  return _.map(children, function (child) {
    return child._instance || child;
  });
}

module.exports = TestClassNode;
