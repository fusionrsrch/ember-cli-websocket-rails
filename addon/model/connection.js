import Ember from 'ember';
import WebsocketRailsEvent from '../model/event';

export default Ember.Object.extend({

    init: function() {
        this.set('message_queue', []);

    },

    on_message: function(event) {
        return this.get('dispatcher').new_message(event);
    },

    on_close: function(event) {
        var dispatcher = this.get('dispatcher');
        dispatcher.state = 'disconnected';
        var data = (event != null ? event.data : void 0) ? event.data : event;
        var _event = WebsocketRailsEvent.create({ message: [ 'connection_closed', data ] });
        return dispatcher.dispatch(_event);
    },

    on_error: function(event) {
        var dispatcher = this.get('dispatcher');
        dispatcher.state = 'disconnected';
        var _event = WebsocketRailsEvent.create({ message: [ 'connection_error', event.data ] });
        return dispatcher.dispatch(_event); 
    },

    trigger: function(event) {
        var dispatcher = this.get('dispatcher');
        if (dispatcher.state !== 'connected') {
            return this.get('message_queue').push(event);
        } 
        else {
            return this.send_event(event);
        }
    },

    close: function() {
        return this.get('conn').close();
    },

    setConnectionId: function(connection_id) {
        return this.set('connection_id', connection_id );
    },

    send_event: function(event) {
        return this.get('conn').send(event.serialize());
    },

    flush_queue: function() {

        var message_queue = this.get('message_queue');

        for ( var i = 0; i < message_queue.length; i++ ) {
            this.trigger( message_queue.length[i] );
        }

        this.set('message_queue', []);
    } 


});
