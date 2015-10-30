var testUtils = require('react/lib/ReactTestUtils');
var utils = require('./utils');

function IDManager () {
  this._idCounter = 0;
  this._map = {};
}

IDManager.prototype.mapTree = function (tree) {
  var map = {};
  testUtils.findAllInRenderedTree(tree, function (node) {
    var store = utils.getTestStore(node);
    if (store.id !== undefined) {
      map[store.id] = node;
    }
  });
  this._map = map;
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
