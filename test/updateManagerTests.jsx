/* global describe, it */

describe('UpdateManager', function () {
  describe('when a node updates', function () {
    it('should force an update on the root element');

    it('should not update if there is already an internal update occuring');
  });

  describe('when checking if a node should update', function () {
    it('should return null if internal update is not happening');

    it('should return false if the node is the source node');

    it('should return true if the node is not the source node');
  });
});
