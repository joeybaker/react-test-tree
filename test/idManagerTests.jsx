/* global describe, it, beforeEach, afterEach */

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai').expect;
var IDManager = require('../lib/IDManager');
var IDComponent = require('./fixtures/IDComponent.jsx');

describe('IDManager', function () {
  var idManager;
  beforeEach(function () {
    idManager = new IDManager();
  });

  describe('when generating IDs', function () {
    it('should return incremental IDs', function () {
      for (var i = 0; i++; i < 20) {
        expect(idManager.generateId()).to.equal(i);
      }
    });
  });

  describe('when mapping a tree', function () {
    beforeEach(function () {
      var renderedTree = ReactDOM.render(
        <IDComponent />,
        document.createElement('div')
      );
      idManager.setTree(renderedTree);
      idManager.mapTree();
    });

    it('should map nodes onto the tree by their id', function () {
      expect(idManager.getElementById(0).tagName).to.equal('DIV');
      expect(idManager.getElementById(1).tagName).to.equal('P');
    });

    it('should not map nodes that do not have an id', function () {
      expect(idManager.getElementById(undefined)).to.not.exist;
    });
  });

  describe('when doing a deferred map', function () {
    beforeEach(function (done) {
      var renderedTree = ReactDOM.render(
        <IDComponent />,
        document.createElement('div')
      );
      idManager.setTree(renderedTree);
      sinon.spy(idManager, 'mapTree');
      idManager.mapTreeDeferred();
      idManager.mapTreeDeferred();
      idManager.mapTreeDeferred();
      _.defer(done);
    });
    afterEach(function () {
      idManager.mapTree.restore();
    });

    it('should only map once, even when called multiple times', function () {
      expect(idManager.mapTree).to.have.been.calledOnce;
    });
  });
});
