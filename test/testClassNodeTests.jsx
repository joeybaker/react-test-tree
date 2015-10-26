/* global describe, it, before, after, beforeEach, afterEach */

var React = require('react');
var expect = require('chai').expect;
var testTree = require('../lib/testTree');
var TestNode = require('../lib/testNode');
var BasicComponent = require('./fixtures/basicComponent.jsx');
var NestedComponent = require('./fixtures/nestedComponent.jsx');
var UnmountingComponent = require('./fixtures/unmountingComponent.jsx');
var HigherOrderComponent = require('./fixtures/higherOrderComponent.jsx');

describe('TestClassNode', function () {
  describe('by default', function () {
    var tree;
    before(function () {
      tree = testTree(<BasicComponent />);
    });
    after(function () {
      tree.dispose();
    });

    it('should map refs onto tree as TestNodes', function () {
      expect(tree.get('foo')).to.be.instanceOf(TestNode);
    });

    it('should map refCollections onto tree as arrays of TestNodes', function () {
      expect(tree.get('bar')).to.be.an('array');
      expect(tree.get('bar')[0]).to.be.an.instanceOf(TestNode);
      expect(tree.get('bar')[1]).to.be.an.instanceOf(TestNode);
    });

    it('should expose state', function () {
      expect(tree.state).to.deep.equal({
        foo: 'bar'
      });
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

    it('should recursively map refs', function () {
      expect(tree.getIn(['nested', 'ref2'])).to.be.instanceOf(TestNode);
    });

    it('should recursively map refCollections', function () {
      expect(tree.getIn(['nested', 'refCollection2'])).to.be.an('array');
      expect(tree.getIn(['nested', 'refCollection2'])[0]).to.be.an.instanceOf(TestNode);
      expect(tree.getIn(['nested', 'refCollection2'])[1]).to.be.an.instanceOf(TestNode);
    });

    it('should only map refs to direct owners', function () {
      expect(tree.get('ref2')).to.not.exist;
      expect(tree.getIn(['nested', 'ref1'])).to.not.exist;
    });

    it('should only map refCollections to direct owners', function () {
      expect(tree.get('refCollection2')).to.not.exist;
      expect(tree.getIn(['nested', 'refCollection1'])).to.not.exist;
    });
  });

  describe('when nodes update', function () {
    var tree, bazNode, barCollectionNode;
    before(function () {
      tree = testTree(<BasicComponent />);
      bazNode = tree.get('baz');
      barCollectionNode = tree.get('bar')[0];
      tree.element.forceUpdate();
    });
    after(function () {
      tree.dispose();
    });

    it('should not recreate ref nodes', function () {
      expect(tree.get('baz')).to.equal(bazNode);
    });

    it('should not recreate refCollection nodes', function () {
      expect(tree.get('bar')[0]).to.equal(barCollectionNode);
    });

    describe('when child components update', function () {
      before(function () {

      });

      it('should force full update on root node');

      it('should not perform second update on source node');

      it('should still obey original shouldComponentUpdate');
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
