import Ember from 'ember';
import WebsocketRailsMixin from 'ember-cli-websocket-rails/mixin/websocket-rails';

export default Ember.Route.extend( WebsocketRailsMixin, {

    socketURL: 'localhost:3000/websocket'
});
