import WebsocketRailsAbstractConnection from '../model/abstract_connection';

export default WebsocketRailsAbstractConnection.extend({

    connection_type: 'http',

    _httpFactories: function() {
        return [
            function() {
                return new XMLHttpRequest();
            }, 
            function() {
                return new ActiveXObject("Msxml2.XMLHTTP");
            }, 
            function() {
                return new ActiveXObject("Msxml3.XMLHTTP");
            }, 
            function() {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        ];
    },

    init: function() {
        this._super();
//
//  constructor: function(url, dispatcher) {
//    this.dispatcher = dispatcher;
//    this._url = "http://" + url;

        this.set('_url', "http://" + url);
        this.set('conn', this._createXMLHttpObject() );
        this.set('last_pos', 0 );

//    this.last_pos = 0;
//    this._conn.onreadystatechange = (function(_this) {
//      return function() {
//        return _this._parse_stream();
//      };
//    })(this);
//    this._conn.addEventListener("load", this.on_close, false);
//    this._conn.open("GET", this._url, true);
//    return this._conn.send();
//  }
//
        
    },

    _createXMLHttpObject: function() {
        var xmlhttp = false;
        var factories = this._httpFactories();
        for ( var i = 0; i < factories.length; i++) {
            var factory = factories[i];
            try {
                xmlhttp = factory();
            }
            catch(error) {
                var e = error;
                continue;
            }
            break;
        }
        return xmlhttp;
    }


});
