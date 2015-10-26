/* global describe, it */

describe('getDOMNode', function () {
  describe('when given a react-bootstrap input component', function () {
    it('should call element#getInputDOMNode');
  });

  describe('when given a regular React component', function () {
    it('should call ReactDOM#findDOMNode');
  });

  describe('when given a React element instance', function () {
    it('should search the rendered tree for elements with matching refs');
    it('should throw an error if the element doesn\'t have a ref');
  });
});
