var React = require('react');

var MountingComponent = React.createClass({

  getInitialState: function () {
    return {
      mounted: false
    };
  },

  setMounted: function () {
    this.setState({
      mounted: true
    });
  },

  render: function () {
    return (
      <div testRef='foo'>
        {this.renderIfMounted(<div testRef='bar'>baz</div>)}
      </div>
    );
  },

  renderIfMounted: function (children) {
    if (this.state.mounted) {
      return children;
    }
  }

});

module.exports = MountingComponent;
