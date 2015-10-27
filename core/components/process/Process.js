function Process (name) {
	this.name = name;
	this.state = 'not initialized';

	window.cmd.system.programs[this.name.toLowerCase()] = this;
}

Process.prototype = {
	init : function (options, properties) {
		this.setState('running');
		window.cmd.system.runningProcesses[this.name.toLowerCase()] = this;

		for (var property in options) {
			this[property] = options[property];
		}

		if(properties) {
			for (var property in properties) {
				this[property] = properties[property];
			}
		}

		this.start();

		return this;
	},

	start: function () {},

	pause: function () {
		this.setState('paused');
	},

	finish: function () {
		this.beforeFinish(function () {
			this.setState('finished');
			this.system.killProcess(this.name.toLowerCase());
			this.shell = null;
			this.system = null;
			this.output = null;
		}.bind(this));
	},

	setState : function (state) {
		this.state = state;
	},

	commands : function () {},
	beforeFinish : function () {}
}