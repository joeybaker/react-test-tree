var _ = require('lodash');
var ReactDOM = require('react-dom');
var utils = require('react/lib/ReactTestUtils');
var getDOMNode = require('./getDOMNode');

function TestNode (element) {

  this.element = element;

  this.simulate = _.mapValues(utils.Simulate, function (fn) {
    return _.bind(function (eventData) {
      fn(this.getDOMNode(), eventData);
    }, this);
  }, this);

  Object.defineProperty(this, 'innerText', {
    get: function () {
      var node = this.getDOMNode();
      return node.innerText || node.textContent;
    }
  });

  Object.defineProperty(this, 'value', {
    get: function () {
      return this.getDOMNode().value;
    },
    set: function (value) {
      this.getDOMNode().value = value;
      this.simulate.change({
        target: {
          value: value
        }
      });
    }
  });

  Object.defineProperty(this, 'ref', {
    get: function () {
      return this.element.ref;
    },
    configurable: true
  });

  Object.defineProperty(this, 'key', {
    get: function () {
      return this.element.key;
    },
    configurable: true
  });

}

TestNode.prototype = {

  getDOMNode: function () {
    return getDOMNode(this.element);
  },

  click: function () {
    return this.simulate.click();
  },

  getAttribute: function (attributeName) {
    return this.getDOMNode().getAttribute(attributeName);
  },

  getClassName: function () {
    return this.getAttribute('class');
  },

  getProp: function (propName) {
    return this.element.props[propName];
  },

  isMounted: function () {
    try {
      ReactDOM.findDOMNode(this.element);
      return true;
    } catch (e) {
      return false;
    }
  }

};

module.exports = TestNode;
