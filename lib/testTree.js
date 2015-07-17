var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');
var utils = require('react/lib/ReactTestUtils');
var TestClassNode = require('./testClassNode');
var UpdateManager = require('./updateManager');

function testTree (element, options) {
  options = options || {};

  if (options.stub) {
    wrapRender(element, options.stub);
  }

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

function wrapRender (element, stubTree) {
  var oldRenderFn = element.type.prototype.render;
  element.type.prototype.render = function () {
    var renderTree = oldRenderFn.apply(this, arguments);
    return stubRenderTree(renderTree, stubTree);
  };
}

function stubRenderTree (renderTree, stubTree) {

  return processNode(renderTree);

  function stubChildren (node) {
    var children = node.props.children;

    var newChildren;
    if (children instanceof Array) {
      newChildren = _.map(children, processNode);
    } else {
      newChildren = processNode(children);
    }

    return React.cloneElement(node, { children: newChildren });
  }

  function processNode (node) {
    if (!utils.isElement(node)) {
      return node;
    }

    var stub = stubTree[node.ref];
    if (!stub && stub !== undefined) {
      return null;
    }

    if (utils.isElement(stub)) {
      // Merge all props onto stub
      var newProps = _.extend({}, node.props, stub.props, {
        ref: node.ref,
        key: node.key
      });
      return React.cloneElement(stub, newProps);
    }

    // If composite component, wrap it's render method too
    if (typeof stub === 'object' &&
      typeof node.type.prototype.render === 'function' &&
      typeof node.type.prototype.setState === 'function') {
      wrapRender(node, stub);
    }

    return stubChildren(node);
  }
}

module.exports = testTree;
