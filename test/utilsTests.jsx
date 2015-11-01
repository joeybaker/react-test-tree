/* global describe, it, before */

var React = require('react');
var ReactDOM = require('react-dom');
var expect = require('chai').expect;
var utils = require('../lib/utils');
var NullComponent = require('./fixtures/NullComponent.jsx');
var StatelessComponent = require('./fixtures/StatelessComponent.jsx');
var BasicComponent = require('./fixtures/BasicComponent.jsx');
var IDComponent = require('./fixtures/IDComponent.jsx');

describe('utils', function () {
  describe('#getInstanceProperty()', function () {
    var tree, renderedTree;
    before(function () {
      tree = (
        <div foo='bar'>
          <NullComponent baz='boz' />
        </div>
      );
      renderedTree = ReactDOM.render(tree, document.createElement('div'));
    });

    it('should work for instances', function () {
      expect(utils.getInstanceProperty(tree, 'props').foo).to.equal('bar');
    });

    it('should work for components', function () {
      expect(utils.getInstanceProperty(renderedTree.props.children, 'props').baz).to.equal('boz');
    });

    it('should work for elements', function () {
      expect(utils.getInstanceProperty(renderedTree, 'props').foo).to.equal('bar');
    });
  });

  describe('#getTestStore()', function () {
    it('should return the test store', function () {
      var tree = <div />;
      tree._store._rtt = { foo: 'bar' };
      expect(utils.getTestStore(tree).foo).to.equal('bar');
    });

    it('should create the test store if it does not exist', function () {
      var tree = <div />;
      utils.getTestStore(tree);
      expect(tree._store._rtt).to.exist;
    });
  });

  describe('#isClassInstance()', function () {
    it('should return true if element is a class instance', function () {
      var tree = ReactDOM.render(<NullComponent />, document.createElement('div'));
      expect(utils.isClassInstance(tree)).to.be.true;
    });

    it('should return false if element is not a class instance', function () {
      var tree = ReactDOM.render(<div />, document.createElement('div'));
      expect(utils.isClassInstance(tree)).to.be.false;
    });
  });

  describe('#isClassComponent()', function () {
    it('should return true if element is instance of a class', function () {
      expect(utils.isClassComponent(<NullComponent />)).to.be.true;
    });

    it('should return false if element is not instance of a class', function () {
      expect(utils.isClassComponent(<StatelessComponent />)).to.be.false;
    });
  });

  describe('#isStatelessComponent()', function () {
    it('should return true if element type is a function with no render method', function () {
      expect(utils.isStatelessComponent(<StatelessComponent />)).to.be.true;
    });

    it('should return false if element type is not a function', function () {
      expect(utils.isStatelessComponent(<NullComponent />)).to.be.false;
    });

    it('should return false if element type has no render method', function () {
      expect(utils.isStatelessComponent(<div />)).to.be.false;
    });
  });

  describe('#getDOMNode()', function () {
    it('should work for class instances', function () {
      var tree = ReactDOM.render(<BasicComponent />, document.createElement('div'));
      expect(utils.getDOMNode(tree)).to.exist;
    });

    it('should work for non-class instances', function () {
      var tree = ReactDOM.render(<IDComponent />, document.createElement('div'));
      expect(utils.getDOMNode(tree.refs.div)).to.exist;
    });
  });
});
