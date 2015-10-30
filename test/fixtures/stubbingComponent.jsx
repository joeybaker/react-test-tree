var React = require('react');
var HigherOrderComponent = require('./higherOrderComponent.jsx');

var StubbingComponent2 = React.createClass({
  render: function () {
    return (
      <div testRef='fuz'>
        <button testRef='buz'>Buz</button>
      </div>
    );
  }
});

var StubbingComponent = React.createClass({
  render: function () {
    return (
      <div>
        <div testRef='nofoo' />
        <div testRef='foo' key='foo' bar='bar'>Foo</div>
        <div testRef='baz'>Baz</div>
        <StubbingComponent2 testRef='boz' />
        <HigherOrderComponent testRef='hoc' />
      </div>
    );
  }
});

module.exports = StubbingComponent;
