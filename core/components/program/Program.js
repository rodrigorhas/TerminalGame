function Program (name) {
	this.name = name;
	this.state = 'paused';
	this.shell = null;
	this.waitingInput = false;
	this.properties = {}

	this.userInput = new Event();
	window.cmd.system.programs[this.name.toLowerCase()] = this;
}

Program.prototype = {
	init : function (options) {
		this.shell = options.shell;
		this.output = this.shell.output;
		this.setState('running');
		this.shell.hidePath();

		for (var property in options) {
			this[property] = options[property];
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
			this.shell.showPath();
			this.shell.clearInput();
			this.shell.focusInput();
			this.waitingInput = false;
			this.shell.currentProgram = null;
			this.shell = null;
			this.output = null;
		}.bind(this));
	},

	setState : function (state) {
		this.state = state;
	},

	processInput: function (e) {

		var key = e.which || e.keyCode;

		if(e.ctrlKey && key == 67) {
			e.preventDefault();
			this.finish();
			return;
		} else {
			this.commands(e);
		}
		
	},

	commands : function () {},
	beforeFinish : function () {},

	enterCommand: function (command) {
		this.shell.clearInput();

		var c = command.split(' ');
	},

	waitForUserInput : function (fn) {
		this.waitingInput = true;
		this.userInput.listen(fn);
	},

	preventWrite : function (argument) {
		this.shell._input.hide();
		this.shell._dom.focus();
	},

	allowWrite: function () {
		this.shell.clearInput();
		this.shell._input.show();
	},

	preInputText : function (text) {
		var ir = this.shell._content.find('.inputRow');
		if(!ir.children('.pre-input').length){
			ir.children('.path').hide();
			ir.prepend($('<span class="pre-input">'+text+'</span>'));
		} else {
			ir.children('.pre-input').text(text);
		}
	},

	restoreInputRow : function () {
		this.shell._content.find('.inputRow').children('.pre-input').remove();
		this.shell._path.show();
		this.changeInputType('default');
		this.shell.focusInput();
	},

	changeInputType: function (type) {
		var i = this.shell._input;
		switch (type) {
			case 'default':
				i.removeClass().addClass('input');
				break;

			case 'password':
				i.removeClass().addClass('input password');
				break;
		}
	}
}