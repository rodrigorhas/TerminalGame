$(function () {
	var Hasher = new Process('Hasher');
	Hasher.start = function () {

	}

	Hasher.beforeFinish = function () {
		console.log('crack finished');
	}
});