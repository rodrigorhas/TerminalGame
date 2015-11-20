/**
 * Initialize a new `Option` with the given `flags` and `description`.
 *
 * @param {String} flags
 * @param {String} description
 * @api public
 */

 function Option(flags, description) {
 	this.flags = flags;
 	this.required = ~flags.indexOf('<');
 	this.optional = ~flags.indexOf('[');
 	this.bool = !~flags.indexOf('-no-');
 	flags = flags.split(/[ ,|]+/);
 	if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.short = flags.shift();
 	this.long = flags.shift();
 	this.description = description || '';
 }

/**
 * Return option name.
 *
 * @return {String}
 * @api private
 */

 Option.prototype.name = function() {
 	return this.long
 	.replace('--', '')
 	.replace('no-', '');
 };

/**
 * Check if `arg` matches the short or long flag.
 *
 * @param {String} arg
 * @return {Boolean}
 * @api private
 */

 Option.prototype.is = function(arg) {
 	return arg == this.short || arg == this.long;
 };

/**
 * Initialize a new `Command`.
 *
 * @param {String} name
 * @api public
 */

 function Command(name) {
 	this._name    = name || '';
 	this._args    = [];
 	this._execs   = {};
 	this.options  = [];
 	this.commands = [];
 	this.onFinish = function () {};
 	this._allowUnknownOption = false;

 	var self = this;
 	this.on('finish', function () {
 		self.onFinish.bind(self)();
 	});
 }

/**
 * Inherit from `EventEmitter.prototype`.
 */

 Command.prototype.__proto__ = EventEmitter.prototype;

/**
 * Add command `name`.
 *
 * The `.action()` callback is invoked when the
 * command `name` is specified via __ARGV__,
 * and the remaining arguments are applied to the
 * function for access.
 *
 * When the `name` is "*" an un-matched command
 * will be passed as the first arg, followed by
 * the rest of __ARGV__ remaining.
 *
 * Examples:
 *
 *      program
 *        .version('0.0.1')
 *        .option('-C, --chdir <path>', 'change the working directory')
 *        .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
 *        .option('-T, --no-tests', 'ignore test hook')
 *
 *      program
 *        .command('setup')
 *        .description('run remote setup commands')
 *        .action(function() {
 *          console.log('setup');
 *        });
 *
 *      program
 *        .command('exec <cmd>')
 *        .description('run the given remote command')
 *        .action(function(cmd) {
 *          console.log('exec "%s"', cmd);
 *        });
 *
 *      program
 *        .command('teardown <dir> [otherDirs...]')
 *        .description('run teardown commands')
 *        .action(function(dir, otherDirs) {
 *          console.log('dir "%s"', dir);
 *          if (otherDirs) {
 *            otherDirs.forEach(function (oDir) {
 *              console.log('dir "%s"', oDir);
 *            });
 *          }
 *        });
 *
 *      program
 *        .command('*')
 *        .description('deploy the given env')
 *        .action(function(env) {
 *          console.log('deploying "%s"', env);
 *        });
 *
 *      program.parse(process.argv);
  *
 * @param {String} name
 * @param {String} [desc] for git-style sub-commands
 * @return {Command} the new command
 * @api public
 */

 Command.prototype.command = function(name, desc, opts) {
 	opts = opts || {};
 	var args = name.split(/ +/);
 	var cmd = new Command(args.shift());

 	if (desc) {
 		cmd.description(desc);
 		this.executables = true;
 		this._execs[cmd._name] = true;
 	}

 	cmd._noHelp = !!opts.noHelp;
 	this.commands.push(cmd);
 	cmd.parseExpectedArgs(args);
 	cmd.parent = this;

 	if (desc) return this;
 	return cmd;
 };

/**
 * Define argument syntax for the top-level command.
 *
 * @api public
 */

 Command.prototype.arguments = function (desc) {
 	return this.parseExpectedArgs(desc.split(/ +/));
 };

/**
 * Define the finish command callback function
 *
 * @api public
 */

 Command.prototype.finish = function (fn) {
 	if(!fn) throw "Missing finish function";
 	this.onFinish = fn;
 	return this;
 };


/**
 * Add an implicit `help [cmd]` subcommand
 * which invokes `--help` for the given command.
 *
 * @api private
 */

 Command.prototype.addImplicitHelpCommand = function() {
 	this.command('help [cmd]', 'display help for [cmd]');
 };

/**
 * Parse expected `args`.
 *
 * For example `["[type]"]` becomes `[{ required: false, name: 'type' }]`.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api public
 */

 Command.prototype.parseExpectedArgs = function(args) {
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
 };

/**
 * Register callback `fn` for the command.
 *
 * Examples:
 *
 *      program
 *        .command('help')
 *        .description('display verbose help')
 *        .action(function() {
 *           // output help here
 *        });
 *
 * @param {Function} fn
 * @return {Command} for chaining
 * @api public
 */

 Command.prototype.action = function(fn) {
 	var self = this;
 	var listener = function(args, unknown) {
	// Parse any so-far unknown options
	args = args || [];
	unknown = unknown || [];

	var parsed = self.parseOptions(unknown);

	// Output help if necessary
	outputHelpIfNecessary(self, parsed.unknown);

	// If there are still any unknown options, then we simply
	// die, unless someone asked for help, in which case we give it
	// to them, and then we die.
	if (parsed.unknown.length > 0) {
		self.unknownOption(parsed.unknown[0]);
	}

	// Leftover arguments need to be pushed back. Fixes issue #56
	if (parsed.args.length) args = parsed.args.concat(args);

	self._args.forEach(function(arg, i) {
		if (arg.required && null == args[i]) {
			self.missingArgument(arg.name);
		} else if (arg.variadic) {
			if (i !== self._args.length - 1) {
				self.variadicArgNotLast(arg.name);
			}

			args[i] = args.splice(i);
		}
	});

	// Always append ourselves to the end of the arguments,
	// to make sure we match the number of arguments the user
	// expects
	if (self._args.length) {
		args[self._args.length] = self;
	} else {
		args.push(self);
	}

	fn.apply(self, args);
};
var parent = this.parent || this;
var name = parent === this ? '*' : this._name;
parent.on(name, listener);
if (this._alias) parent.on(this._alias, listener);
return this;
};

/**
 * Define option with `flags`, `description` and optional
 * coercion `fn`.
 *
 * The `flags` string should contain both the short and long flags,
 * separated by comma, a pipe or space. The following are all valid
 * all will output this way when `--help` is used.
 *
 *    "-p, --pepper"
 *    "-p|--pepper"
 *    "-p --pepper"
 *
 * Examples:
 *
 *     // simple boolean defaulting to false
 *     program.option('-p, --pepper', 'add pepper');
 *
 *     --pepper
 *     program.pepper
 *     // => Boolean
 *
 *     // simple boolean defaulting to true
 *     program.option('-C, --no-cheese', 'remove cheese');
 *
 *     program.cheese
 *     // => true
 *
 *     --no-cheese
 *     program.cheese
 *     // => false
 *
 *     // required argument
 *     program.option('-C, --chdir <path>', 'change the working directory');
 *
 *     --chdir /tmp
 *     program.chdir
 *     // => "/tmp"
 *
 *     // optional argument
 *     program.option('-c, --cheese [type]', 'add cheese [marble]');
 *
 * @param {String} flags
 * @param {String} description
 * @param {Function|Mixed} fn or default
 * @param {Mixed} defaultValue
 * @return {Command} for chaining
 * @api public
 */

 Command.prototype.option = function(flags, description, fn, defaultValue) {
 	var self = this
 	, option = new Option(flags, description)
 	, oname = option.name()
 	, name = camelcase(oname);

  // default as 3rd arg
  if (typeof fn != 'function') {
  	if (fn instanceof RegExp) {
  		var regex = fn;
  		fn = function(val, def) {
  			var m = regex.exec(val);
  			return m ? m[0] : def;
  		}
  	}
  	else {
  		defaultValue = fn;
  		fn = null;
  	}
  }

  // preassign default value only for --no-*, [optional], or <required>
  if (false == option.bool || option.optional || option.required) {
	// when --no-* we make sure default is true
	if (false == option.bool) defaultValue = true;
	// preassign only if we have a default
	if (undefined !== defaultValue) self[name] = defaultValue;
}

  // register the option
  this.options.push(option);

  // when it's passed assign the value
  // and conditionally invoke the callback
  this.on(oname, function(val) {
	// coercion
	if (null !== val && fn) val = fn(val, undefined === self[name]
		? defaultValue
		: self[name]);

	// unassigned or bool
if ('boolean' == typeof self[name] || 'undefined' == typeof self[name]) {
	  // if no value, bool true, and we have a default, then use it!
	  if (null == val) {
	  	self[name] = option.bool
	  	? defaultValue || true
	  	: false;
	  } else {
	  	self[name] = val;
	  }
	} else if (null !== val) {
	  // reassign
	  self[name] = val;
	}
});

  return this;
};

/**
 * Allow unknown options on the command line.
 *
 * @param {Boolean} arg if `true` or omitted, no error will be thrown
 * for unknown options.
 * @api public
 */
 Command.prototype.allowUnknownOption = function(arg) {
 	this._allowUnknownOption = arguments.length === 0 || arg;
 	return this;
 };

/**
 * Parse `argv`, settings options and invoking commands when defined.
 *
 * @param {Array} argv
 * @return {Command} for chaining
 * @api public
 */

 Command.prototype.parse = function(argv) {
  // store raw args
  this.rawArgs = argv;

  // guess name
  this._name = this._name;

  // github-style sub-commands with no sub-command
  if (this.executables && argv.length < 2 && argv.indexOf('--help') == -1) {
	// this user needs help
	argv.push('--help');
}

  // process argv
  var parsed = this.parseOptions(this.normalize(argv));
  var args = this.args = parsed.args;

  var result = this.parseArgs(this.args, parsed.unknown);

  // executable sub-commands
  var name = result.args[0];

  var rc = this.Shell.runningCommand;

  if (this._execs[name]) {
  	if(typeof this._execs[name] != "function") {
	  	if(!rc.parent)
	  		rc.parent = this;

	  	return this.executeSubCommand(argv, args, parsed.unknown);
  	}
  }

  else { // if isnt a command

  	console.log(args, argv);
  	var isArg1 = argv.indexOf('--');
  	var isArg2 = argv.indexOf('-');

  	if((isArg1 > -1 || isArg2 > -1) && argv[isArg1 || isArg2] !== '--help') {
  		var index;
  		if(isArg1 > -1) index = isArg1;
  		if(isArg2 > -1) index = isArg2;

  		if(isArg1 == 0 || isArg2 == 0) index = 0;

  		this.unknownOption(argv[index]);
  	}

  	else if (argv.indexOf(name) > -1) {
  		this.Shell.output.error('No command \''+ (name || this._name) +'\' found');
  	}

  	if(rc.parent) {
	  	if(rc.parent._name != this._name)
	  		rc.parent.emit('finish');
	  	this.emit('finish');
	}

	  else this.emit('finish');
  }

  // dont have sub-commands

  return result;
};

Command.prototype.setShell = function ( instance ) {
	if(!instance) throw "missing instance name - Command::setShell"
		this.Shell = instance;
}

/**
 * Execute a sub-command executable.
 *
 * @param {Array} argv
 * @param {Array} args
 * @param {Array} unknown
 * @api private
 */

 Command.prototype.executeSubCommand = function(argv, args, unknown) {
 	args = args.concat(unknown);

 	if (!args.length) this.help();
 	if ('--help' == args[0] && 1 == args.length) return this.help();

  // executable
  var cmdName = args[0];
  args = args.slice(1);

  var proc;

  if(this.Shell.runningCommand.current) {
  	var parentOfThis = this.Shell.runningCommand.current;
  	console.log(parentOfThis);
  	parentOfThis.command.parse(args);
  }

  else {
  	var parent = this.Shell.commands[this._name];
  	var cmd = parent.children[cmdName];
  	if(cmd) {
  		cmd.command.parse(args);
  		this.Shell.runningCommand.current = cmd;
  	}

  	else {
  		this.Shell.output.error('No command \''+ cmdName +'\' found');
  	}
  }
};

/**
 * Normalize `args`, splitting joined short flags. For example
 * the arg "-abc" is equivalent to "-a -b -c".
 * This also normalizes equal sign and splits "--abc=def" into "--abc def".
 *
 * @param {Array} args
 * @return {Array}
 * @api private
 */

 Command.prototype.normalize = function(args) {
 	var ret = []
 	, arg
 	, lastOpt
 	, index;

 	for (var i = 0, len = args.length; i < len; ++i) {
 		arg = args[i];
 		if (i > 0) {
 			lastOpt = this.optionFor(args[i-1]);
 		}

 		if (arg === '--') {
	  // Honor option terminator
	  ret = ret.concat(args.slice(i));
	  break;
	} else if (lastOpt && lastOpt.required) {
		ret.push(arg);
	} else if (arg.length > 1 && '-' == arg[0] && '-' != arg[1]) {
		arg.slice(1).split('').forEach(function(c) {
			ret.push('-' + c);
		});
	} else if (/^--/.test(arg) && ~(index = arg.indexOf('='))) {
		ret.push(arg.slice(0, index), arg.slice(index + 1));
	} else {
		ret.push(arg);
	}
}

return ret;
};

/**
 * Parse command `args`.
 *
 * When listener(s) are available those
 * callbacks are invoked, otherwise the "*"
 * event is emitted and those actions are invoked.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api private
 */

 Command.prototype.parseArgs = function(args, unknown) {
 	var name;

 	if (args.length) {
 		name = args[0];
 		if (this.listeners(name).length) {
 			this.emit(args.shift(), args, unknown);
 		} else {
 			this.emit('*', args);
 		}
 	} else {
 		outputHelpIfNecessary(this, unknown);

	// If there were no args and we have unknown options,
	// then they are extraneous and we need to error.
	/*if (unknown.length > 0) {
		console.log(unknown);
	  this.unknownOption(unknown[0]);
	}*/
}

return this;
};

/**
 * Return an option matching `arg` if any.
 *
 * @param {String} arg
 * @return {Option}
 * @api private
 */

 Command.prototype.optionFor = function(arg) {
 	for (var i = 0, len = this.options.length; i < len; ++i) {
 		if (this.options[i].is(arg)) {
 			return this.options[i];
 		}
 	}
 };

/**
 * Parse options from `argv` returning `argv`
 * void of these options.
 *
 * @param {Array} argv
 * @return {Array}
 * @api public
 */

 Command.prototype.parseOptions = function(argv) {
 	var args = []
 	, len = argv.length
 	, literal
 	, option
 	, arg;

 	var unknownOptions = [];

  // parse options
  for (var i = 0; i < len; ++i) {
  	arg = argv[i];

	// literal args after --
	if ('--' == arg) {
		literal = true;
		continue;
	}

	if (literal) {
		args.push(arg);
		continue;
	}

	// find matching Option
	option = this.optionFor(arg);

	// option is defined
	if (option) {
	  // requires arg
	  if (option.required) {
	  	arg = argv[++i];
	  	if (null == arg) return this.optionMissingArgument(option);
	  	this.emit(option.name(), arg);
	  // optional arg
	} else if (option.optional) {
		arg = argv[i+1];
		if (null == arg || ('-' == arg[0] && '-' != arg)) {
			arg = null;
		} else {
			++i;
		}
		this.emit(option.name(), arg);
	  // bool
	} else {
		this.emit(option.name());
	}
	continue;
}

	// looks like an option
	if (arg.length > 1 && '-' == arg[0]) {
		unknownOptions.push(arg);

	  // If the next argument looks like it might be
	  // an argument for this option, we pass it on.
	  // If it isn't, then it'll simply be ignored
	  if (argv[i+1] && '-' != argv[i+1][0]) {
	  	unknownOptions.push(argv[++i]);
	  }
	  continue;
	}

	// arg
	args.push(arg);
}

return { args: args, unknown: unknownOptions };
};

/**
 * Return an object containing options as key-value pairs
 *
 * @return {Object}
 * @api public
 */
 Command.prototype.opts = function() {
 	var result = {}
 	, len = this.options.length;

 	for (var i = 0 ; i < len; i++) {
 		var key = camelcase(this.options[i].name());
 		result[key] = key === 'version' ? this._version : this[key];
 	}
 	return result;
 };

/**
 * Argument `name` is missing.
 *
 * @param {String} name
 * @api private
 */

 Command.prototype.missingArgument = function(name) {
 	console.error();
 	console.error("  error: missing required argument `%s'", name);
 	console.error();
 	console.info(' Shell output implementation ')
  //process.exit(1);
};

/**
 * `Option` is missing an argument, but received `flag` or nothing.
 *
 * @param {String} option
 * @param {String} flag
 * @api private
 */

 Command.prototype.optionMissingArgument = function(option, flag) {
 	console.error();
 	if (flag) {
 		console.error("  error: option `%s' argument missing, got `%s'", option.flags, flag);
 	} else {
 		console.error("  error: option `%s' argument missing", option.flags);
 	}
 	console.info(' Shell output implementation ');
  //process.exit(1);
};

/**
 * Unknown option `flag`.
 *
 * @param {String} flag
 * @api private
 */

 Command.prototype.unknownOption = function(flag) {
 	if (this._allowUnknownOption) return;

 	this.Shell.output.error([
 		'',
 		"  error: unknown option '" + flag + "'",
 		''
 	]);
};

/**
 * Variadic argument with `name` is not the last argument as required.
 *
 * @param {String} name
 * @api private
 */

 Command.prototype.variadicArgNotLast = function(name) {
 	console.error();
 	console.error("  error: variadic arguments must be last `%s'", name);
 	console.error();
  //process.exit(1);
  console.info(' Shell output implementation ')
};

/**
 * Set the program version to `str`.
 *
 * This method auto-registers the "-V, --version" flag
 * which will print the version number when passed.
 *
 * @param {String} str
 * @param {String} flags
 * @return {Command} for chaining
 * @api public
 */

 Command.prototype.version = function(str, flags) {
 	if (0 == arguments.length) return this._version;
 	this._version = str;
 	flags = flags || '-V, --version';
 	this.option(flags, 'output the version number');
 	this.on('version', function() {
 		process.stdout.write(str + '\n');
	//process.exit(0);
	console.info(' Shell output implementation ');
});
 	return this;
 };

/**
 * Set the description to `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

 Command.prototype.description = function(str) {
 	if (0 === arguments.length) return this._description;
 	this._description = str;
 	return this;
 };

/**
 * Set an alias for the command
 *
 * @param {String} alias
 * @return {String|Command}
 * @api public
 */

 Command.prototype.alias = function(alias) {
 	if (0 == arguments.length) return this._alias;
 	this._alias = alias;
 	return this;
 };

/**
 * Set / get the command usage `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

 Command.prototype.usage = function(str) {
 	var args = this._args.map(function(arg) {
 		return humanReadableArgName(arg);
 	});

 	var usage = '[options]'
 	+ (this.commands.length ? ' [command]' : '')
 	+ (this._args.length ? ' ' + args.join(' ') : '');

 	if (0 == arguments.length) return this._usage || usage;
 	this._usage = str;

 	return this;
 };

/**
 * Get the name of the command
 *
 * @param {String} name
 * @return {String|Command}
 * @api public
 */

 Command.prototype.name = function() {
 	return this._name;
 };

/**
 * Return the largest option length.
 *
 * @return {Number}
 * @api private
 */

 Command.prototype.largestOptionLength = function() {
 	return this.options.reduce(function(max, option) {
 		return Math.max(max, option.flags.length);
 	}, 0);
 };

/**
 * Return help for options.
 *
 * @return {String}
 * @api private
 */

 Command.prototype.optionHelp = function() {
 	var width = this.largestOptionLength();

  // Prepend the help information
  return [pad('-h, --help', width) + '  ' + 'output usage information']
  .concat(this.options.map(function(option) {
  	return pad(option.flags, width) + '  ' + option.description;
  }))
  .join('\n');
};

/**
 * Return command help documentation.
 *
 * @return {String}
 * @api private
 */

 Command.prototype.commandHelp = function() {
 	if (!this.commands.length) return '';

 	var commands = this.commands.filter(function(cmd) {
 		return !cmd._noHelp;
 	}).map(function(cmd) {
 		var args = cmd._args.map(function(arg) {
 			return humanReadableArgName(arg);
 		}).join(' ');

 		return [
 		cmd._name
 		+ (cmd._alias ? '|' + cmd._alias : '')
 		+ (cmd.options.length ? ' [options]' : '')
 		+ ' ' + args
 		, cmd.description()
 		];
 	});

 	var width = commands.reduce(function(max, command) {
 		return Math.max(max, command[0].length);
 	}, 0);

 	return [
 	''
 	, '  Commands:'
 	, ''
 	, commands.map(function(cmd) {
 		var desc = cmd[1] ? '  ' + cmd[1] : '';
 		return pad(cmd[0], width) + desc;
 	}).join('\n').replace(/^/gm, '    ')
 	, ''
 	].join('\n');
 };

/**
 * Return program help documentation.
 *
 * @return {String}
 * @api private
 */

 Command.prototype.helpInformation = function() {
 	var desc = [];
 	if (this._description) {
 		desc = [
 		'  ' + this._description
 		, ''
 		];
 	}

 	var cmdName = this._name;
 	if (this._alias) {
 		cmdName = cmdName + '|' + this._alias;
 	}
 	var usage = [
 	''
 	,'  Usage: ' + cmdName + ' ' + this.usage()
 	, ''
 	];

 	var cmds = [];
 	var commandHelp = this.commandHelp();
 	if (commandHelp) cmds = [commandHelp];

 	var options = [
 	'  Options:'
 	, ''
 	, '' + this.optionHelp().replace(/^/gm, '    ')
 	, ''
 	, ''
 	];

 	return usage
 	.concat(cmds)
 	.concat(desc)
 	.concat(options)
 	.join('\n');
 };

/**
 * Output help information for this command
 *
 * @api public
 */

 Command.prototype.outputHelp = function(cb) {
 	if (!cb) {
 		cb = function(passthru) {
 			return passthru;
 		}
 	}
 	this.emit('--help');
 	return cb(
 		this.helpInformation()
 		.replace(/ /g, '&nbsp;')
 		.replace(/\</g, '&lt;')
 		.replace(/\>/g, '&gt;')
 		);
 };

/**
 * Output help information and exit.
 *
 * @api public
 */

 Command.prototype.help = function(cb) {
 	this.outputHelp(cb);
  //process.exit();
  console.info(' Shell output implementation ');
};

/**
 * Camel-case the given `flag`
 *
 * @param {String} flag
 * @return {String}
 * @api private
 */

 function camelcase(flag) {
 	return flag.split('-').reduce(function(str, word) {
 		return str + word[0].toUpperCase() + word.slice(1);
 	});
 }

/**
 * Pad `str` to `width`.
 *
 * @param {String} str
 * @param {Number} width
 * @return {String}
 * @api private
 */

 function pad(str, width) {
 	var len = Math.max(0, width - str.length);
 	return str + Array(len + 1).join(' ');
 }

/**
 * Output help information if necessary
 *
 * @param {Command} command to output help for
 * @param {Array} array of options to search for -h or --help
 * @api private
 */

 function outputHelpIfNecessary(cmd, options) {
 	options = options || [];
 	for (var i = 0; i < options.length; i++) {
 		if (options[i] == '--help' || options[i] == '-h') {
 			var help = cmd.outputHelp();
 			window.shell.output.print(help.split(/\n/))
 		}
 	}
 }

/**
 * Takes an argument an returns its human readable equivalent for help usage.
 *
 * @param {Object} arg
 * @return {String}
 * @api private
 */

 function humanReadableArgName(arg) {
 	var nameOutput = arg.name + (arg.variadic === true ? '...' : '');

 	return arg.required
 	? '<' + nameOutput + '>'
 	: '[' + nameOutput + ']'
 }

// for versions before node v0.8 when there weren't `fs.existsSync`
function exists(file) {
	try {
		if (fs.statSync(file).isFile()) {
			return true;
		}
	} catch (e) {
		return false;
	}
}