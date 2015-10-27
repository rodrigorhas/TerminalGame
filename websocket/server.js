var express = require("express"),
app = express()
port = 8081,
request = require('request'),
AuthKey = 'kZfe0QItY9okg25SGF9EMRqi9MI0JpRwpSBAqtYH9VSPA1AYDk6ZjmjJlt8jiDVL',
PROGRAM = {};

var usernames = {};
var connectedIps = {};
var rooms = ['Lobby'];

Object.prototype.renameKey = function (keyName, newName) {
    
    var prop = this[keyName];

    if(prop) {
        var oldKeyValue = prop;
        delete this[keyName];
        this[newName] = oldKeyValue;
    }
}

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

	if ('OPTIONS' == req.method) {
		res.send(200);
	} else {
		next();
	}
};

app.use(allowCrossDomain);

app.get("/", function(req, res, next){});

var io = require('socket.io').listen(app.listen(port), {log: false});

if(io) {
    request.post({url:'http://localhost/cmd/websocket/data/request.php', form: {authkey: AuthKey, mode:'getProgramDefs'}}, function(err,data,body) {
        PROGRAM = JSON.parse(body);
    });
}

io.sockets.on('connection', function (socket) {

    console.log('client connected:'+ socket.id);

	socket.on('requestData', function(username, password) {
        socket.username = username;
        usernames[username] = username;
        //socket.emit('updateCommentList', 'SERVER', 'you have connected to Lobby');
        //socket.broadcast.to('Lobby').emit('updateCommentList', 'SERVER', username + ' has connected to this room');

        request.post({url:'http://localhost/cmd/websocket/data/request.php', form: {authkey: AuthKey, mode:'get',u: socket.username, p : password}}, function(err,data,body) {
            if (data && body && body != 404) {
                var SERVER_RESPONSE = JSON.parse(body);
                var ip = SERVER_RESPONSE.internet.ip_ref;
                socket.ip = ip;
                socket.join(ip);
                socket.room = ip;
                connectedIps[ip] = {ip: ip, username: username , password: password, _id : socket.id};

                var user_processes = SERVER_RESPONSE.processes;
                var user_hardwares = SERVER_RESPONSE.hardwares;

                for (var i = 0; i < user_hardwares.length; i++) {
                    var hw = user_hardwares[i];

                    if(hw.USE_BASE) {
                        hw.config.max_usage = hw.HBF * hw.HMBF * hw.upgrade_level;
                        
                        // DELETE SOME CALC BASES VARS
                        delete hw.USE_BASE;
                        delete hw.HBF;
                        delete hw.HMBF;
                    }
                };

                for (var i = 0; i < user_processes.length; i++) {
                    var pgm = user_processes[i];
                    var def = PROGRAM[pgm.name];

                    if(def) {

                        function calcMemoryUsage (pgm_level) {
                            return pgm_level * def.MUBF * def.MUMBF;
                        }

                        var mmu = calcMemoryUsage(def.MAX_LEVEL);
                        var cmu = calcMemoryUsage(pgm.level);

                        if( cmu > mmu ) {
                            user_processes[i].memory_usage = mmu;
                        } else {
                            user_processes[i].memory_usage = cmu;
                        }
                    }
                };

                var internet = SERVER_RESPONSE.internet;
                var max_bandwith = 1024 * internet.package_level / 8;

                internet.package_max_download_speed = internet.download = max_bandwith;
                if(internet.package_level < 100) {
                    internet.hasOcilation = true;
                } else {
                    internet.hasOcilation = false;
                }

                delete internet.id;
                delete internet.package_level;
                internet.renameKey('ip_ref', 'ip');

                socket.emit('data', JSON.stringify(SERVER_RESPONSE), err);

            } else {

                socket.emit('data');
            }
        })
    });

    socket.on('done download', function(name) {
        console.log('download finished => ' + name);
    })

    socket.on('crackerRequest', function(sender) {
        console.log('request from ip: ' + socket.ip + ' - to: ' + sender.target);
        console.log('target SOCKET_ID: ' + connectedIps[sender.target]);
        console.log('All connectedIps: ' + connectedIps);

        if(connectedIps[sender.target] != undefined) {
            var id = connectedIps[sender.target]._id;
            var data = {
                origin: socket.ip,
                sender: sender
            };

            io.sockets["in"](id).emit('crackerRequest', data);

            console.log('request data : ' + data);
        } else {
            socket.emit('crackerResponse', 404);
        }
    });

    socket.on('crackerResponse', function (data) {
        console.log('response');
        var origin = connectedIps[data.origin];
        var target = connectedIps[data.sender.target];

        if(origin != undefined) {
            console.log(data);
            if(data.sender.programLevel >= data.receiver.programLevel) {
                var targetAuthTokens = {
                    username: target.username,
                    password: target.password
                }
                
                io.sockets['in'](origin.ip).emit('crackerResponse', targetAuthTokens);
            } else {
                console.log('cant send pass, lower program level');
                io.sockets['in'](origin.ip).emit('crackerResponse', null);
            }
        }
    });

    socket.on('create', function(room) {
        rooms.push(room);
        socket.emit('updaterooms', rooms, socket.room);
    });

    socket.on('ping', function(ip) {
        if(connectedIps[ip] != undefined) {
            console.log('ping from ' + socket.ip + ' to ' + connectedIps[ip].ip);
            
            setTimeout(function () {
                socket.emit('pong');
            }, 2000);

        } else {
            socket.emit('pong', 404);
        }
    });

    socket.on('saveData', function(data) {
        request.post({url:'http://localhost/cmd/websocket/data/request.php', form: {authkey: AuthKey, mode:'save', d: data, u: socket.username}}, function(err,data,body) {
            console.log(err, body);
        });
    });

    socket.on('sendComment', function(data) {
        console.log('comment sended to room :' + socket.room);
        io.sockets["in"](socket.room).emit('updateCommentList', socket.username, data);
        
        var url = 'http://localhost/kommit/data/insert.php?r=' + socket.room + '&sender=' + socket.username + '&data=' + JSON.stringify(data);
        request(url, function (error, data, body) {            
            if (data) {
                console.log('successfully saved');
            }
        });
    });

    socket.on('switchRoom', function(newroom) {
        var oldroom;
        oldroom = socket.room;
        socket.leave(socket.room);
        socket.join(newroom);
        //socket.emit('updateCommentList', 'SERVER', 'you have connected to ' + newroom);
        //socket.broadcast.to(oldroom).emit('updateCommentList', 'SERVER', socket.username + ' has left this room');
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('roomchanged', socket.username + ' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });

     socket.on('logout', function() {
        delete usernames[socket.username];
        delete connectedIps[socket.ip];
        socket.leave(socket.room);
    });

    socket.on('disconnect', function() {
        delete usernames[socket.username];
        delete connectedIps[socket.ip];
        //io.sockets.emit('updateusers', usernames);
        //socket.broadcast.emit('updateCommentList', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });

});

console.log("Listening on port " + port);