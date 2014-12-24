import Ember from 'ember';
import WebsocketRailsEvent from '../model/event';
import WebsocketRailsChannel from '../model/channel';
import WebsocketRailsHttpConnection from '../model/http_connection';
import WebsocketRailsWebsocketConnection from '../model/websocket_connection';
//var WebsocketRailsEvent = require('../model/event');

export default Ember.Mixin.create({

    socketURL: null,
//    socketContexts: {}, // This is shared between route instances.
//    keepSocketAlive: null,
//    socketConnection: null,
//    socketBinaryType: null,

    callbacks: {},
    channels:  {},
    queue:     {},

    //setupController: function(controller) {
    setupController: function() {

//        var urlHashKey;
        var socketURL        = this.get('socketURL');
//        var websocket        = this.get('socketConnection');
//        var socketContexts   = this.get('socketContexts');
//        var socketBinaryType = this.get('socketBinaryType');

        console.log( socketURL );

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

        //console.log(conn);
//    if (!(this.supports_websockets() && this.use_websockets)) {
//      this._conn = new WebSocketRails.HttpConnection(this.url, this);
//    } else {
//      this._conn = new WebSocketRails.WebSocketConnection(this.url, this);
//    }
//    return this._conn.new_message = this.new_message;
//  }
//

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
//    if (this._conn) {
//      this._conn.close();
//      delete this._conn._conn;
//      delete this._conn;
//    }

        this.set('state', 'disconnected');
    },
//
//        return function(event) {
//      var callback, _i, _len, _ref, _results;
//      if (_this.callbacks[event.name] == null) {
//        return;
//      }
//      _ref = _this.callbacks[event.name];
//      _results = [];
//      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
//        callback = _ref[_i];
//        _results.push(callback(event.data));
//      }
//      return _results;
//
    //var self = this;

    dispatch: function(event) {
        console.log('websockets_rails: dispatch()');
        var callbacks = this.get('callbacks');
        if (callbacks[event.name] == null) {
            return;
        }
        var _callbacks = callbacks[event.name];
        var results = [];
        for ( var i = 0; i < _callbacks.length; i++) {
            var callback = _callbacks[i];
            results.push(callback(event.data));
        }
        return results;
    },
//
//  new_message: (function(_this) {
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
//  })(this)
//

    new_message: function(data) {
        console.log('websockets_rails: new_message()');

        var queue = this.get('queue');
        var results = [];

        for ( var i = 0; i < data.length; i++) {

            var event = WebsocketRailsEvent.create({ message: data[i] });

            if (event.is_result()) {

                if (queue[event.id] != null) {
                    var _queue = queue[event.id];
                    _queue.run_callbacks(event.success, event.data);
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
        var pong = WebsocketRailsEvent.create({ message: [ 'websocket_rails.pong', {}, { connection_id: connection_id } ]  });
        conn.trigger(pong);
    },
//
//  connection_established: (function(_this) {
//    return function(data) {
//      _this.state = 'connected';
//      _this._conn.setConnectionId(data.connection_id);
//      _this._conn.flush_queue();
//      if (_this.on_open != null) {
//        return _this.on_open(data);
//      }
//    };
//  })(this)
//
    
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
//
//  reconnect_channels: function() {
//    var callbacks, channel, name, _ref, _results;
//    _ref = this.channels;
//    _results = [];
//    for (name in _ref) {
//      channel = _ref[name];
//      callbacks = channel._callbacks;
//      channel.destroy();
//      delete this.channels[name];
//      channel = channel.is_private ? this.subscribe_private(name) : this.subscribe(name);
//      channel._callbacks = callbacks;
//      _results.push(channel);
//    }
//    return _results;
//  }

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


    subscribe: function(channel_name, success_callback, failure_callback) {
        console.log('websockets_rails: subscribe()');
        var channels = this.get('channels');
        if (channels[channel_name] == null) {
            var channel = WebsocketRailsChannel.create({ name: channel_name, dispatcher: this, is_private: false, on_success: success_callback, on_failure: failure_callback });
            channels[channel_name] = channel;
            this.set('channels', channels);
            return channel;
        }
        else {
            return channels[channel_name];
        }
    },

    subscribe_private: function(channel_name, success_callback, failure_callback) {
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

    actions: {


//       connection_established: function() {},

//       bind: function() {},

//        trigger: function(event_name, data, success_callback, failure_callback) {
        trigger: function(event_name) {

            console.log('trigger: ' + event_name );
            //var event = new WebsocketRailsEvent([ event_name, data, { connection_id: this.connection_id } ], success_callback, failure_callback );
            //var event = WebsocketRailsEvent.create({ message: [ event_name, data, {} ], success_callback: success_callback, failure_callback: failure_callback });
            //var channel = WebsocketRailsChannel.create({ name: 'channel_name', dispatcher: this, is_private: false, on_success: success_callback, on_failure: failure_callback });
//            var connection = WebsocketRailsHttpConnection.create();


        },

       trigger_event: function() {},

//       dispatch: function() {},

//       subscribe: function() {},

//       subscribe_private: function() {},

//       unsubscribe: function() {},

//       dispatch_channel: function() {}
    }

    
});
