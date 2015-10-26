/* global describe, it, before, after, beforeEach, afterEach, HTMLInputElement */

var React = require('react');
var expect = require('chai').expect;
var sinon = require('sinon');
var testTree = require('../lib/testTree');
var BasicComponent = require('./fixtures/basicComponent.jsx');
var utils = require('react/lib/ReactTestUtils');

describe('TestNode', function () {
  describe('by default', function () {
    var tree;
    before(function () {
      tree = testTree(<BasicComponent />);
    });
    after(function () {
      tree.dispose();
    });

    it('should expose simulate library', function () {
      expect(tree.simulate.click).to.exist;
    });

    it('should expose element', function () {
      expect(utils.isCompositeComponent(tree.element)).to.be.true;
    });

    it('should expose element value', function () {
      expect(tree.baz.value).to.equal('Baz');
    });

    it('should expose element inner text', function () {
      expect(tree.bam.innerText).to.equal('Bam');
    });

    it('should expose ref', function () {
      expect(tree.baz.ref).to.equal('baz');
    });

    it('should expose key', function () {
      expect(tree.bar1.key).to.equal('bar1key');
    });

    it('#isMounted() should return true', function () {
      expect(tree.isMounted()).to.be.true;
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
      expect(tree.baz.getDOMNode()).to.be.an.instanceOf(HTMLInputElement);
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
