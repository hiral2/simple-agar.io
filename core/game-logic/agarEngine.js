var BaseEngine = require('../game-engine/engine.js').BaseEngine;
var serverEngine = new BaseEngine;
var entities = require('./entities.js');
var Color = require('../game-engine/color');
var Vector = require('../game-engine/vector');

var countMinCell = 100;
serverEngine.rectLimit = {
	x:0,
	y:0,
	width:2250,
	height:2250
};

serverEngine.init = function(){
	console.log("init server engine");
	this.componentsEnable.draw = false;
	for(var i=0;i<150;i++){
		this.spawnCell();		
	}
}

serverEngine.getRandomPos = function(){
	return {
		x:(this.rectLimit.x + (Math.random()*this.rectLimit.width)),
		y:(this.rectLimit.y + (Math.random()*this.rectLimit.height))
	};
}

serverEngine.afterUpdate = function(){
	this.findAndDo(function(ent){ return ent instanceof entities.UserCell; },function(cell){
		cell.addPackageUpdate();
		cell.sendAllPackage();
	});

	if(this.entityList.length<=countMinCell){
		this.spawnCell();
	}
}

serverEngine.resetUser = function(player){
	player.direction.set({x:0,y:0});
  	player.position.set(this.getRandomPos());
  	player.setRadius(15);
  	player.color = Color.random();
  	player.enable = true;
}

serverEngine.addUserCell = function(){
	var cell = new entities.UserCell();
	var pos = this.getRandomPos();
	cell.position.set(pos);
	cell.setColor(Color.random());
	cell.setRadius(15);
	this.addEntity(cell);

	return cell;
}


serverEngine.spawnCell = function(){
	var cell = new entities.Cell();
	cell.position.set(this.getRandomPos());
	cell.color = Color.random();
	cell.setRadius(1);
	this.addEntity(cell);
	return cell;
}

module.exports = serverEngine;