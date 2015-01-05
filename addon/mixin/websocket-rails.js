import Ember from 'ember';
import WebsocketRailsEvent from '../model/event';
import WebsocketRailsChannel from '../model/channel';
import WebsocketRailsHttpConnection from '../model/http_connection';
import WebsocketRailsWebsocketConnection from '../model/websocket_connection';
//var WebsocketRailsEvent = require('../model/event');

export default Ember.Mixin.create({

    socketURL: null,

    callbacks: {},
    channels:  {},
    queue:     {},

    //setupController: function(controller) {
    setupController: function() {

        var socketURL        = this.get('socketURL');

        this.connect();

        this._super.apply(this, arguments);
    },

    connect: function() {

        console.log('websocket_rails: connect()');

        var conn;
        var socketURL        = this.get('socketURL');

        this.set('state', 'connecting');

        //if (!(this.supports_websockets() && this.use_websockets)) {
        if (!(this.supports_websockets() )) {
           //conn = 'Http'; 
        }
        else {
            conn = WebsocketRailsWebsocketConnection.create({ url: socketURL, dispatcher: this });
        }

        this.set('conn', conn );
    },

    supports_websockets: function() {

        var support = false;

        if ( typeof WebSocket === "function" || typeof WebSocket === "object" ) {
            support = true;
        }

        return support;
    }, 

    disconnect: function() {

        var conn = this.get('conn');

        if ( conn ) {
            conn.close();
            delete conn.conn;
            
        } 

        this.set('state', 'disconnected');
    },

    _bind_event: function(event_name, callback) {
        console.log('websockets_rails: bind()');
        var callbacks = this.get('callbacks');
        if ( callbacks[event_name] == null) { 
            callbacks[event_name] = [];
        }
        callbacks[event_name].push(callback);
        this.set('callbacks', callbacks);
    },

    dispatch: function(event) {
        console.log('websockets_rails: dispatch()');
        var callbacks = this.get('callbacks');
//        console.log(callbacks);
        if (callbacks[event.name] == null) {
            return;
        }
        var _callbacks = callbacks[event.name];
        var results = [];
        for ( var i = 0; i < _callbacks.length; i++) {
            var callback = _callbacks[i];
            results.push(callback(event._data));
        }
        return results;
    },
//
//    return function(data) {
//      var event, socket_message, _i, _len, _ref, _results;
//      _results = [];
//      for (_i = 0, _len = data.length; _i < _len; _i++) {
//        socket_message = data[_i];
//        event = new WebSocketRails.Event(socket_message);
//        if (event.is_result()) {
//          if ((_ref = _this.queue[event.id]) != null) {
//            _ref.run_callbacks(event.success, event.data);
//          }
//          delete _this.queue[event.id];
//        } else if (event.is_channel()) {
//          _this.dispatch_channel(event);
//        } else if (event.is_ping()) {
//          _this.pong();
//        } else {
//          _this.dispatch(event);
//        }
//        if (_this.state === 'connecting' && event.name === 'client_connected') {
//          _results.push(_this.connection_established(event.data));
//        } else {
//          _results.push(void 0);
//        }
//      }
//      return _results;
//    };
//

    dispatch_channel: function(event) {
        console.log('websockets_rails: dispatch_channel()');
        var channels = this.get('channels');
        if ( channels[event.channel] == null) {
            return;
        }
        channels[event.channel].dispatch(event.name, event._data);
    },

    new_message: function(data) {
        console.log('websockets_rails: new_message()');

        var queue = this.get('queue');
        var results = [];

        for ( var i = 0; i < data.length; i++) {

            var event = WebsocketRailsEvent.create({ data: data[i] });

            if (event.is_result()) {

                if (queue[event.id] != null) {
                    var _queue = queue[event.id];
                    _queue.run_callbacks(event.success, event._data);
                }
                delete queue[event.id];
            }
            else if (event.is_channel()) {
                this.dispatch_channel(event);
            }
            else if (event.is_ping()) {
                this.pong();
            }
            else {
                this.dispatch(event);
            }

            var state = this.get('state');

            if (state === 'connecting' && event.name === 'client_connected') {
                var _hi = this.connection_established(event.data);
                results.push(_hi);
            }
            else {
                results.push(void 0);
            }
            
        }
        return results;
    },

    pong: function() {
        console.log('websockets_rails: pong()');
        var conn = this.get('conn');
        var connection_id = conn != null ? conn.connection_id : void 0;
        var pong = WebsocketRailsEvent.create({ data: [ 'websocket_rails.pong', {}, connection_id ]  });
        conn.trigger(pong);
    },
    
    connection_established: function(data) {
        console.log('websockets_rails: connection_established()');
        this.set('state', 'connected');
        var conn = this.get('conn');
        conn.setConnectionId(data.connection_id);
        conn.flush_queue();
        if (this.on_open != null) {
            return this.on_open(data);
        }
    },

    connection_stale: function() {
        console.log('websockets_rails: connection_stale()');
        return this.get('state') !== 'connected';
    },

    reconnect_channels: function() {
        console.log('websockets_rails: reconnect_channels()');
        var channels = this.get('channels');
        var results = [];
        for (var name in channels) {
            var channel = channels[name];
            channel.destroy();
            delete channels[name];
            channel = channel.is_private ? this.subscribe_private(name) : this.subscribe(name);
            results.push(channel);
        }
        return results;
    },
//
//  subscribe: (function(_this) {
//    return function(channel_name, success_callback, failure_callback) {
//      var channel;
//      if (_this.channels[channel_name] == null) {
//        channel = new WebSocketRails.Channel(channel_name, _this, false, success_callback, failure_callback);
//        _this.channels[channel_name] = channel;
//        return channel;
//      } else {
//        return _this.channels[channel_name];
//      }
//    };
//  })(this)
//

    _subscribe: function(channel_name, success_callback, failure_callback) {
        console.log('websockets_rails: subscribe()');
        var channels = this.get('channels');
        if (channels[channel_name] == null) {
            var channel = WebsocketRailsChannel.create({ name: channel_name, dispatcher: this, is_private: false, on_success: success_callback, on_failure: failure_callback });
            channels[channel_name] = channel;
            this.set('channels', channels);
//            return channel;
        }
        else {
            
 //           return channels[channel_name];
        }
    },

    _subscribe_private: function(channel_name, success_callback, failure_callback) {
        console.log('websockets_rails: subscribe_private()');
        var channels = this.get('channels');
        if (channels[channel_name] == null) {
            var channel = WebsocketRailsChannel.create({ name: channel_name, dispatcher: this, is_private: true, on_success: success_callback, on_failure: failure_callback });
            channels[channel_name] = channel;
            this.set('channels', channels);
            return channel;
        }
        else {
            return channels[channel_name];
        }
    },

    _trigger: function(event_name, data, success_callback, failure_callback) {
        console.log('websockets_rails: trigger()');
        var conn = this.get('conn');
        var connection_id = conn != null ? conn.connection_id : void 0;
        var event = WebsocketRailsEvent.create({ data: [ event_name, data, connection_id ], success_callback: success_callback, failure_callback: failure_callback });
        this.trigger_event(event);
    },

    trigger_event: function(event) {
        console.log('websockets_rails: trigger_event()');

        var queue = this.get('queue');
        if ( queue[event.id] == null ) {
            queue[event.id] = event;
        } 
        this.set('queue', queue);

        var conn = this.get('conn');
        if ( conn ) {
            conn.trigger(event);
        }
        return event; 
    },

    _unsubscribe: function(channel_name) {
        console.log('websockets_rails: unsubscribe()');

        var channels = this.get('channels');
        if ( channels[channel_name] == null) {
            return;
        }

        channels[channel_name]._destroy();
        delete channels[channel_name];
        this.set('channels', channels);
    },

    _bind_channel_event: function(channel_name, event_name, callback) {
        console.log('websockets_rails: _bind_channel_event()');

        var channels = this.get('channels');
        if ( channels[channel_name] == null) {
            return;
        }

        var channel = channels[channel_name];
        channel.bind(event_name, callback)

//        channels[channel_name]._destroy();
//        delete channels[channel_name];
//        this.set('channels', channels);


    },


    actions: {

        trigger: function(event_name, data, success_callback, failure_callback) {
            console.log('websockets_rails: action -> trigger()');
            this._trigger(event_name, data, success_callback, failure_callback);
        },

        subscribe: function(channel_name, success_callback, failure_callback) {
            console.log('websockets_rails: action -> subscribe()');
            this._subscribe(channel_name, success_callback, failure_callback);
        },

        bind_channel_event: function(channel_name, event_name, callback) {
            console.log('websockets_rails: action -> bind_channel_event()');
            this._bind_channel_event(channel_name, event_name, callback);
        },

        unsubscribe: function(channel_name) {
            console.log('websockets_rails: action -> unsubscribe()');
            this._unsubscribe(channel_name);
        }
        
    }
    
});
