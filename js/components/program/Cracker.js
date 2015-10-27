$(function () {
	var Cracker = new Process('Cracker');
	Cracker.start = function () {

		var socket = cmd.system.getConnection();
		socket.on('crackerResponse', function (response) {
			if(response != null && response != 404) {
				this.shell.output.success('Successfully hacked !');
				this.shell.output.print('Target => username: ' + response.username);
				this.shell.output.print('Target => password: ' + response.password);
				this.shell.output.print('Cracker : adding to log ...');
				this.shell.output.print('Cracker : information saved !');
				this.shell.output.print('Cracker : enter command ( cracker log ) to see all !');
				this.shell.output.print('');
			} else if ( response == null ){
				this.shell.output.error('Your cracker level is lower then the target !');
			} else if( response == 404 ){
				this.shell.output.error('Your target isn\'t connected !');
			}
		}.bind(this));

	}

	Cracker.crack = function (target) {
		if(target == window.cmd.system.ip) {
			return this.shell.output.error('You cannot crack yourself ! Are you dumb ?!');
		}

		socket.emit('crackerRequest', {target: target, programLevel: this.level});
	}

	Cracker.beforeFinish = function () {
		console.log('crack finished');
	}

	Cracker.setShell = function (shell) {
		this.shell = shell;
	}
});

var socket = cmd.system.getConnection();
socket.on('crackerRequest', function (senderPackage) {
	console.log('request end, returning data from target ip');
	var hasher = window.cmd.system.getProcess('hasher');
	senderPackage.receiver = {programLevel: hasher.level}
	socket.emit('crackerResponse', senderPackage);
})