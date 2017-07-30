function System () {
	this.logged = false;
	this.socketConnection = io.connect('http://127.0.0.1:8081');
	//this.socketConnection = io.connect('http://192.168.0.56:8081');
	this.programs = {};
	this.runningProcesses = {};

	this.shellInstances = [];

	this.firstLoginCall = 0;
	this.shellTheme = (localStorage.getItem('cmd-c-t')) ? localStorage.getItem('cmd-c-t') : 'black';
	this.Memory = null;

	this.init();
}

System.prototype = {

	init: function () {
		this.disk = new Disk().create({

			expansion: 2,
			name: 'C',
			size: 20452

		});
	},

	setConnection: function (socket) {
		this.socketConnection = socket;
		this.ip = socket.ip;
		return socket;
	},

	unsetConnection: function (callback) {
		this.logged = false;
		this.socketConnection.emit('logout');

		if(callback) callback();
	},

	setStatusConnection: function (status) {
		this.logged = status;
	},

	getConnection: function (argument) {
		return this.socketConnection;
	},

	getProgram: function (argument) {
		return this.programs[argument] || null;
	},

	getProcess: function (argument) {
		return this.programs[argument] || null;
	},

	stopAllProcesses : function () {
		console.log(this.runningProcesses);
		for (var process in this.runningProcesses) {
			console.debug('killing process => ' + this.runningProcesses[process].name);
			this.runningProcesses[process].finish();
		}
	},

	killProcess : function (name) {
		delete this.runningProcesses[name];
		console.log('process kiled');
	},

	prepareSomePrograms : function (data) {
		var _this = this;

		this.Internet.setIP(data.ip);

		function startSystemProcess (options, properties) {
			if(_this.programs[options.name]) {

				_this.Memory.allocate(properties);

				var name = options.name;
				delete options.name;

				var program = _this.programs[name].init(options, properties);
			}
		}

		this.runningProcesses = {};

		// SET INTERNET PARAMS
		var internetParams = data.internet;

		console.log(internetParams);

		this.Internet.setParams(internetParams);

		// SET HARDWARES PARAMS
		var hardwares = data.hardwares;

		for (var i = 0; i < hardwares.length; i++) {
			var hardware = hardwares[i];

			this[hardware.name].setParams(hardware.config);
		};

		// SET PROCESSES PARAMS
		var processes = data.processes;

		for (var i = 0; i < processes.length; i++) {
			var process = processes[i];

			startSystemProcess({
				name: process.name,
				system: this
			}, process || null);
		};

	},

	createTerminal : function () {
		new Shell();
	}

}

if(!window.cmd) window.cmd = {};
if(!window.cmd.system) window.cmd.system = new System();
window.cmd.system.Memory = new Memory();
window.cmd.system.Internet = new Internet();