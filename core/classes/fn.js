
goog.provide('fn');
goog.require('Event');

fn = {
    Event: Event,

	Hash: function (n) {
	    n || (n = 10);
	    for (var t = "", r = function() {
	            var n = Math.floor(62 * Math.random());
	            return 10 > n ? n : String.fromCharCode(36 > n ? n + 55 : n + 61)
	        }; t.length < n;) t += r();
	    return t
	},

	isBool : function(n) {
	    return "boolean" == typeof n ? !0 : !1
	},

	isObject : function(n, t) {
        return t ? this.typeof(n, "Object") : "object" == typeof n ? !0 : !1
    },

    isArray : function(n) {
        return this.typeof(n, "Array")
    },

    isNumber : function(n) {
        return "number" == typeof n ? !0 : !1
    },

    isFunction : function(n) {
        return "function" == typeof n ? !0 : !1
    },

    isUndefined : function(n) {
        return "undefined" == typeof n ? !0 : !1
    },

    isString : function(n) {
        return "string" == typeof n ? !0 : !1
    },

    typeof : function(n, t) {
        return -1 == {}.toString.call(n).indexOf(String(t)) ? !1 : !0
    },

    capitalize : function(n) {
        return n.length ? 1 == n.length ? n.toUpperCase() : n[0].toUpperCase() + n.slice(1) : void 0
    }
}

/*$.fn.disableSelection = function() {

    return this.attr('unselectable', 'on')
       .css({'-moz-user-select':'-moz-none',
             '-moz-user-select':'none',
             '-o-user-select':'none',
             '-khtml-user-select':'none',
             '-webkit-user-select':'none',
             '-ms-user-select':'none',
             'user-select':'none'})
       .bind('selectstart', false);
};*/