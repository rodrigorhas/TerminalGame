$(function () {
	var Ping = new Program('Ping');
	Ping.start = function () {

		this.packageSize = 64;
		this.packCount = 0;

		this.preventWrite();

		this.startTime = new Date().getTime();
		this.receivedPacks = 0;
		this.lostPacks = 0;
		this.latencyHistory = []
		this.latency = 0;
		this.isWaitingResponse = false;

		var socket = cmd.system.getConnection();

		this.interval = setInterval(function(){

			if(!this.isWaitingResponse) {

				var upload_delay, internet = window.cmd.system.Internet, uploaded = 0;

				internet.updateRates.listen(function (rate) {
					if(uploaded + rate.download < this.packageSize) {
						uploaded += rate.download;
					}
				});

				socket.emit('ping', this.target);
				this.isWaitingResponse = true;

				this.latency = new Date().getTime();
			}

		}.bind(this), 1000);

		socket.on('pong', function (err) {
			if(!isset(err)) {
				this.packCount++;
				this.receivedPacks++;

				this.isWaitingResponse = false;

				var delay = this.getDelay();

				this.output.print(this.packageSize + ' bytes from ' + this.target + ': icmp_seq=' + this.packCount + ' ttl=' + this.packageSize + ' time=' + delay + 'ms');
			} else if(err == 404){
				this.isWaitingResponse = false;
				this.lostPacks ++;
				this.packCount++;
				this.getDelay();
				this.output.print(this.target + ' isn\'t available');
			}
		}.bind(this));
	}

	Ping.beforeFinish = function (c) {
		var socket = cmd.system.getConnection();
		clearInterval(this.interval);

		var lossPercentage = ((this.lostPacks * 100) / this.packCount).toFixed(2);
		var totalTime = new Date().getTime() - this.startTime;

		var max = 0, min = 0, avg = 0;

		max = this.latencyHistory.maxVal();
		min = this.latencyHistory.minVal();
		avg = (this.latencyHistory.sum() / this.latencyHistory.length).toFixed(2);

		this.output.print('');
		this.output.print('--- ' + this.target + ' ping statistics ---');
		this.output.print(this.packCount + ' packages transmitted, ' + this.receivedPacks + ' received, ' + lossPercentage + '% loss, time ' + totalTime + 'ms');
		this.output.print('rtt min/avg/max/ = ' + min + '/' + avg + '/' + max);
		this.output.print('');

		socket.removeListener('pong');
		this.latency = 0;

		this.allowWrite();
		
		c();
	},

	Ping.getDelay = function () {
		var now = new Date().getTime();
		this.latency = now - this.latency;
		this.latencyHistory.push(this.latency);

		return this.latency;
	}

})