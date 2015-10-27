function Memory () {
	this.usage = {};
	this.max_usage = 0;
	this.current_usage = 0;
}

Memory.prototype = {
	allocate : function ( obj ) {
		if((this.current_usage + obj.memory_usage) >= this.max_usage) return false;
		this.current_usage += obj.memory_usage;

		this.usage[obj.name] = {usage: obj.memory_usage, name: obj.name};
	},

	unallocate : function ( obj ) {
		delete this.usage[obj.name];
	},

	reallocate : function ( obj, size ) {
		this.usage[obj.name] = {usage: size, name: obj.name};
	},

	cleanAll : function () {
		this.usage = {};
		this.current_usage = 0;
	},

	setParams : function (obj) {
		for (var param in obj) {
			this[param] = obj[param];
		}
	}
}