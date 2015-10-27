<html>
	<head>
		<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1">
		<script src="http://192.168.0.58:8082/socket.io/socket.io.js"></script>
		

	</head>
	<style>
		@import url(http://fonts.googleapis.com/css?family=Ubuntu);
		body{
			font-family: 'Ubuntu', sans-serif;
			background-color: #FFCB00;
		}
		#msgList {
			width: 100%;
  			height: calc(100% - 63px);
			overflow-y: auto;
			border: 1px solid #ccc;
			background-color: #fff;
		}
		#msgList div{
			margin: 3px;
			padding: 5px;
			
		}
		.me{
			color: #666;
			/*text-align: right;*/
			background-color: #f5f5f5;
			display:inline-block;
			min-width: 50%;
			float:right;
			padding: 8px;
			box-shadow: 0px 1px 3px rgba(0,0,0,0.3);
			font-size: 12px;
		}
		.me span{
			padding: 8px;
			display: block;
			font-weight: normal;
			font-size: 13px;
		}
		.other{
			color: #fff;
			background-color: #369;
			display:inline-block;
			min-width: 50%;
			font-size: 12px;
			box-shadow: 0px 1px 3px rgba(0,0,0,0.3);
		}
		.other span{
			padding: 8px;
			display: block;
			font-weight: normal;
			font-size: 13px;
		}
		.server{
			color: #555;
			font-size: 12px;
		}
		.server span{
			font-size: 13px;
		}
		.cleared{
			clear: both;
		}
		#controls{
			margin-top: 10px;
		}
		#msg{
			width: calc(100% - 207px);
			border: 1px solid #ccc;
  			border-radius: 9px;
		}
		#msg:focus{
			box-shadow: 0px 0px 7px rgba(80,80,253,1);
		}
		#users{
			width: 120px;
			max-width: 120px;
		}
	</style>

	<body>
		<script>			     


	   function onEnter(event) {
	      if( event.keyCode==13 ) { 
	         return true;
	      }
	   }

	 var clients = [],
	 		msgs = [],
	 		myName = '';

	 

    var socket = io.connect('http://192.168.0.58:8082');
    socket.on('receiveMessage', function (data){             	
    	var msgList = document.getElementById('msgList');
    	var msg = document.createElement("div");
    	if(data.sender == myName){
    		msg.className = 'me';
    	}else if(data.sender == 'SERVER'){
    		msg.className = 'server';
    	}else{
    		msg.className = 'other'
    	}
    	msg.innerHTML = '<b>' + data.sender + '</b><br> <span>' + data.message + '</span>';    	

    	var bk = document.createElement('div');
    	bk.className = "cleared";
    	bk.appendChild(msg);
    	msgList.appendChild(bk);

    	msgList.scrollTop = msgList.scrollHeight;
    });

    socket.on('setName', function (data){             	
    	var ident = document.getElementById('ident');    	
    	myName = data;
    	ident.innerHTML = "I Am " + myName;    	    	
    });

    socket.on('getClients', function (data){         
    	clients = data;
		var select = document.getElementById('users');
		select.innerHTML = "";
		var opt = document.createElement("option");
		   opt.value= 'all';
		   opt.innerHTML = 'Everyone'; 
		   select.appendChild(opt);		   
    	
    	for(element in clients)
		{
		   if(clients[element].name != myName){
			   var opt = document.createElement("option");
			   opt.value= clients[element].id;
			   opt.innerHTML = clients[element].name;
			   select.appendChild(opt);		   	
		   }
		   
		}
    });
    socket.emit('connected', { name: 'user' + Math.floor((Math.random() * 1000) + 1) , status: 'Online', hash: 'Math.floor((Math.random() * 1000) + 1)' });        

    function sendMsg(msg){
    	
    	var select = document.getElementById('users');    
    	var msgEl = 	document.getElementById('msg');    
    	var msgList = 	document.getElementById('msgList');    
	    if(msgEl.value != null && msgEl.value != '' && msgEl.value != undefined){
	    	if(select.value == 'all'){
	    		socket.emit('sendMessage', {message: msgEl.value, receiver: select.value, sender: myName});	
	    	}else {
	    		var msg = '<i>(private)</i> ' + msgEl.value;
	    		socket.emit('sendMessage', {message: msg, receiver: select.value, sender: myName});	    		
	    	}
	    	
	    	msgEl.value = '';
	    	msgEl.focus();    		
    	}
    }
		</script>
		<div id="ident">I Am </div>
		<div id="msgList"></div>
		<div id='controls'>
			To: <select name="users" id="users"></select>
			<input type="text" name="msg" id="msg" onkeypress="if(onEnter(event)) sendMsg();">
			<input type="button" value="Send!" onClick="sendMsg();">
		</div>
	</body>
</html>