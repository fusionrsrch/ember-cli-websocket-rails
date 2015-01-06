import Ember from 'ember';
import WebsocketRailsEvent from '../model/event';

export default Ember.Object.extend({

    // WebsocketRailsChannel.create({ name: channel_name, dispatcher: this, is_private: true, on_success: success_callback, on_failure: failure_callback });
    init: function() {
        //console.log('channel: init()');

        var event_name;

        if ( this.get('is_private') ) {
            event_name = 'websocket_rails.subscribe_private';
        } 
        else {
            event_name = 'websocket_rails.subscribe';
        }

        var dispatcher = this.get('dispatcher');
        var conn = dispatcher.conn;
        var connection_id = conn != null ? conn.connection_id : void 0;

        this.set('connection_id', connection_id );
        var event = WebsocketRailsEvent.create({ 
                        data: [ event_name, { channel: this.get('name') }, this.get('connection_id') ], 
                        success_callback: this.get('on_success'), failure_callback: this.get('on_failure') 
        });

        dispatcher.trigger_event(event);

        this.set('callbacks', {} );
        this.set('token', void 0 );
        this.set('queue', [] );

    },

    is_public: function() {
        //console.log('channel: is_public()');
        return !this.get('is_private');
    },

    _destroy: function() {
        //console.log('channel: _destroy()');

        var dispatcher = this.get('dispatcher');
        var conn = dispatcher.conn;
        var connection_id = conn != null ? conn.connection_id : void 0;

        if ( this.get('connection_id') === connection_id ) {
            var event = WebsocketRailsEvent.create({ data: [ 'websocket_rails.unsubscribe', { channel: this.get('name') }, connection_id ]  });
            dispatcher.trigger_event(event);
        }
        this.set('callbacks', {} );
    },

    bind: function(event_name, callback) {
        //console.log('channel: bind()');
        var callbacks = this.get('callbacks');
        if ( callbacks[event_name] == null) {
            callbacks[event_name] = [];
        }
        callbacks[event_name].push(callback);
        this.set('callbacks', callbacks);
    },

    unbind: function(event_name) {
        //console.log('channel: unbind()');
        var callbacks = this.get('callbacks');
        delete callbacks[event_name];
        this.set('callbacks', callbacks);
    },

    trigger: function(event_name, message) {
        //console.log('channel: trigger()');
        var token = this.get('token');
        var event = WebsocketRailsEvent.create({ data: [ event_name, { channel: this.get('name'), data: message, token: token }, this.get('connection_id') ]  });
        if (!token) {
            var queue = this.get('queue');
            queue.push(event);
            this.set('queue', queue );
        }
        else {
            var dispatcher = this.get('dispatcher');
            dispatcher.trigger_event(event);
        }
    },

    dispatch: function(event_name, message) {
        //console.log('channel: dispatch()');
        if (event_name === 'websocket_rails.channel_token') {
            var dispatcher = this.get('dispatcher');
            var conn = dispatcher.conn;
            var connection_id = conn != null ? conn.connection_id : void 0; 
            this.set('connection_id', connection_id);
            this.set('token', message['token'] );
            this.flush_queue();
        }
        else {
            var callbacks = this.get('callbacks');
            if ( callbacks[event_name] == null) {
                return;
            }
            var callback = callbacks[event_name];
            var results = [];
            for ( var i = 0; i < callback.length; i++) {
                var _callback = callback[i];
                results.push(_callback(message)); 
            }
            return results;
        }
    },

    flush_queue: function() {
        //console.log('channel: flush_queue()');
        var queue = this.get('queue');
        var dispatcher = this.get('dispatcher');
        for ( var i = 0; i < queue.length; i++) {
            dispatcher.trigger_event( queue[i] );
        }

        this.set('queue', []);
    }

});
