var React = require('react');
var Footer = require('./Footer');
var Header = require('./Header');
var MainSection = require('./MainSection');
var TodoStore = require('../stores/TodoStore');

function getTodoState() {
  return {
    allTodos: TodoStore.getAll();
  };
}

var TodoApp = React.createClass({
  getInitialState: function() {
    return getTodoState();
  },
  componentDidMount: function() {
    TodoStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    TodoStore.removeChangeListener(this._onChange);
  },
  _onChange: function () {
    this.setState(getTodoState());
  },
  render: function() {
    return (
      <div>
        <MainSection allTodos={this.state.allTodos} />
        <Footer allTodos={this.state.allTodos} />
      </div>
    );
  }
});

module.exports = TodoApp;
