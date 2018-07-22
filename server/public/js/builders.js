function buildPlayer() {
	var player = new Cell();
	player.setX(0);
	player.setY(0);
	player.setColor("GREEN");
	player.radius = 15;
	player.viewBox = {width:100,height:100};
	player.gameover = false;
	player.newPosition = player.position.clone();
	player.canDraw = function(){
		return !this.gameover;
	}

	return player;
}

function buildWebSocket(){
    var wsURL = "ws://"+location.hostname+":443";
    // Let us open a web socket
    var ws = new WebSocket(wsURL);
    ws.binaryType = 'arraybuffer';

    ws.onopen = function(){};

    ws.onclose = function() {
        this.closed = true;
    };

    ws.onmessage = function(evt){
        onGameMessage(evt);
    }
    
    return ws;
}

function buildClientEngine(player,canvas) {    
    var clientEngine = new game.BaseEngine;
    var separation = 16;
    var zoom =1;
    
    clientEngine.canvas;
    clientEngine.ctx;
    clientEngine.x = 0;
    clientEngine.y = 0;
    clientEngine.componentsEnable.collision = clientEngine.componentsEnable.autoIncrement = false;	

    clientEngine.setCanvas = function(canvas){
        this.canvas = canvas;
        this.ctx =  canvas.getContext('2d');
    }

    clientEngine.getCurrentSize = function(){
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    
        return {width:x,height:y};
    }
    
    clientEngine.setCurrentSize = function(){
        var size = clientEngine.getCurrentSize();
               clientEngine.setCanvasSize(size.width,size.height);
    }
    

    clientEngine.setScreenSize = function(width,height){
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.setCanvasSize(width,height);
    }

    clientEngine.setCanvasSize = function(width,height){
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clientEngine.beforeDraw = function(ctx){
        var size = clientEngine.getCurrentSize();
        var scalefinal = {x:1,y:1};
        if( size.width!=0 && size.height!=0 && player.viewBox!=undefined){
            scalefinal.x = size.width/player.viewBox.width;
            scalefinal.y = size.height/player.viewBox.height;
        }

        zoom = Math.lerp(zoom,Math.max(scalefinal.x,scalefinal.y),0.1);
        ctx.fillStyle = "WHITE";	
        ctx.fillRect(0,0,size.width,size.height);


        ctx.scale(zoom,zoom);
        player.position.set(Vector.lerp(player.position,player.newPosition,1));
        this.setCenter(player.position.x,player.position.y,zoom);

        
        ctx.strokeStyle = "rgb(200,200,200)";
        ctx.lineWidth = 0.5;
    
        var subseparation = separation;
        var deltax = clientEngine.x%subseparation;
        for(var i=0;i<player.viewBox.width;i+=subseparation){
            ctx.beginPath();
            ctx.moveTo(i+(deltax),0);
            ctx.lineTo(i+(deltax),player.viewBox.height);
            ctx.stroke();
        }

        var deltay = clientEngine.y%subseparation;
        for(var j=0;j<player.viewBox.height;j+=subseparation){
            ctx.beginPath();
            ctx.moveTo(0,j+(deltay));
            ctx.lineTo(player.viewBox.width,j+(deltay));
            ctx.stroke();
        }
    }

    clientEngine.afterDraw = function(ctx){}
    clientEngine.draw = function(){
        var _this = this;

        this.ctx.save();
        this.beforeDraw(this.ctx);
        this.ctx.translate(this.x,this.y);
        this.entityList.forEach(function(item){
            if(item.enable)
                item.draw(_this.ctx);
        });

        this.afterDraw(this.ctx);
        this.ctx.translate(-this.x,-this.y);
        this.ctx.restore();

        if(this.screenDraw){
            this.screenDraw(this.ctx);
        }
    }

    clientEngine.setCenter = function(x,y,scale){
        this.x = ( (this.canvas.width/2) 
            * (1/(scale!=undefined?scale:1)))-x;
        this.y = ( (this.canvas.height/2) 
            * (1/(scale!=undefined?scale:1)))-y;		
    }

    clientEngine.screenDraw = function(ctx){
        var size =  clientEngine.getCurrentSize();

        if(ws.closed){
            var closeText = "Connection lose";
            ctx.font="60px Arial";
            ctx.fillStyle = "BLACK";
            ctx.textAlign="center";
            ctx.fillText(closeText,size.width/2 ,size.height/2);
        }

        if(player.gameover){
            var text_gameOver = "Game Over(click for replay)";
            ctx.font="60px Arial";
            ctx.fillStyle = "BLACK";
            ctx.textAlign="center";
            ctx.fillText(text_gameOver,size.width/2 ,size.height/2);
        }

        //Draw Score
        ctx.font="30px Arial";
        ctx.fillStyle = "BLACK";
        ctx.textAlign="start";
        ctx.textBaseline = 'top';
        ctx.fillText("Score : "+(player.radius-15),0,0);

    }

    clientEngine.init = function(){
        clientEngine.addEntity(player);
        clientEngine.setCurrentSize();

        window.onresize = function(event) {
            clientEngine.setCurrentSize();
        };
    
        canvas.addEventListener("mousedown", function(event){
            onGameMouseDown({x:event.x,y:event.y});
        });
    
        document.addEventListener("keydown", function(eventt){
            onGameKeyPress({keyCode:eventt.keyCode});
        });
    
        canvas.addEventListener("mouseup", function(evento){
            onGameMouseUp()
        });
    }

    clientEngine.beforeUpdate = function(){};
    clientEngine.setCanvas(canvas);

    return clientEngine;
}