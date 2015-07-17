var ReactDOM = require('react-dom');
var utils = require('react/lib/ReactTestUtils');

module.exports = function getDOMNode (element) {
  if (element.getInputDOMNode) {
    return element.getInputDOMNode();
  } else if (element._reactInternalInstance) {
    return ReactDOM.findDOMNode(element);
  } else {
    return utils.findAllInRenderedTree(element._owner._instance, function (node) {
      var component = node._reactInternalComponent;
      if (component && component._currentElement.ref === element.ref) {
        return true;
      }
    })[0];
  }
};
