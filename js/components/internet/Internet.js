function Internet () {
	this.level = 0;
	this.upload = 0;
	this.download = 0;
	this.package_max_download_speed = 0;
	this.package_max_upload_speed = 0;
	this.download_in_use = 0;
	this.upload_in_use = 0;
	this.in_use_obj = {};

	this.ip = null;

	this.stackList = {
		download: [],
		upload: []
	}

	this.updateRates = new Event();

	this.addUsage({
		name: 'cracker',
		size: 2000,
		type: 'download'
	})

	this.addUsage({
		name: 'cracker2',
		size: 1500,
		type: 'upload'
	})
}

Internet.prototype = {
	genOcilation : function () {
		var _this = this;

		function getOcilation () {

			var download_in_use = upload_in_use = 0, internet = _this.in_use_obj;

			var min_download_ocilation = _this.getPercentage(_this.package_max_download_speed, 70),
				min_upload_ocilation = _this.getPercentage(_this.package_max_upload_speed, 70),

				rates = {
					download : parseInt(Math.floor(Math.random() * (_this.package_max_download_speed - min_download_ocilation + _this.level + 1)) + min_download_ocilation - download_in_use, 10),
					upload : parseInt(Math.floor(Math.random() * (_this.package_max_upload_speed - min_upload_ocilation + _this.level + 1)) + min_upload_ocilation - upload_in_use, 10)
				}


			_this.updateRates.trigger(this);

			function caclProgress (item, type) {
				var item = item;

				if(item.progress + rates.download < item.size){
					item.progress += rates.download;
					rates[type] = 0;
				} else {
					var incomplete = item.progress - item.size;
					var socket = cmd.system.getConnection();

					socket.emit('done download', item.name);

					console.info('done ' + item.name );

					_this.stackList[type].shift();
					delete _this.in_use_obj[item.name];
				}
			}

			if(_this.stackList.download.length) {
				caclProgress(_this.stackList.download[0], 'download');
			}

			if(_this.stackList.upload.length) {
				caclProgress(_this.stackList.upload[0], 'upload');
			}

			return rates;
		}

		setInterval(function () {
			var calculatedRates = getOcilation();
			this.download = calculatedRates.download;
			this.upload = calculatedRates.upload;
			/*console.log('download rate : ' + this.download + ' KB/s');
			console.log('upload rate : ' + this.upload + ' KB/s');*/
		}.bind(this), 1000);
	},

	getPercentage : function (real, percentage) {
		return real * (percentage * 0.01);
	},

	setUsage : function (param) {
		this.download_in_use = param.download;
		this.upload_in_use = param.upload;
	},

	addUsage : function (obj) {
		if(!this.in_use_obj[obj.name]) {
			this.in_use_obj[obj.name] = {use_rate : obj.use_rate, type: obj.type};
			this.stackList[obj.type].push({name: obj.name, progress: 0, size: obj.size});
			return true;
		}
		
		console.error('The program << '+ obj.name +' >> already use the internet...');

		return false;
	},

	removeUsage : function (obj) {
		if(!this.in_use_obj[obj.name]) {
			console.error('The program << '+ obj.name +' >> isn\'t using the internet...');
			return false;
		}

		delete this.in_use_obj[obj.name];
		return true;
	},

	setIP : function (ip) {
		this.ip = ip;
	},

	getIP : function () {
		return this.ip;
	},

	setParams : function (properties) {
		this.upload = this.package_max_upload_speed = this.getPercentage(properties.download, 17.5);
		this.download = properties.download;
		this.package_max_download_speed = properties.package_max_download_speed;
		this.hasOcilation = properties.hasOcilation;
		this.ip = properties.ip || null;

		if(this.hasOcilation)
			this.genOcilation();
		else 
			console.log(this.download);
	}
}