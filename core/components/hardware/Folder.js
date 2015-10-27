function Folder (options) {
	if(!options.name) {
		throw new Error('Missing folder name')
	} else  {
		this.name = options.name
	}

	if(options.type && options.type == 'parent'){
		this.name = '..';
		var node = options.node;
		this.realName = node.name;
		this.realPerms = node.perms;
		this.perms = {
			writable: false,
			readable: true,
			visible : false
		}
		this.children = node.children;
	} else {

		if(!options.perms){
			this.perms = {
				writable : true,
				readable : true,
				visible  : true
			}
		} else {
			this.perms = options.perms;
		}

		if(!options.children) {
			this.children = [];
		}

	}
}