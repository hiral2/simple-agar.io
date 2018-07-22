function onGameMouseDown(event){
    var size = clientEngine.getCurrentSize();
    var x = (size.width)/2 - event.x;
    var y = (size.height)/2 - event.y;
    player.direction.x = -x;
    player.direction.y = -y;
    player.direction.normalize();
    ws.send(package.direction(player.direction.getDirection()));
}

function onGameKeyPress(event) {
    switch(event.keyCode) {
        //left
        case 65:
        case 37:
            player.direction.x = -1;
            player.direction.y = 0;
            break;
        //Rigt
        case 68:
        case 39:
            player.direction.x = 1;
            player.direction.y = 0;
            break;
        //Up
        case 87:
        case 38:
            player.direction.x = 0;
            player.direction.y = -1;
            break;
        //Down
        case 83:
        case 40:
            player.direction.x = 0;
            player.direction.y = 1;
            break;
            
    }
    player.direction.normalize();
    ws.send(package.direction(player.direction.getDirection()));
}

function onGameMouseUp() {
    if(player.gameover){
        ws.send(package.reset());
        player.gameover = false;
    }
}

function onGameMessage(evt) {
    var data = evt.data;
    var pack = package.receive(data);
    switch(pack.id)
    {
        case package.types.EATME:
            player.gameover = true;
            break;
        case package.types.SIZE:
            player.setRadius(pack.size);
          break;
        case package.types.PLAYER:
            player.id = pack.player.id;
            player.setColor(pack.player.color);
          break;
        case package.types.COLOR:
            clientEngine.findAndDo(function(t){
                  return t.id == pack.entityId;
              },function(t){
                  t.setColor(pack.color);
              },false);

            break;
        case package.types.VIEWBOX:
            player.viewBox = pack.viewBox;
          break;
        case package.types.UPDATE:
            // remover todos los que hay que remover
            pack.removes.forEach(function(item){
              clientEngine.findAndDo(function(t){
                  return t.id == item;
              },function(t){
                  t.destroy();
              });
          });

          // set player data
          if(pack.player!=undefined){
                  if(player.id==undefined){
                      player.id = pack.player.id;
                  }

                  if(pack.player.position!=undefined)
                      player.newPosition.set(pack.player.position);
                  if(pack.player.speed!=undefined)player.setSpeed(pack.player.speed);
                  if(pack.player.direction!=undefined)player.direction.setDirection(pack.player.direction);
          }

          var length = pack.add.length;
          for(var i=0;i<length;i++){
              var current = pack.add[i];

              // Add or update a cell
              var cell = clientEngine.findEntityById(current.id);
              if(cell===undefined){
                  cell = new Cell();
              }
              cell.setX(current.position.x);
              cell.setY(current.position.y);
              cell.id = current.id;
              ws.send(package.requestColor(current.id));
              cell.radius = current.size;
              cell.radiusLerp = current.size;
              
              clientEngine.addEntity(cell);
          }
            break;

    }
}