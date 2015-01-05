import Ember from 'ember';
import WebsocketRailsEvent from '../model/event';

export default Ember.Object.extend({
//
//  constructor: function(name, _dispatcher, is_private, on_success, on_failure) {
//    var event, event_name, _ref;
//    this.name = name;
//    this._dispatcher = _dispatcher;
//    this.is_private = is_private != null ? is_private : false;
//    this.on_success = on_success;
//    this.on_failure = on_failure;
//    this._callbacks = {};
//    this._token = void 0;
//    this._queue = [];
//    if (this.is_private) {
//      event_name = 'websocket_rails.subscribe_private';
//    } else {
//      event_name = 'websocket_rails.subscribe';
//    }
//    this.connection_id = (_ref = this._dispatcher._conn) != null ? _ref.connection_id : void 0;
//    event = new WebSocketRails.Event([
//      event_name, {
//        data: {
//          channel: this.name
//        }
//      }, this.connection_id
//    ], this._success_launcher, this._failure_launcher);
//    return this._dispatcher.trigger_event(event);
//  }
//

    // WebsocketRailsChannel.create({ name: channel_name, dispatcher: this, is_private: true, on_success: success_callback, on_failure: failure_callback });
    init: function() {
        console.log('channel: init()');

        var event_name;

        if ( this.get('is_private') ) {
            event_name = 'websocket_rails.subscribe_private';
        } 
        else {
            event_name = 'websocket_rails.subscribe';
        }

        var conn = this.get('dispatcher').conn;
        var connection_id = conn != null ? conn.connection_id : void 0;

        this.set('connection_id', connection_id );
//        var event = WebsocketRailsEvent.create({ 
//                        message: [ event_name, { channel: this.get('name') }, { connection_id: this.get('connection_id') } ], 
//                        success_callback: success_callback, failure_callback: failure_callback 
//        });
        var event = WebsocketRailsEvent.create({ 
                        data: [ event_name, { channel: this.get('name') }, this.get('connection_id') ], 
                        success_callback: this._success_launcher, failure_callback: this._failure_launcher 
        });

        var dispatcher = this.get('dispatcher');
        dispatcher.trigger_event(event);

        this.set('callbacks', {} );
        this.set('token', void 0 );
        this.set('queue', [] );

    },

    is_public: function() {
        console.log('channel: is_public()');
        return !this.get('is_private');
    },

    _destroy: function() {
        console.log('channel: _destroy()');

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
        console.log('channel: bind()');
        var callbacks = this.get('callbacks');
        if ( callbacks[event_name] == null) {
            callbacks[event_name] = [];
        }
        callbacks[event_name].push(callback);
        this.set('callbacks', callbacks);
    },

    unbind: function(event_name) {
        console.log('channel: unbind()');
        var callbacks = this.get('callbacks');
        delete callbacks[event_name];
        this.set('callbacks', callbacks);
    },

    trigger: function(event_name, message) {
        console.log('channel: trigger()');
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
//
//  dispatch: function(event_name, message) {
//    var callback, _i, _len, _ref, _ref1, _results;
//    if (event_name === 'websocket_rails.channel_token') {
//      this.connection_id = (_ref = this._dispatcher._conn) != null ? _ref.connection_id : void 0;
//      this._token = message['token'];
//      return this.flush_queue();
//    } else {
//      if (this._callbacks[event_name] == null) {
//        return;
//      }
//      _ref1 = this._callbacks[event_name];
//      _results = [];
//      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
//        callback = _ref1[_i];
//        _results.push(callback(message));
//      }
//      return _results;
//    }
//  }
//
    dispatch: function(event_name, message) {
        console.log('channel: dispatch()');
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
//
//  flush_queue: function() {
//    var event, _i, _len, _ref;
//    _ref = this._queue;
//    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
//      event = _ref[_i];
//      this._dispatcher.trigger_event(event);
//    }
//    return this._queue = [];
//  }
//
    flush_queue: function() {
        console.log('channel: flush_queue()');
    },


    _success_launcher: function(data) {
        console.log('channel: _success_launcher()');
        var on_success = this.get('on_success');
        if ( on_success != null) {
            on_success(data);
        }
    },

    _failure_launcher: function(data) {
        console.log('channel: _failure_launcher()');
        var on_failure = this.get('on_failure');
        if ( on_failure != null) {
            on_failure(data);
        }
    } 



});
