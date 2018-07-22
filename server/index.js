var express = require('express');
var app = express();
const path = require('path');
var http = require('http').Server(app);

var WebSocketServer = require('ws').Server;
var serverEngine = require('../core/game-logic/agarEngine.js');
var package = require('../core/package.js');

// Server Utils
var Server = {
	config:{
		wsPort:443
	}
};

// Configurate express
var server_port = process.env.PORT || 3000;
var server_ip_address = process.env.IP_ADDRESS || '127.0.0.1';
app.set('port',server_port);  
app.set('ipaddr', server_ip_address);
app.use(express.static(path.join(__dirname,'public')));

app.use('/js/extendMath.js',express.static(path.join(__dirname, '../core/game-engine/extendMath.js')));
app.use('/js/vector.js',express.static(path.join(__dirname, '../core/game-engine/vector.js')));
app.use('/js/color.js',express.static(path.join(__dirname, '../core/game-engine/color.js')));
app.use('/js/package.js',express.static(path.join(__dirname, '../core/package.js')));
app.use('/js/engine.js',express.static(path.join(__dirname, '../core/game-engine/engine.js')));

// web socket server
wss = new WebSocketServer({port:Server.config.wsPort});

wss.on('connection',function(ws){
	ws.trySend = function(package,catchFunction){
		try{
			ws.send(package);
		}catch(ex){
			if(catchFunction)
				catchFunction(ex);
		}
	};

	//Create new user in the server
	var currentPlayer = serverEngine.addUserCell();
	currentPlayer.send = ws.trySend;
	currentPlayer.addPackage(package.player(currentPlayer));

	console.log("new user connected : "+currentPlayer.id);
	
	ws.on('message',function(data){
		var received = package.receive(package.toArrayBuffer(data));
		switch(received.id){
			case package.types.DIRECTION:
  				currentPlayer.direction.setDirectionNormalize(received.direction);
				break;
			case package.types.RESET:
				serverEngine.resetUser(currentPlayer);
				currentPlayer.addPackage(package.player(currentPlayer));
				break;
			case package.types.REQUESTCOLOR:
				var entity = serverEngine.findEntityById(received.entityId);
				if(entity!=undefined){
					ws.trySend(package.color(received.entityId,entity.color));
				}
				break;	
		}
	});
  	
  	ws.on('close', function () {
	  	console.log('user disconnect : '+currentPlayer.id);
  		currentPlayer.destroy();
	});
});

http.listen(server_port,server_ip_address, function(){
  console.log('listening '+server_port+' on *: '+server_ip_address);
  
	// start server game loop
	serverEngine.start();
});