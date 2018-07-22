
var player =  buildPlayer();
var ws = buildWebSocket();

canvas = document.getElementById("canvas");
var clientEngine = buildClientEngine(player,canvas);

clientEngine.start();