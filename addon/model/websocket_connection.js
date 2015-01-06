import WebsocketRailsAbstractConnection from '../model/abstract_connection';

export default WebsocketRailsAbstractConnection.extend({

    connection_type: 'websocket',

    init: function() {
        //console.log('websocket_connection: init()');
        this._super();

        var url        = this.get('url');
        //var dispatcher = this.get('dispatcher');

        if (url.match(/^wss?:\/\//)) {
            console.log("WARNING: Using connection urls with protocol specified is depricated");
        } 
        else if (window.location.protocol === 'https:') {
            url = "wss://" + url;
        } 
        else {
            url = "ws://" + url;
        }
   
        this.set('_url', url );


        var self = this;

        var conn = new WebSocket(url);

        conn.onmessage = function(event) {
            //console.log('conn.onmessage');
            var event_data = JSON.parse(event.data);
            return self.on_message(event_data);
        };

        conn.onclose = function(event) {
            //console.log('conn.onclose');
            return self.on_close(event);
        };

        conn.onerror = function(event) {
            //console.log('conn.onerror');
            return self.on_error(event);
        };
        
        this.set('conn', conn );

    },

    close: function() {
        //console.log('websocket_connection: close()');
        return this.get('conn').close();
    },

    send_event: function(event) {
        //console.log('websocket_connection: send_event()');
        this._super();
        return this.get('conn').send(event.serialize());
    }

});
