import Ember from 'ember';
import WebsocketRailsMixin from 'ember-cli-websocket-rails/mixin/websocket-rails';

export default Ember.Route.extend( WebsocketRailsMixin, {

    socketURL: 'localhost:3000/websocket',

    on_open: function(data) {
        console.log('Connection has been established: ', data);
        // You can trigger new server events inside this callback if you wish.
    } 
});
