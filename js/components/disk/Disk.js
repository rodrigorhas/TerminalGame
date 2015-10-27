function Disk () {
	this.size = 0;
	this.maxSize = 0;

	this.writable = true;
	this.readable = true;

	this.expansion = [150000, 500000, 2000000, 5000000, 10000000];
}

Disk.prototype.create = function (options) {
	this.name = options.name;

	this.storage = [];

	this.path = {
		current : this.storage[0],
		last : [],
		name: '/'
	};

	this.size = options.size;
	this.maxSize = this.expansion[options.expansion];

	return this;
}

Disk.prototype.getList = function () {
	var path = this.path.current;
	return path;
}

Disk.prototype.open = function (pathName) {
	if(pathName == '..' ) {
		var oldFolder = this.path.current;
		this.path.current = this.path.last[this.path.last.length-1];
		this.path.last.pop();

		var a = this.path.name;
		var r = a.replace(new RegExp('(' + oldFolder.name + '\/+$)'), '');

		return {updatepath: true, path: r}
	} else {

		var path = this.path.current;
		var res;

		for (var i = 0; i < path.children.length; i++) {
			if (this.buildName(path.children[i]) == pathName) {

				if(path.children[i].hasOwnProperty('children') == false) {
					res = pathName + ': it\'s not a folder';
					break;
				} else {
					this.path.last.push(this.path.current);
					this.path.current = path.children[i];
					this.path.name += this.buildName(this.path.current) + '/';
					res = {updatepath: true};
				}

			}
		};

		if(res) return res;
	}
}

Disk.prototype.buildName = function (object) {
	if(object.hasOwnProperty('extension'))
		return object.name + '.' + object.extension;
	else 
		return object.name;
}

Disk.prototype.setStorage = function (s) {
	this.storage = s;
	this.path.current = this.storage[0];
}

Disk.prototype.mkdir = function (name) {
	this.path.current.children.push(new Folder({
		name: name
	}))
}

Disk.prototype.getStorage = function () {
	return this.storage
}