var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');
var utils = require('react/lib/ReactTestUtils');
var TestClassNode = require('./testClassNode');
var UpdateManager = require('./updateManager');
var constants = require('./constants');

function testTree (element, options) {
  options = options || {};

  var elementRef = element.ref || constants.ROOT_REF;

  var Wrapper = React.createClass({
    childContextTypes: _.mapValues(options.context, function () {
      return React.PropTypes.any;
    }),

    getChildContext: function () {
      return options.context;
    },

    render: function () {
      return React.cloneElement(element, { ref: elementRef });
    }
  });

  // If wrap option isn't specified, stub should start at the actual
  // provided element, not our wrapped version.
  var stub = options.stub;
  if (!options.wrap) {
    stub = {};
    stub[elementRef] = options.stub;
  }

  // Always wrap the element in our own component to 'normalise' it.
  // Also allows for injection of context
  var wrappedElement = React.createElement(Wrapper);
  wrapRender(wrappedElement, stub, [0]);

  // Render
  var container = document.createElement('div');
  if (options.mount) {
    document.body.appendChild(container);
  }
  var renderedElement = ReactDOM.render(wrappedElement, container);

  // Set up test tree and add dispose method to root node
  var rootNode = new TestClassNode(renderedElement, new UpdateManager(renderedElement));
  if (!options.wrap) {
    rootNode = rootNode.get(elementRef);
  }
  rootNode.dispose = dispose.bind(rootNode, container);

  return rootNode;
}

function dispose (container) {
  if (this.isMounted()) {
    ReactDOM.unmountComponentAtNode(container);
  }
  if (container.parentElement) {
    container.parentElement.removeChild(container);
  }
}

function wrapRender (element, stubTree, elementId) {
  stubTree = stubTree || {};

  var innerComponentRef = _.get(element, 'type.innerComponentRef');
  if (innerComponentRef) {
    var hocStubTree = {};
    hocStubTree[innerComponentRef] = stubTree;
    stubTree = hocStubTree;
  }

  var oldRenderFn = element.type.prototype.render;
  element.type.prototype.render = function () {
    var renderTree = oldRenderFn.apply(this, arguments);
    return mapRenderTree(renderTree, stubTree, this.__invokeRefCollector, elementId);
  };
}

function mapRenderTree (renderTree, stubTree, refCollector, elementId) {
  return processNode(renderTree);

  function processNode (node, index) {
    if (!utils.isElement(node)) {
      return node;
    }

    var stub = stubTree[node.ref];
    // Replace element with null if stub is defined and falsy
    if (!stub && stub !== undefined) {
      return null;
    }

    // Allow elements to be stubbed out with strings
    if (typeof stub === 'string') {
      return stub;
    }

    var toClone = node;
    var newProps = _.extend({}, node.props);
    var children = node.props.children;

    // If stub is a replacement element, merge it's props
    if (utils.isElement(stub)) {
      toClone = stub;
      newProps = _.extend(newProps, stub.props);
      if (React.Children.count(stub.props.children) > 0) {
        children = stub.props.children;
      }
    }

    newProps.ref = node.ref;
    if (node.key) {
      newProps.key = node.key;
    } else if (index !== undefined) {
      newProps.key = constants.KEY_PREFIX + index;
    }

    // Process children
    var childIds = [];
    var newChildren = [];
    React.Children.forEach(children, function (child, index) {
      var newChild = processNode(child, index);
      if (newChild && newChild.props) {
        childIds.push(newChild._store[constants.ID_KEY]);
      }
      newChildren.push(newChild);
    });
    if (newChildren.length === 0) {
      newChildren = null;
    }

    // Wrap render method of node if it's a composite
    if (typeof toClone.type === 'function') {
      wrapRender(toClone, stub, elementId);
    }

    var newNode = React.cloneElement(toClone, newProps, newChildren);

    // Set node ID
    var nodeId = node._store[constants.ID_KEY];
    if (!nodeId) {
      nodeId = elementId[0];
      elementId[0]++;
    }
    newNode._store[constants.ID_KEY] = nodeId;

    // Set child IDs
    newNode._store[constants.CHILD_IDS_KEY] = childIds;

    return newNode;
  }
}

module.exports = testTree;
