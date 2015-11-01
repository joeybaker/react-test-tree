var React = require('react');

var IDComponent = React.createClass({
  render: function () {
    var tree = (
      <div ref='div'>
        <p />
        <span />
      </div>
    );
    tree._store._rtt = { id: 0 };
    tree.props.children[0]._store._rtt = { id: 1 };
    return tree;
  }
});

module.exports = IDComponent;
