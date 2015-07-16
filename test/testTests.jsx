/* global describe */
var testTree = require('../lib/testTree');
var React = require('react');

describe('blah', function () {

  var NestedComponent2 = React.createClass({
    render: function () {
      return (
        <div ref='ref2'>
        </div>
      );
    }
  });

  var NestedComponent = React.createClass({
    render: function () {
      return (
        <div ref='ref1'>
          <NestedComponent2 ref='nested' />
          <div refCollection="blah">
            <span />
            <p />
            <NestedComponent2 />
          </div>
        </div>
      );
    }
  });

  var tree = testTree(<NestedComponent />);

});
