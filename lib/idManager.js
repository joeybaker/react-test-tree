var _ = require('lodash');
var testUtils = require('react/lib/ReactTestUtils');
var utils = require('./utils');

function IDManager () {
  this._idCounter = 0;
  this._tree = null;
  this._map = {};
}

IDManager.prototype.setTree = function (tree) {
  this._tree = tree;
};

IDManager.prototype.mapTree = function () {
  var map = {};
  testUtils.findAllInRenderedTree(this._tree, function (node) {
    var store = utils.getTestStore(node);
    if (store.id !== undefined) {
      map[store.id] = node;
    }
  });
  this._map = map;
  this._deferring = false;
};

IDManager.prototype.mapTreeDeferred = function () {
  if (!this._deferring) {
    this._deferring = true;
    _.defer(this.mapTree.bind(this));
  }
};

IDManager.prototype.getElementById = function (id) {
  return this._map[id];
};

IDManager.prototype.generateId = function () {
  var id = this._idCounter;
  this._idCounter++;
  return id;
};

module.exports = IDManager;
