var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');
var utils = require('react/lib/ReactTestUtils');
var TestClassNode = require('./testClassNode');
var UpdateManager = require('./updateManager');

var ID_KEY = '__rttId';
var CHILD_IDS_KEY = '__rttChildIds';

function testTree (element, options) {
  options = options || {};

  wrapRender(element, options.stub, [0]);

  var container = document.createElement('div');
  if (options.mount) {
    document.body.appendChild(container);
  }
  var contextWrapper = ReactDOM.render(makeContextWrapper(element, options.context), container);

  var rootNode;
  var wrappedElement = contextWrapper.refs.element;
  if (typeof element.type === 'string') {
    wrappedElement = makeClassWrapper(wrappedElement);
  }
  rootNode = new TestClassNode(wrappedElement, new UpdateManager(wrappedElement));
  rootNode.dispose = dispose.bind(rootNode, container);

  return rootNode;
}

function makeContextWrapper (element, context) {
  var ContextWrapper = React.createClass({
    childContextTypes: _.mapValues(context, function () {
      return React.PropTypes.any;
    }),

    getChildContext: function () {
      return context;
    },

    render: function () {
      return React.createElement(element.type, _.defaults({ ref: 'element' }, element.props));
    }
  });

  return React.createElement(ContextWrapper);
}

function makeClassWrapper (element) {
  var ClassWrapper = React.createClass({
    render: function () {
      return element;
    }
  });
  return React.createElement(ClassWrapper);
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
  element.type.prototype.__invokeRefCollector = function (collectionName, node) {
    this.__refCollector(collectionName, node);
  };
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
    if (!newProps[ID_KEY]) {
      newProps[ID_KEY] = elementId[0];
      elementId[0]++;
    }

    // Process children
    newProps[CHILD_IDS_KEY] = [];
    var mapChild = function (child) {
      var newChild = processNode(child);
      if (newChild && newChild.props) {
        newProps[CHILD_IDS_KEY].push(newChild.props[ID_KEY]);
      }
      return newChild;
    };
    var children = newProps.children;
    if (children instanceof Array) {
      newProps.children = _.map(children, mapChild);
    } else if (typeof children === "object") {
      newProps.children = React.Children.map(children, mapChild);
    } else {
      newProps.children = mapChild(children);
    }

    // Wrap render method of node if it's a composite
    if (typeof toClone.type === 'function') {
      wrapRender(toClone, stub, elementId);
    }

    return React.cloneElement(toClone, newProps);
  }
}

module.exports = testTree;
