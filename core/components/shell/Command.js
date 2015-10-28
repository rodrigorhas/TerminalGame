
function Option (flags, description) {
	this.flags = flags;
	this.required = ~flags.indexOf('<');
	this.optional = ~flags.indexOf('[');
	this.bool = !~flags.indexOf('-no-');
	flags = flags.split(/[ ,|]+/);
	if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.short = flags.shift();
	this.long = flags.shift();
	this.description = description || '';
}

Option.prototype = {
	name: function () {
		return this.long.replace(/(--|-)/, '');
	}
}

function Command (name, s) {
	this.commands = [];
	this.options = [];
	this._execs = {};
	this._allowUnknownOption = false;
	this._args = [];
	this._name = name || '';

	this._super = s;
}

Command.prototype = {
	name: function (name) {
		this._name = name;
		return this;
	},

	alias: function (alias) {
		if(!arguments.length) return this._alias;
		this._alias = alias;

		this._super.alias[alias] = this._name;
		return this;
	},

	command: function (name, desc, opts) {
		opts = opts || {};

		var args = name.split('/ +/');
		var cmd = new Command(args.shift());

		if(desc) {
			cmd.description(desc);
			this.executables = true;
			this._execs[cmd._name] = true;
			if(opts.isdefault) this.defaultExecutable = cmd._name;
		}

		cmd._noHelp = !!opts.noHelp;
		this.commands.push(cmd);
		cmd.parseExpectedArgs(args);
		cmd.parent = this;
	},

	addImplicitHelpCommand : function () {
		this.command('help [cmd]', 'display help for [cmd]');
	},

	parseExpectedArgs: function(args) {
		if (!args.length) return;
  		var self = this;

  		args.forEach(function(arg) {
		    var argDetails = {
		      required: false,
		      name: '',
		      variadic: false
		    };

		    switch (arg[0]) {
		      case '<':
		        argDetails.required = true;
		        argDetails.name = arg.slice(1, -1);
		        break;
		      case '[':
		        argDetails.name = arg.slice(1, -1);
		        break;
		    }

		    if (argDetails.name.length > 3 && argDetails.name.slice(-3) === '...') {
		      argDetails.variadic = true;
		      argDetails.name = argDetails.name.slice(0, -3);
		    }

		    if (argDetails.name) {
		      self._args.push(argDetails);
		    }
		});

	  return this;
	},

	option: function (op, desc) {
		this.options.push(new Option(op, desc));
		return this;
	},

	exec: function ( args ) {
		var self = this;
		var res = {};

		console.log(args);

		if(args.length) {
			args.forEach(function (arg, i) {
				var argObj = self._args[i];
				if(!argObj) {
					self.options.forEach(function (opt) {
						if(opt.long == arg) {
							//console.log(arg ,opt);
							var flagVal = args.slice(args.indexOf(arg)+1);
							if(!opt.optional && !flagVal.length) {
								console.log('missing '+ arg + ' value');
							}

							if(flagVal.length) {
								
								console.log(opt.flags.split('<').length);
							}
						}
					});
				}
				else {

					res[argObj.name] = arg;
				}
			});
		}

		else {
			for (var i in this._args) {
				var arg = this._args[i];
				if(arg.required) {
					return console.error('missing required argument %s', arg.name );
				}
			}
		}

		console.log(res);
	}
}

var Shell = {
	commands: {},
	alias: {},

	addCommand: function ( name, pattern ) {

		var command = new Command(name, this);

		command.parseExpectedArgs(pattern.split(/ +/));

		this.commands[name] = command;

		return command;
	},

	input: function ( c ) {
		var words = c.split(/ +/);
		var name = words[0];

		var c = this.commands[name];

		if(this.commands[name])
			c = this.commands[name];

		else if (this.alias[name] && this.commands[this.alias[name]])
			c = this.commands[this.alias[name]];
		else
			return console.error('%s: Command not found', name);

		c.exec(words.slice(1));
	}
}

var c = Shell.addCommand('ping', '<target>')
	.option('-p <port>, --port <port>', 'Set the port to ping')
	.option('-ps <packetSize>', 'Set the port to ping');

Shell.input('ping 192.168.0.56 -ps 50');