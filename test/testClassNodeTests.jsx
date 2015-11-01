/* global describe, it, before, after, beforeEach, afterEach */

var React = require('react');
var expect = require('chai').expect;
var testTree = require('../lib/testTree');
var TestNode = require('../lib/testNode');
var TestClassNode = require('../lib/testClassNode');
var BasicComponent = require('./fixtures/basicComponent.jsx');
var NestedComponent = require('./fixtures/nestedComponent.jsx');
var UnmountingComponent = require('./fixtures/unmountingComponent.jsx');
var HigherOrderComponent = require('./fixtures/higherOrderComponent.jsx');
var StatelessComponent = require('./fixtures/statelessComponent.jsx');

describe('TestClassNode', function () {
  describe('by default', function () {
    var tree;
    before(function () {
      tree = testTree(<BasicComponent />);
    });
    after(function () {
      tree.dispose();
    });

    it('should map testRefs onto tree as TestNodes', function () {
      expect(tree.get('foo')).to.be.instanceOf(TestNode);
    });

    it('should map testRefCollections onto tree as arrays of TestNodes', function () {
      expect(tree.get('bar')).to.be.an('array');
      expect(tree.get('bar')[0]).to.be.an.instanceOf(TestNode);
      expect(tree.get('bar')[1]).to.be.an.instanceOf(TestNode);
    });

    it('should expose state', function () {
      expect(tree.state).to.deep.equal({
        foo: 'bar'
      });
    });

    it('should re-use existing TestNode instances', function () {
      expect(tree.get('foo')).to.equal(tree.get('foo'));
    });
  });

  describe('when element is a stateless component', function () {
    var tree;
    before(function () {
      tree = testTree(<StatelessComponent />);
    });
    after(function () {
      tree.dispose();
    });

    it('should still map testRefs onto tree as TestNodes', function () {
      expect(tree.get('foo')).to.be.instanceOf(TestNode);
    });

    it('should still map testRefCollections onto tree as arrays of TestNodes', function () {
      expect(tree.get('bar')).to.be.an('array');
      expect(tree.get('bar')[0]).to.be.an.instanceOf(TestNode);
      expect(tree.get('bar')[1]).to.be.an.instanceOf(TestNode);
    });
  });

  describe('when child is a stateless component', function () {
    var tree;
    before(function () {
      tree = testTree(<div><StatelessComponent testRef='foo' /></div>, { wrap: true });
    });
    after(function () {
      tree.dispose();
    });

    it('should be accessible from the parent', function () {
      expect(tree.get('foo')).to.exist;
    });

    it('should be a TestClassNode', function () {
      expect(tree.get('foo')).to.be.an.instanceOf(TestClassNode);
    });
  });

  describe('when nested components are supplied', function () {
    var tree;
    before(function () {
      tree = testTree(<NestedComponent />);
    });
    after(function () {
      tree.dispose();
    });

    it('should recursively map testRefs', function () {
      expect(tree.getIn(['nested', 'ref2'])).to.be.instanceOf(TestNode);
    });

    it('should recursively map testRefCollections', function () {
      expect(tree.getIn(['nested', 'refCollection2'])).to.be.an('array');
      expect(tree.getIn(['nested', 'refCollection2'])[0]).to.be.an.instanceOf(TestNode);
      expect(tree.getIn(['nested', 'refCollection2'])[1]).to.be.an.instanceOf(TestNode);
    });

    it('should only map testRefs to direct owners', function () {
      expect(tree.get('ref2')).to.not.exist;
      expect(tree.getIn(['nested', 'ref1'])).to.not.exist;
    });

    it('should only map testRefCollections to direct owners', function () {
      expect(tree.get('refCollection2')).to.not.exist;
      expect(tree.getIn(['nested', 'refCollection1'])).to.not.exist;
    });
  });

  describe('when child nodes unmount', function () {
    var tree, bar;
    before(function () {
      tree = testTree(<UnmountingComponent />);
      bar = tree.get('bar');
      expect(tree.get('foo')).to.have.length(2);
      expect(tree.get('bar')).to.exist;
      expect(tree.get('baz')).to.have.length(2);
      tree.element.setUnmounted();
    });
    after(function () {
      tree.dispose();
    });

    it('#isMounted() should return false', function () {
      expect(bar.isMounted()).to.be.false;
    });

    it('should no longer map unmounted refs onto tree', function () {
      expect(tree.get('bar')).to.not.exist;
    });

    it('should no longer map unmounted refCollections onto tree', function () {
      expect(tree.get('baz')).to.not.exist;
    });

    it('should no longer contain unmounted refCollection parts in array', function () {
      expect(tree.get('foo')).to.have.length(1);
    });
  });

  describe('when a higher order component is found', function () {
    var tree;
    beforeEach(function () {
      tree = testTree(<HigherOrderComponent />);
    });
    afterEach(function () {
      tree.dispose();
    });

    it('should skip the HOC and go direct to the inner component', function () {
      expect(tree.get('innerComponent')).to.not.exist;
      expect(tree.get('innerSpan')).to.exist;
    });
  });
});
