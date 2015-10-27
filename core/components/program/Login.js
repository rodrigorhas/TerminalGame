$(function () {
	var Login = new Program('Login');
	
	Login.start = function () {
		var name = '';
		var socket = window.cmd.system.getConnection();
		var _this = this;

		this.preInputText(this.username + '\'s password:')
		this.changeInputType('password');

		this.waitForUserInput(function (input){
			_this.shell.clearInput();

			if(!isset(_this.username)) return _this.output.error('Missing username');

			if(!window.cmd.system.logged) {

				socket.emit('requestData', _this.username, input);

			} else {
				_this.output.error('You\'re already logged');
			}

		});
	};

	Login.beforeFinish = function (c) {
		this.restoreInputRow();
		this.userInput.unbind();

		c();
	},

	Login.checkAuth = function (data, err) {
		var _this = this;

		function printPathClone () {
			_this.shell.output.print(_this.username + '\'s password:');
		};

		if(isset(data)) {
			var d = JSON.parse(data);
			window.cmd.system.logged = true;

			window.cmd.system.Internet.setIP(d.internet.ip);

		    window.cmd.system.disk.setStorage(d.storage);
		    this.shell.updatePathUser(this.username);

		    printPathClone();

		    this.shell.output.success('Successfully Logged !');
		    window.cmd.system.prepareSomePrograms(d);
		} else {
			printPathClone();
			this.shell.output.error('Authentication failed');
		}

		this.finish();
	}

	Login.commands = function (e) {
		var key = e.which || e.keyC1ode;

		switch (key) {

			// ENTER
			case 13:
				e.preventDefault();
				if(this.waitingInput == false) {
					var cm = this.shell._input.text();
					if(cm.length) this.enterCommand(cm);
				} else {
					var cm = this.shell._input.text();
					this.userInput.trigger(cm);
				}
				break;
		}
	}

	var socket = window.cmd.system.getConnection(), count = 0;

	socket.on('data', function (data) {
		console.log(data);
		window.cmd.system.programs.login.checkAuth(data);
	});
});