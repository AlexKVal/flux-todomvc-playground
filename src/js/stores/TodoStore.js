var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter  = require('events').EventEmitter;
var TodoConstants = require('../constants/TodoConstants');
var assign = require('react/lib/Object.assign');

var CHANGE_EVENT = 'change';

var _todos = {};

function create(text) {
  var id = Date.now();
  _todos[id] = {
    id: id,
    complete: false,
    text: text
  };
}

function destroy(id) {
  delete _todos[id];
}

var TodoStore = assign({}, EventEmitter.prototype, {
  getAll: function () {
    return _todos;
  },
  emitChange: function () {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function (callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function (callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  dispatcherToken: AppDispatcher.register(function(action) {
    var text;

    switch (action.actionType) {
      case TodoConstants.TODO_CREATE:
        text = action.text.trim();
        if (text !== '') {
          create(text);
          TodoStore.emitChange();
        }
        break;
      case TodoConstants.TODO_DESTROY:
        destroy(action.id);
        TodoStore.emitChange();
        break;
    }

    return true; // No errors. Needed by promise in Dispatcher.
  }),
});

module.exports = TodoStore;
