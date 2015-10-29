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

  function processNode (node) {
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

    // If stub is a replacement element, merge it's props
    if (utils.isElement(stub)) {
      toClone = stub;
      newProps = _.extend(newProps, stub.props);
      if (_.keys(stub.props.children).length === 0) {
        newProps.children = node.props.children;
      }
    }

    newProps.ref = node.ref;
    if (node.key) {
      newProps.key = node.key;
    }

    // Process children
    var childIds = [];
    var mapChild = function (child) {
      var newChild = processNode(child);
      if (newChild && newChild.props) {
        childIds.push(newChild._store[constants.ID_KEY]);
      }
      return newChild;
    };
    var children = newProps.children;
    if (children instanceof Array) {
      newProps.children = _.map(children, mapChild);
    } else if (typeof children === 'object') {
      newProps.children = React.Children.map(children, mapChild);
    } else {
      newProps.children = mapChild(children);
    }

    // Wrap render method of node if it's a composite
    if (typeof toClone.type === 'function') {
      wrapRender(toClone, stub, elementId);
    }

    var newNode = React.cloneElement(toClone, newProps);

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
