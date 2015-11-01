var React = require('react');

var StatelessComponent = (props) => (
  <div testRef='foo'>
    <ul testRefCollection='bar'>
      <li />
      <li />
      <li />
    </ul>
  </div>
);

module.exports = StatelessComponent;
