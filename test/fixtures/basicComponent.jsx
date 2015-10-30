var React = require('react');

var BasicComponent = React.createClass({
  getInitialState: function () {
    return {
      foo: 'bar'
    };
  },
  render: function () {
    return (
      <div {...this.props} testRef='foo' className='Foo'>
        <ul testRefCollection='bar'>
          <li testRef='bar1' key='bar1key'>1</li>
          <li>2</li>
        </ul>
        <input testRef='baz' defaultValue='Baz' />
        <div ref='bam'>
          Bam
        </div>
      </div>
    );
  }
});

module.exports = BasicComponent;
