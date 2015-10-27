function Output (shell) {
	this.shell = shell;
	this.path = 'rodrigorhas@root ~/ $';	
}

Output.prototype = {
	print: function (command, printPath) {
		var line = $('<div class="outputRow"><span class="command"></span></div>');
		var c = line.children('.command');

		if(printPath) {
			var pc = this.shell._dom.find('.inputRow .path').clone();
			line.prepend(pc);
		} else {
			c.addClass('sys_out');
		}

		c.append(command);

		this.shell._dom.find('.output').append(line);
		this.scrollToBottom();
	},

	success: function (command) {
		var line = $('<div class="outputRow"><span class="command"></span></div>');
		var c = line.children('.command');
		c.addClass('sys_out success');
		c.append(command);

		this.shell._dom.find('.output').append(line);
		this.scrollToBottom();
	},

	warn: function (command) {
		var line = $('<div class="outputRow"><span class="command"></span></div>');
		var c = line.children('.command');
		c.addClass('sys_out warn');
		c.append(command);

		this.shell._dom.find('.output').append(line);
		this.scrollToBottom();
	},

	printAutoComplete : function (array, command) {
		this.print(command, true);

		var line = $('<div class="outputRow"><div class="list"></div></div>');
		var li = $('<span class="list-item">'+ name +'</span>');

		var lis = [];
		for (var i = 0; i < array.length; i++) {
			lis.push('<span class="list-item">'+ array[i] +'</span>');
		};

		line.children('.list').append(lis.join(''));

		this.shell._dom.find('.output').append(line);
		this.scrollToBottom();
	},

	error: function (message) {
		var line = $('<div class="outputRow"><span class="error"></span></div>');

		var e = line.children('.error');
		e.append(message);

		this.shell._dom.find('.output').append(line);
		this.scrollToBottom();
	},

	clear: function () {
		this.shell._dom.find('.output').text('');
	},

	list: function (list, all) {
		if(!isset(list)) return console.error('missing list')
		var line = $('<div class="outputRow"><div class="list"></div></div>');

		var items = list.children;
		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			if(item.perms.visible == true || all) {
				var name;
				if(item.hasOwnProperty('name') && item.hasOwnProperty('extension')) {
					name = this.shell.disk.buildName(item);
				} else {
					name = item.name;
				}

				var li = $('<span class="list-item">'+ name +'</span>');

				if(item.hasOwnProperty('extension')){
					if(item.extension == 'txt') {
						li.addClass('normal');
					} else  if (item.extension == 'bin') {
						li.addClass('program')
					}
				} else {
					if(item.hasOwnProperty('children')){
						li.addClass('folder');
					}
				}

				line.children('.list').append(li);
			}
		};

		this.shell._dom.find('.output').append(line);
		this.scrollToBottom();
	},

	setPath: function (path) {
		this.path = path;
	},

	scrollToBottom : function (argument) {
		var c = this.shell._content;
		c.scrollTop(c[0].scrollHeight);
	}
}