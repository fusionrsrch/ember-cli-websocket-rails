import Ember from 'ember';

export default Ember.Object.extend({

    // var event = WebsocketRailsEvent.create( data: data, success_callback: success_callback, failure_callback: failure_callback });    
    init: function() {
        //console.log('event: init()');

        var data = this.get('data');
        var name = data[0];
        var attr = data[1]; 

        this.set('name', name);

        if (attr != null) {
            var id = attr['id'] != null ? attr['id'] : ((1 + Math.random()) * 0x10000) | 0;
            var channel = attr.channel != null ? attr.channel : void 0;
            var _data = attr.data != null ? attr.data : attr;
            var token = attr.token != null ? attr.token : void 0;
            var connection_id = data[2];

            this.set('id', id);
            this.set('channel', channel);
            this.set('token', token);
            this.set('connection_id', connection_id);
            this.set('_data', _data );

            if (attr.success != null) {
                this.set('result', true );
                this.set('success', attr.success);
            }
        }
    },

    is_channel: function() {
        //console.log('event: is_channel()');
        return this.get('channel') != null;
    },

    is_result: function() {
        //console.log('event: is_result()');
        return typeof this.get('result') !== 'undefined';
    },

    is_ping: function() {
        //console.log('event: is_ping()');
        return this.get('name') === 'websocket_rails.ping';
    },

    serialize: function() {
        //console.log('event: serialize()');
        return JSON.stringify([this.get('name'), this.attributes()]);
    },

    attributes: function() {
        //console.log('event: attributes()');
        //console.log( this );
        return {
            id: this.get('id'),
            //channel: this.get('channel'),
            data: this.get('_data'),
            token: this.get('token')
        };
    },

    run_callbacks: function(success, result) {
        //console.log('event: run_callbacks()');
        this.set('success', success);
        this.set('result',result);
        if (this.get('success') === true) {
            return typeof this.success_callback === "function" ? this.success_callback(this.get('result')) : void 0;
        } 
        else {
            return typeof this.failure_callback === "function" ? this.failure_callback(this.get('result')) : void 0;
        }
    }

});
