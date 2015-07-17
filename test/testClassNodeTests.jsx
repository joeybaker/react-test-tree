/* global describe, it, before, after, beforeEach, afterEach */

var React = require('react');
var ReactDOM = require('react-dom');
var expect = require('chai').expect;
var sinon = require('sinon');
var testTree = require('../lib/testTree');
var TestNode = require('../lib/testNode');
var BasicComponent = require('./fixtures/basicComponent.jsx');
var NestedComponent = require('./fixtures/nestedComponent.jsx');
var UnmountingComponent = require('./fixtures/unmountingComponent.jsx');
var UnsafeComponent = require('./fixtures/unsafeComponent.jsx');

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
      expect(tree.foo).to.be.instanceOf(TestNode);
    });

    it('should map refCollections onto tree as arrays of TestNodes', function () {
      expect(tree.bar).to.be.an('array');
      expect(tree.bar[0]).to.be.an.instanceOf(TestNode);
      expect(tree.bar[1]).to.be.an.instanceOf(TestNode);
    });

    it('should expose state', function () {
      expect(tree.state).to.deep.equal({
        foo: 'bar'
      });
    });

  });

  describe('when unsafe ref names are supplied', function () {
    var oldWarn, warned;
    before(function () {
      oldWarn = console.warn;
      console.warn = function () {
        var msg = [].join.call(arguments, ' ');
        if (msg.indexOf('Attempted to overwrite protected TestClassNode method') > -1) {
          warned = true;
        } else {
          oldWarn.apply(console, arguments);
        }
      };
    });
    after(function () {
      console.warn = oldWarn;
    });

    it('should warn', function () {
      testTree(<UnsafeComponent />);
      expect(warned).to.be.true;
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
      expect(tree.nested.ref2).to.be.instanceOf(TestNode);
    });

    it('should recursively map refCollections', function () {
      expect(tree.nested.refCollection2).to.be.an('array');
      expect(tree.nested.refCollection2[0]).to.be.an.instanceOf(TestNode);
      expect(tree.nested.refCollection2[1]).to.be.an.instanceOf(TestNode);
    });

    it('should only map refs to direct owners', function () {
      expect(tree.ref2).to.not.exist;
      expect(tree.nested.ref1).to.not.exist;
    });

    it('should only map refCollections to direct owners', function () {
      expect(tree.refCollection2).to.not.exist;
      expect(tree.nested.refCollection1).to.not.exist;
    });
  });

  describe('when nodes update', function () {
    var tree, bazNode, barCollectionNode;
    before(function () {
      tree = testTree(<BasicComponent />);
      bazNode = tree.baz;
      barCollectionNode = tree.bar[0];
      tree.element.forceUpdate();
    });
    after(function () {
      tree.dispose();
    });

    it('should not recreate ref nodes', function () {
      expect(tree.baz).to.equal(bazNode);
    });

    it('should not recreate refCollection nodes', function () {
      expect(tree.bar[0]).to.equal(barCollectionNode);
    });
  });

  describe('when child nodes unmount', function () {
    var tree, bar;
    before(function () {
      tree = testTree(<UnmountingComponent />);
      bar = tree.bar;
      expect(tree.foo).to.have.length(2);
      expect(tree.bar).to.exist;
      expect(tree.baz).to.have.length(2);
      tree.element.setUnmounted();
    });
    after(function () {
      tree.dispose();
    });

    it('#isMounted() should return false', function () {
      expect(bar.isMounted()).to.be.false;
    });

    it('should no longer map unmounted refs onto tree', function () {
      expect(tree.bar).to.not.exist;
    });

    it('should no longer map unmounted refCollections onto tree', function () {
      expect(tree.baz).to.not.exist;
    });

    it('should no longer contain unmounted refCollection parts in array', function () {
      expect(tree.foo).to.have.length(1);
    });
  });

  describe('when node methods are called', function () {
    var tree, spy;
    beforeEach(function () {
      spy = sinon.spy();
      tree = testTree(<BasicComponent onClick={spy} />);
    });
    afterEach(function () {
      tree.dispose();
    });

    it('should return DOM node', function () {
      expect(tree.getDOMNode()).to.equal(ReactDOM.findDOMNode(tree.element));
    });

    it('should simulate click', function () {
      tree.click();
      expect(spy).to.have.been.calledOnce;
    });

    it('should return attribute', function () {
      expect(tree.getAttribute('class')).to.equal('Foo');
    });

    it('should return className', function () {
      expect(tree.getClassName()).to.equal('Foo');
    });

    it('should return prop', function () {
      expect(tree.getProp('onClick')).to.equal(spy);
    });

    it('should set value', function () {
      expect(tree.baz.value).to.equal('Baz');
      tree.baz.value = 'BazFoo';
      expect(tree.baz.value).to.equal('BazFoo');
    });

    it('should return mount state', function () {
      expect(tree.isMounted()).to.be.true;
      tree.dispose();
      expect(tree.isMounted()).to.be.false;
    });
  });

});