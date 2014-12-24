import Ember from 'ember';

export default Ember.Controller.extend({

  chatRoomInputText: null,
  chatRoomUserName: 'Testing',

  actions: {

    onopen: function(socketEvent) {
      console.log('On open has been called!');
      console.log(socketEvent);
    },

    onmessage: function(socketEvent) {
      console.log('On message has been called!');
//      console.log(socketEvent);
    },

    onclose: function(socketEvent) {
      console.log('On close has been called!');
    },

    onerror: function(socketEvent) {
      console.log('On error has been called! :-(');
    },

    buttonClicked: function() {
      console.log('emit');

        this.send('trigger', 'tasks.create', {name: 'Start taking advantage of WebSockets', completed: false} );

    }

  }
});
