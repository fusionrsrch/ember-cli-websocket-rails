import Ember from 'ember';

export default Ember.Controller.extend({

    name:        'Start taking advantage of WebSockets with Ember CLI and Rails',
    isCompleted: false,
    username: 'special_user',

    actions: {

        buttonClicked: function() {
            console.log('send');

            var success = function(response) {
                console.log("request success: "+JSON.stringify(response));
            };

            var failure = function(response) {
                console.log("request failed: "+response.message);
            };

            var task = {
                name:      this.get('name'),
                completed: this.get('isCompleted'), 
            };

            this.send('trigger', 'tasks.create', task, success, failure );
        },

        subscribeButton: function() {
            console.log('subscribe to public_channel');

            this.send('subscribe', 'public_channel' );

            var channel_event = function(data) {
                alert("public channel event received: "+JSON.stringify(data));
            };

            this.send('bind_channel_event', 'public_channel', 'test_event', channel_event );
        },

        unsubscribeButton: function() {
            console.log('unsubscribe from public_channel');
            this.send('unsubscribe', 'public_channel' );
        },

        privateSubscribeButton: function() {
            console.log('subscribe to private channel');

            this.send('subscribe_private', 'private_channel', function() {
                // success callback
                console.log( "Has joined the channel" );
            },  function(reason) {
                // failure callback
                console.log( "Authorization failed because: "+JSON.stringify(reason) );
            });
        },

        privateUnsubscribeButton: function() {
            console.log('unsubscribe from private channel');
            this.send('unsubscribe', 'private_channel' );
        }
    }
});
