function AutoComplete (disk) {
	this.lastWord = null;
	this.currWordMatches = [];
	this.cwmPos = -1;
	this.disk = disk;

}

AutoComplete.prototype = {

	check : function (element) {

		var word = this.getCaretWord();
		if(word.length < 1) return;
		if(this.lastWord != word){
			this.currWordMatches = []; // cleaning the old matches, if have
			this.lastWord = word;

			var wl = word.length;

			for (var i = 0; i < this.disk.path.current.children.length; i++) {
				if(this.disk.buildName(this.disk.path.current.children[i]).substr(0, wl) == word.substr(0, wl)){
					this.currWordMatches.push(this.disk.buildName(this.disk.path.current.children[i]));
				}
			}

			var matches = this.currWordMatches;
			if(matches.length){
				if(matches.length > 1) {
					return matches // matches arrays
				}
				else {
					return this.insertTextAtCarret(element, matches[0], wl)
				}
			}
		} else {
			var matches = this.currWordMatches;
			if(matches.length){
				if(matches.length > 1) {
					return matches // matches arrays
				}
				else {
					var wl = matches[0].length;
					return this.insertTextAtCarret(element, matches[0], wl)
				}
			}
		}
	},

	insertTextAtCarret : function (element, text, pos) {
		text = text.substr(pos);
	    var caretPos = element[0].selectionStart; // shell input
    	var inputTxt = element.text();
    	element.text(inputTxt.substring(0, caretPos) + text);
		this.sendToEnd(element[0])
	},

	getCaretWord : function () {
	    var range = window.getSelection().getRangeAt(0);
	    if (range.collapsed) {
	        text = range.startContainer.textContent.substring(0, range.startOffset+1);
	        return text.split(/\b/g).pop();
	    }
	    return false;
	},

	sendToEnd: function (contentEditableElement) {
	    var range,selection;
	    if(document.createRange) {//Firefox, Chrome, Opera, Safari, IE 9+
	        range = document.createRange();//Create a range (a range is a like the selection but invisible)
	        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
	        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
	        selection = window.getSelection();//get the selection object (allows you to change selection)
	        selection.removeAllRanges();//remove any selections already made
	        selection.addRange(range);//make the range you have just created the visible selection
	    }

	    else if(document.selection) {//IE 8 and lower
	        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
	        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
	        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
	        range.select();//Select the range (make it the visible selection
	    }
	}
}