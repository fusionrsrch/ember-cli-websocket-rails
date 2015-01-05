import Ember from 'ember';

export default Ember.Controller.extend({

  chatRoomInputText: null,
  chatRoomUserName: 'Testing',

  actions: {

    buttonClicked: function() {
      console.log('emit');

        var success = function(response) {
            console.log(response);
            console.log("Wow it worked: "+response.message);
        };

        var failure = function(response) {
            console.log("That just totally failed: "+response.message);
        };

        var task = {
            name: 'Start taking advantage of WebSockets with Ember',
            completed: false
        };

        //this.send('trigger', 'tasks.create', {name: 'Start taking advantage of WebSockets', completed: false} );
        this.send('trigger', 'tasks.create', task, success, failure );

        //this.send('subscribe', 'channel_name' );

    },

    subscribeButton: function() {
        console.log('subscribe');
        this.send('subscribe', 'test_channel' );

        var channel_event = function(data) {
            //var data = data.data;
            console.log("channel event received");
            console.log(data);
        };

        this.send('bind_channel_event', 'test_channel', 'heartbeat', channel_event );
        
    },

    unsubscribeButton: function() {
        console.log('unsubscribe');
        this.send('unsubscribe', 'test_channel' );
    }

  }
});
