var React = require('react');

var InnerComponent = React.createClass({
  render: function () {
    return (
      <div>
        <span testRef='innerSpan' />
      </div>
    );
  }
});

var HigherOrderComponent = React.createClass({
  render: function () {
    return (
      <InnerComponent testRef='innerComponent' />
    );
  }
});

HigherOrderComponent.innerTestRef = 'innerComponent';

module.exports = HigherOrderComponent;
