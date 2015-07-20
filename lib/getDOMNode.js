var ReactDOM = require('react-dom');
var utils = require('react/lib/ReactTestUtils');

module.exports = function getDOMNode (element) {
  if (element.getInputDOMNode) {
    return element.getInputDOMNode();
  } else if (element._reactInternalInstance) {
    return ReactDOM.findDOMNode(element);
  } else if (element.ref) {
    return utils.findAllInRenderedTree(element._owner._instance, function (node) {
      var component = node._reactInternalComponent;
      if (component && component._currentElement.ref === element.ref) {
        return true;
      }
    })[0];
  } else {
    throw new Error('Cannot get DOM node, object is neither a component, react-bootstrap component or element with ref');
  }
};
