import Ember from 'ember';
import WebsocketRailsEvent from '../model/event';

export default Ember.Object.extend({

    init: function() {

        var event_name, ref;

        if ( this.get('is_private') ) {
            event_name = 'websocket_rails.subscribe_private';
        } 
        else {
            event_name = 'websocket_rails.subscribe';
        }

        var connection_id = ( ref = this.get('dispatcher')._conn) != null ? ref.get('connection_id') : void 0;

        this.set('connection_id', connection_id );
        var event = WebsocketRailsEvent.create({ 
                        message: [ event_name, { channel: this.get('name') }, { connection_id: this.get('connection_id') } ], 
                        success_callback: success_callback, failure_callback: failure_callback 
        });

        var dispatcher = this.get('dispatcher');
        dispatcher.trigger_event(event);

        this.set('callbacks', {} );
        this.set('token', void 0 );

    },

    is_public: function() {
        return !this.get('is_private');
    },

    _destroy: function() {
//        var event, event_name, _ref;
//        if (this.connection_id === ((_ref = this._dispatcher._conn) != null ? _ref.connection_id : void 0)) {
//            event_name = 'websocket_rails.unsubscribe';
//            event = new WebSocketRails.Event([
//        event_name, {
//          channel: this.name
//        }, {
//          connection_id: this.connection_id,
//          token: this._token
//        }
//      ]);
//        this._dispatcher.trigger_event(event);
//        }
//        return this._callbacks = {};
    },

    bind: function(event_name, callback) {
//        var _base;
//        if ((_base = this._callbacks)[event_name] == null) {
//            _base[event_name] = [];
//        }
//        return this._callbacks[event_name].push(callback);
    },

    unbind: function(event_name) {
//     return delete this._callbacks[event_name];
    },

    trigger: function(event_name, message) {
//    var event;
//    event = new WebSocketRails.Event([
//      event_name, message, {
//        connection_id: this.connection_id,
//        channel: this.name,
//        token: this._token
//      }
//    ]);
//    if (!this._token) {
//      return this._queue.push(event);
//    } else {
//      return this._dispatcher.trigger_event(event);
//    }
    },

    dispatch: function(event_name, message) {
//    var callback, event, _i, _j, _len, _len1, _ref, _ref1, _results;
//    if (event_name === 'websocket_rails.channel_token') {
//      this._token = message['token'];
//      _ref = this._queue;
//      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
//        event = _ref[_i];
//        this._dispatcher.trigger_event(event);
//      }
//      return this._queue = [];
//    } else {
//      if (this._callbacks[event_name] == null) {
//        return;
//      }
//      _ref1 = this._callbacks[event_name];
//      _results = [];
//      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
//        callback = _ref1[_j];
//        _results.push(callback(message));
//      }
//      return _results;
//    }
    }


});
