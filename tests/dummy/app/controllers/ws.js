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
            //console.log("channel event received");
            //console.log(data);
            alert("channel event received"+data);
        };

        this.send('bind_channel_event', 'test_channel', 'heartbeat', channel_event );
        
    },

    unsubscribeButton: function() {
        console.log('unsubscribe');
        this.send('unsubscribe', 'test_channel' );
    },
//
//var private_channel = dispatcher.subscribe_private('channel_name', function() {
//  // success callback
//  console.log( current_user.name + "Has joined the channel" );
//}, function(reason) {
//  // failure callback
//  console.log( "Authorization failed because " + reason.message );
//});
//
    privateSubscribeButton: function() {
        console.log('private subscribe');

        this.send('subscribe_private', 'private_channel', function() {
            // success callback
            console.log( "Has joined the channel" );
        },  function(reason) {
            // failure callback
            console.log( "Authorization failed because" );
        });
    },

    privateUnsubscribeButton: function() {
        console.log('private unsubscribe');
        this.send('unsubscribe', 'private_channel' );
    }
    
  }
});
