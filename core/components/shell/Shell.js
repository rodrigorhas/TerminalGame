
goog.provide('Computer.System.Programs');

Computer.System.Programs.Shell = function (options){

	this.id = fn.Hash();

	this.commands = {};

	this.height = 440;
	this.width = 645;

	this._history = [];
	this.currHistPos = -1;

	this._autoComplete = new AutoComplete(Computer.System.disk);

	this.output = new Output(this);

	this.currentProgram = null;
	this.theme = Computer.System.shellTheme;

	for (var property in options) {
		this[property] = options[property];
	}

	this._dom = $('\
		<div class="Shell '+this.theme+'-theme window focused" tabindex="1">\
			<div class="inside-shadow">\
				<div class="handler"></div>\
				<div class="content">\
					<div class="output"></div>\
					<div class="inputRow">\
						<span class="path">guest@localhost ~'+Computer.System.disk.path.name+' $</span>\
						<div contenteditable="true" spellcheck="false" class="input" tabindex="2"></div>\
					</div>\
				</div>\
			</div>\
		</div>\
	');

	this._dom.attr('id', this.id);
	// set input dom
	this._output = this._dom.find('.output');
	this._input = this._dom.find('.inputRow .input');
	this._path = this._dom.find('.inputRow .path');
	this._content = this._dom.find('.content');

	this.prepareAll();
}

Computer.System.Programs.Shell.prototype = {

	runningCommand: null,

	_ShellCommand:function  (command) {
		this.children = {};
		this.command = command;
	},

	construct: function (object, namespace, createLevelCallback) {
		namespace = namespace.split('.');
		var current;

		var createLevel = function (name, level) {
			createLevelCallback(name, level);
			current = level[name];
		}

		namespace.forEach(function (name) {
			if(current) {
				if(current[name]) current = current[name];
				else createLevel(name, current);
			}

			else if(object[name]) current = object[name];
			else createLevel(name, object);
		});
	},

	addCommand: function (name, command) {

		var self = this;

		command.setShell(this);

		if(name.split('.')) {
			this.construct(this.commands, name, function (name, level) {
				var object;

				if(level.children) object = level.children;
				else object = level;

				object[name] = new self._ShellCommand(command);
			});
		}

		else {
			this.commands[name] = new self._ShellCommand(command);
		}
	},

	input: function ( string ) {
		if(this.runningCommand)
			this.runningCommand = null;

		this.output.print(string, true);

		var words = string.split(/\s+/g);
		var command = words[0];
		if(!this.commands[command]) console.error('command not found -> ' + command);
		this.commands[command].command.parse(words.slice(1));

		this.clearInput();
	},

	close: function () {
		this._dom.remove();
	},

	center: function (){
		var th = this.height;
		var tw = this.width;
		this._dom.css('height',th)
		this._dom.css('width',tw);

		var ww = $(window).width();
		var wh = $(window).height();

		var l = (ww/2) - (tw/2);
		var t = (wh/2) - (th/2);

		this._dom.css({
			top: t,
			left: l
		})
	},

	moveToFirst: function (){
		var max = 0;

		$('.window').each(function() {
			var z = parseInt( $( this ).css( "z-index" ), 10 );
			$(this).addClass('unfocused').removeClass('focused');
			max = Math.max( max, z );
		});
			
		this._dom.css("z-index", max + 2 );
		this._dom.removeClass('unfocused').addClass('focused');
	},

	prepareAll: function (){
		var __this = this;
		this.renderTo = '.content'
		var c = [0,0,0,0];

		// move to first
		this.moveToFirst(this._dom);

		// disable handler selection
		var bgs = '.handler .btn-group',
		bgo = this._dom.find(bgs);
		bgo.disableSelection();

		// bug fix
		setTimeout(function () {
			var wh = $(window).height();
			var ww = $(window).width()

			__this._dom.draggable({
				containment: [0,0, ww - __this._dom.width(), wh - __this._dom.find('.handler').height()]
			})
		},1);

		// draggable
		this._dom.draggable({
			handle: this._dom.find('.handler'),
			stack: '.window',
			containment: c,
			cancel: bgs,

			start: function (e, ui) {
				if(ui.helper.hasClass('fs')) {
					$(window).trigger('mouseup');
					this._dom.draggable( 'disable' );
					return
				}

				ui.helper.css('opacity', 0.75);
			},

			stop: function (e, ui){
				ui.helper.css('opacity', 1);
				if(ui.helper.hasClass('fs')) this._dom.draggable( 'enable' );
				__this.moveToFirst(this._dom);
			}

		}).css('position', 'absolute');

		// resizible
		this._dom.resizable({
			minHeight: 38,
			minWidth: 300,
			handles: 'e, s, w, se, sw'
		});

		this._dom.on('click',  function (e, target) {
			__this.moveToFirst();
		});

		this._dom.find('.handler').append('<div class="btn-group"></div>');  // add the btn-group for else case

		var closeBtn = this._dom.find(bgs).append('<span class="icon icon-close"><svg viewBox="0 0 24 24"><path fill="#000000" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg></span>');
		closeBtn.on('click', function (){
			__this.close();
		});

		if(this.toolbarButtons) {

			if(this.toolbarButtons.minimize){
				this._dom.find(bgs).prepend('<span class="icon icon-minus"><svg viewBox="0 0 24 24"><path fill="#000000" d="M19,13H5V11H19V13Z" /></svg></span>');
				this._dom.find(bgs + ' .icon-minus').on('click', function (e){
					__this.minimize();
				});
			}

			if(this.toolbarButtons.fullscreen){
				this._dom.find(bgs).prepend('<span class="icon icon-full"><svg viewBox="0 0 24 24"><path fill="#000000" d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" /></svg></span>');
				this._dom.find(bgs + ' .icon-full').on('click', function (e){
					__this.toggleFs();
				});
			}
		}

		if(this.title) {
			this._dom.find('.handler').prepend('<span class="title">' + this.title +'</span>');
		}

		this._dom.appendTo('body'); // js hack to make an static class Window
		this.center();

		this._dom.on('click', function () {
			this.focusInput();
		}.bind(this));

		this._dom.on('keydown', function (e) {
			this.processInput(e);
		}.bind(this))

		this.focusInput();
	},

	setDefaults: function (dom) {
		this.defaults.top = dom.css('top');
		this.defaults.left = dom.css('left');
		this.defaults.width = dom.css('width');
		this.defaults.height = dom.css('height');
	},

	toggleFs: function () {
		var dom = $(this.html);

		if(!dom.hasClass('fs')) {
			dom.addClass('fs');

			this.setDefaults(dom);

			dom.animate({
				width: '100%',
				height: '100%',
				top: 0,
				left: 0
			}, 300);
		} else {

			dom.css({
				left: 'auto',
				top: 'auto',
				position: 'absolute'

			})

			
			dom.animate({
				width: this.defaults.width,
				height: this.defaults.height,
				top: this.defaults.top,
				left: this.defaults.left
			}, 300,	function () {
					dom.removeClass('fs');
				}
			);
		}
	},

	minimize: function () {
		var dom = this.html;

		this.setDefaults(dom);

		var html = X.shortTb.return(this.id).html;
		var off = html.offset();
		var hh = html.height();
		var hw = html.width;

		dom.animate({
			height: hh,
			width: hw,
			left: off.left,
			top: off.top,
			opacity: 0
		}, 200, function () {
			dom.addClass('minimized');
		});

	},

	restore: function () {
		var dom = this.html;

		var def = this.defaults;

		dom.removeClass('minimized');

		dom.animate({
			height: def.height,
			width: def.width,
			left: def.left,
			top: def.top,
			opacity: 1
		}, 250);

	},

	getInput: function () {
		return this._input.text();
	},

	clearInput: function () {
		this._input.text('');
	},

	processInput: function (e) {
		
		if(this.currentProgram != null) {
			this.currentProgram.processInput(e);
			return;
		}

		var key = e.which || e.keyCode;
		switch (key) {

			// ENTER
			case 13:
				e.preventDefault();
				var cm = this._input.text();
				console.log(cm);
				if(cm.length) this.input(cm);
				break;

			// KEY UP
			case 38:
				this.historyUp();
				break;

			// KEY DOWN
			case 40:
				this.historyDown();
				break;

			// TAB
			case 9:
				e.preventDefault();
				var cm = this._input.text();
				var ac = this._autoComplete.check(this._input);
				// se tiver outros matches
				if(ac) {
					this.output.printAutoComplete(ac, cm); // print all matches , if have, without the path
				}
				break;
		}
	},

	/*enterCommand: function (command) {
		this.currHistPos = 0;
		this.hus = false;
		this.clearInput();
		this.saveCommand(command);
		this.output.print(command, true);

		var c = command.split(' ');
		
		switch (c[0]) {
			case 'clear':
				this.output.clear();
				break;

			case 'print':
				this.output.print(c[1], false);
				break;

			case 'login':
				if(c[1]) {
					var program = window.cmd.system.programs.login.init({
						shell: this,
						system: window.cmd.system,
						disk: window.cmd.system.disk,
						username: c[1]
					});
					this.currentProgram = program;
				} else {
					this.output.error('Missing login');
				}
				break;

			case 'signup':
				if(c[1]) {

				}

				break;

			case 'ls':
				var list = Computer.System.disk.getList();
				console.log(list);
				if(c[1] && c[1] == '-a') {
					this.output.list(list, true);
				} else {
					this.output.list(list);
				}
				break;

			case 'cracker':
				var patt = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/ig;
				if(c[1]) {
					if(patt.test(c[1])) {
						var cracker_process = this.useRunningProcess('cracker');
						if(cracker_process) {
							// c[1] -> target ip
							cracker_process.setShell(this);
							cracker_process.crack(c[1]);
						}
					} else {
						this.output.error('This ip isn\'t valid ' + c[1]);
					}
				} else {
					this.output.error('You have to specify the IP to crack');
				}
				break;

			case 'saveAll':
				if(window.cmd.system.logged) {
					var ds = JSON.stringify(window.cmd.system.disk.storage);
					var socket = window.cmd.system.getConnection();
					socket.emit('saveData', ds);
				} else {
					this.output.error('You\'re not logged, please log in')
				}
				break;

			case 'updateAll':
				break;

			case 'mkdir':
				var name;

				command.replace(/\"(\w.+)\"|\'(\w.+)\'/i, function (matches) {
					if(arguments[0]) {
						name = arguments[0].substr(1, arguments[0].length-2);
					}
				});

				var namePattern = /[^\\\/\*\&\¨\%\$\#\@\!\'\"\|\¬\§\?]/ig;

				if(!isset(name)) {
					if(c[1] && namePattern.test(c[1])) {
						window.cmd.system.disk.mkdir(c[1]);
					}
				} else {
					if(namePattern.test(name)) {
						window.cmd.system.disk.mkdir(name)
					}
				}

				break;

			case 'cd':
				if(c[1]){
					var result = window.cmd.system.disk.open(c[1]);
					if(result && typeof result.toString().indexOf('Object') != -1) {
						if(result.path) {
							this.updatePath(result.path);
						} else {
							this.updatePath();
						}
					} else if(result){
						this.output.error(result)
					}
				} else  {
					this.output.error('Missing path name');
				}
				break;

			case 'theme':
				if(c[1] == "black") {
					this._dom.removeClass('white-theme');
					this._dom.addClass('black-theme');
					localStorage.setItem('cmd-c-t', 'black');
				} else if (c[1] == 'white') {
					this._dom.removeClass('black-theme');
					this._dom.addClass('white-theme');
					localStorage.setItem('cmd-c-t', 'white');
				} else {
					this.output.error('Theme not found');
				}
				break;

			case 'logout':
				if(window.cmd.system.logged == true) {
					window.cmd.system.unsetConnection(function () {
						window.cmd.system.disk.setStorage([]);
						window.cmd.system.firstLoginCall = 0;
						window.cmd.system.stopAllProcesses();
						this.output.warn('You left :(');
						this.updatePathUser('guest');
					}.bind(this));
				} else {
					this.output.error('You aren\'t logged in');
				}
				break;

			case 'ping':
				if(c[1]) {
					var patt = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/ig;

					if (patt.test(c[1]) && c[1] != '000.000.000.000' && c[1] != '127.0.0.1' && c[1] != '10.0.0.1') {
						this.startShellProgram({
							name: 'ping',
							shell: this,
							target: c[1],
							inputCommand: command
						})

					} else {
						this.output.error('You typed a non valid IP');
					}
				} else {
					this.output.error('You have to specify the IP');
				}
				break;

			case 'ifconfig':
				this.output.print('Your ip is : ' + window.cmd.system.Internet.ip);
				break;

			case 'terminal':
				window.cmd.system.createTerminal();
				break;

			default:
				this.output.error('Command not found: ' + command);
		}

	},*/

	saveCommand: function (command) {
		this._history.unshift(command);
	},

	focusInput: function () {
		var _this = this;
	    this._input.focus();
	},

	historyUp: function () {
		if(this._input.length && !this.hus) {
			this.hus = true;
			this.saveCommand(this._input.text());
			this.focusInput();
		}

		if(this._history[this.currHistPos + 1]){
			var pos = ++this.currHistPos;
			var cm = this._history[pos];
			if(cm) {
				this._input.text(cm);
				this.focusInput();
			}
		}
	},

	historyDown: function () {
		if(this._history[this.currHistPos + -1]){
			var pos = --this.currHistPos;
			var cm = this._history[pos];
			if(cm) {
				this._input.text(cm);
				this.focusInput();
			}
		}
	},

	updatePath: function (back) {
		var pattern = /(\~\/[^ \$](.*?\/)+)|(~\/.*?)/gi;
		var up = window.cmd.system.disk.path.name;
		var pt = this._path.text();
		if (back) up = back;
		var res = pt.replace(pattern, '~' + up);
		this.output.setPath(res);
		this._path.text(res);
	},

	updatePathUser: function (user) {
		var pattern = /^(.*?)@+/;
		var pt = this._path.text();
		var res = pt.replace(pattern, user + '@');
		this.output.setPath(res);
		this._path.text(res);
	},

	hidePath: function () {
		this._path.hide();
	},

	showPath: function () {
		this._path.show();
	},

	startShellProgram: function (options) {
		if(window.cmd.system.programs[options.name]) {

			var name = options.name;
			delete options.name;

			var program = window.cmd.system.programs[name].init(options);
			this.currentProgram = program;
		}
	},

	useRunningProcess: function (name) {
		var program = window.cmd.system.getProgram(name);
		return program;
	},

	clonePath: function () {
		return this._path.clone();
	}
}