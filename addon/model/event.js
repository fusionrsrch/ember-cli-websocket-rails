import Ember from 'ember';

export default Ember.Object.extend({

    init: function() {
        console.log('event: init()');

        var message = this.get('message');
        this.set('name', message[0] );
        this.set('data', message[1] );

        var options = message[2];
        
        if (typeof options !== "undefined" && options !== null) {

            var id = options['id'] != null ? options['id'] : ((1 + Math.random()) * 0x10000) | 0;
            this.set('id', id );
            this.set('channel', options.channel );
            this.set('token',  options.token );
            this.set('connection_id', options.connection_id );

            if (options.success != null) {
                this.set('result', true );
                this.set('success', options.success );
            }
        }
        
//        console.log( message[0], message[1], message[2] );

    },

    is_channel: function() {
        console.log('event: is_channel()');
        return this.get('channel') != null;
    },

    is_result: function() {
        console.log('event: is_result()');
        return typeof this.get('result') !== 'undefined';
    },

    is_ping: function() {
        console.log('event: is_ping()');
        return this.get('name') === 'websocket_rails.ping';
    },

    serialize: function() {
        console.log('event: serialize()');
        return JSON.stringify([this.get('name'), this.get('data'), this.meta_data()]);
    },

    meta_data: function() {
        console.log('event: meta_data()');
        return {
            id: this.get('id'),
            connection_id: this.get('connection_id'),
            channel: this.get('channel'),
            token: this.get('token')
        };
    },

    run_callbacks: function(success, result) {
        console.log('event: run_callbacks()');
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
