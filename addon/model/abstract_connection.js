import Ember from 'ember';
import WebsocketRailsEvent from '../model/event';

export default Ember.Object.extend({

    init: function() {
        this.set('message_queue', []);
//        console.log( 'abstract_connection: init()' );
    },

    close: function() {
    },

    trigger: function(event) {
        //console.log( 'abstract_connection: trigger()' );
        var dispatcher = this.get('dispatcher');
        if (dispatcher.state !== 'connected') {
            return this.get('message_queue').push(event);
        } 
        else {
            return this.send_event(event);
        }
    },

    send_event: function(event) {
        //console.log( 'abstract_connection: send_event()' );
        var connection_id = this.get('connection_id');
        if (connection_id != null) {
            return event.connection_id = connection_id;
        }
    },

    on_close: function(event) {
        //console.log( 'abstract_connection: on_close()' );
        var dispatcher = this.get('dispatcher');
        if (dispatcher && dispatcher.conn === this) {
            dispatcher.state = 'disconnected';

            var close_event = WebsocketRailsEvent.create({ message: [ 'connection_closed', event ] });
            return dispatcher.dispatch(close_event);
        }
    }, 

    on_error: function(event) {
        //console.log( 'abstract_connection: on_error()' );
        var dispatcher = this.get('dispatcher');
        if (dispatcher && dispatcher.conn === this) {
            dispatcher.state = 'disconnected';
            var error_event = WebsocketRailsEvent.create({ message: [ 'connection_errord', event ] });
            return dispatcher.dispatch(error_event);
        }
    },

    on_message: function(event_data) {
        //console.log( 'abstract_connection: on_message()' );
        var dispatcher = this.get('dispatcher');
        if (dispatcher && dispatcher.conn === this) {
            return dispatcher.new_message(event_data);
        }
    },
  
    setConnectionId: function(connection_id) {
        //console.log( 'abstract_connection: setConnectionId()' );
        this.set('connection_id', connection_id );
    },

    flush_queue: function() {
        //console.log( 'abstract_connection: flush_queue()' );

        var message_queue = this.get('message_queue');

        for ( var i = 0; i < message_queue.length; i++ ) {
            this.trigger( message_queue.length[i] );
        }

        this.set('message_queue', []);
    } 

});
