
goog.provide('System.Socket');

System.Socket = function (object) {
	this._connections = {};
	this._currentConnection;
	this._listeners = {}
}

System.Socket.prototype = {
	connect: function (name, ip) {
		this._connections[name] = io.connect(ip);
	},

	getSocket : function (socket) {
		if(socket in this._connections) {
			return this._connections[socket];
		}

		return null;
	},

	registerListener : function (name) {
		this._listeners[name] = name;
	},

	hasListener : function (name) {
		if(name in this._listeners) {
			return true;
		}
		return false;
	}
}