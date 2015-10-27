function Main () {
	this.windows = {};

	this.prepareWorkspace();
}

Main.prototype = {
	prepareWorkspace : function () {
		Array.prototype.maxVal = function() {
		    return Math.max.apply( Math, this);
		}

		Array.prototype.minVal = function() {
		    return Math.min.apply( Math, this);
		}

		Array.prototype.sum = function () {
		    var total = 0, i = this.length;
		    while (i--) { total += this[i]; }
		    return total;
		}
	}
}

var Main = new Main();