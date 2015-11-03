
function Command (command) {
  this._name = null;
  this.rawCommand = command;
  this._description = null;
  this._action = null;
  this._args = [];

  this.parseExpectedArgs(command.split(/ +/g));
}

Command.prototype = {
  exec: function (args) {
    this._action.apply(this, args);
  },

  name: function (name) {
    if(arguments.length == 0) return this._name;
    this._name = name;
    return this;
  },

  description: function (desc) {
    if(arguments.length == 0) return this._description;
    this._description = desc;
    return this;
  },

  action: function (fn) {
    if(arguments.length == 0) return this._action;
    this._action = fn;
    return this;
  },

  parseExpectedArgs: function (args) {
    var self = this;

    args.forEach(function (arg, index) {
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

    console.log(this._args);
  }
}

var Shell = {
  commands: {},

  addCommand: function (cmd) {
    var name = cmd.split(' ')[0],
        command = new Command(cmd).name(name);

    this.commands[name] = command;
    return this.commands[name];
  },

  input: function (input) {
    var args = input.split(/\s+/g);
    var command = args[0];
    
    if(this.commands[command]) {
      this.commands[command].exec(args.slice(1));
    }
  }
}

Shell
  .addCommand('login <username>')
  .description('Login in your account')
  .action(function (username) {
    console.log('loggin with %s', username);
  });

var output = Shell.input('login rodrigorhas');