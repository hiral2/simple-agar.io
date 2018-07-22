var Vector = require('../game-engine/vector');
var Color = require('../game-engine/color');
var Entity = require('../game-engine/entity');
var package = require('../package.js');

var Cell = function(){
	Entity.call(this);
	this.position = new Vector(0,0);
	this.direction = new Vector(0,0);
	this.radius = 3;
	this.radiusLerp = 3;
	this.speedreduce = 3;
	this.setColor([255,0,0,1]);

}

Cell.prototype = new Entity;
Cell.prototype.eatMe;
Cell.prototype.setRadius = function(radius){
	this.radius = radius;
	this.radiusLerp = radius;
	this.speedreduce = this.radius*2;
}


Cell.prototype.setX = function(x){
	this.position.x = x;
};

Cell.prototype.setY = function(y){
	this.position.y = y;
};


Cell.prototype.setColor = function(color){
	this.color = color;
	this.borderColor = Color.lerp(color,"BLACK",0.2);
}

var UserCell = function(){
	Cell.call(this);
	this.inView = new Array();
	if(this._packages==undefined)
		this._packages = Array();
}


UserCell.prototype = new Cell;
UserCell.prototype.constructor = UserCell;


UserCell.prototype.collisionCompare = function(entity){
	var hyp = Math.hypot(this.position.x-entity.position.x,this.position.y-entity.position.y);
	
	if(((this.radius*0.1)>entity.radius && hyp<(this.radius+entity.radius)) || hyp< (this.radius + entity.radius)*0.9){
		if(this.eat!=undefined && this.radius>entity.radius*1.2)
			this.eat(entity);
		
	}
}



UserCell.prototype.eat = function(ent){
	this.setRadius(this.radius+ent.radius);
	if(ent instanceof UserCell)
		ent.enable = false;
	else 
		ent.destroy();
	
	if(ent.eatMe!=undefined)
		ent.eatMe();
}


UserCell.prototype.setRadius = function(radio){
	Cell.prototype.setRadius.call(this,radio);
	this.addPackage(package.size(radio));
	this.addPackage(package.viewBox(this.viewBox()));
}


UserCell.prototype.speed = function(){
	if(this.engine.deltaTime==undefined)
		return 0;
	return (10/this.speedreduce)*this.engine.deltaTime;
}

UserCell.prototype.update = function(){
	this.position.plus(this.direction.for(this.speed()));
	this.radiusLerp = Math.lerp(this.radiusLerp,this.radius,0.001);
	this.position.x = Math.clamp(this.position.x,this.engine.rectLimit.x,this.engine.rectLimit.x+this.engine.rectLimit.width);
	this.position.y = Math.clamp(this.position.y,this.engine.rectLimit.y,this.engine.rectLimit.y+this.engine.rectLimit.height );
};

UserCell.prototype.eatMe = function(){
	this.addPackage(package.eatMe());
};

UserCell.prototype.viewBox = function(){
	return {width:this.radiusLerp*7+300,height:this.radiusLerp*7+300};
};

UserCell.prototype.addPackage = function(package){
	if(this._packages==undefined)
		this._packages = Array();
	this._packages.push(package);
};

UserCell.prototype.setColor = function(color){
	Cell.prototype.setColor.call(this,color);
	this.addPackage(package.color(this.id,this.color));
}

UserCell.prototype.addPackageUpdate = function(){
	var _this = this;

	var entitysinsideBox = this.engine.findEntitys(function(ent){
		return (ent.id!=_this.id) 
			&& ent.enable 
			&& ((ent.position.x+ent.radius>_this.position.x-(_this.viewBox().width/2)) 
			&& (ent.position.x-ent.radius<_this.position.x+(_this.viewBox().width/2))
			&& (ent.position.y+ent.radius>_this.position.y-(_this.viewBox().height/2)) 
			&& (ent.position.y-ent.radius<_this.position.y+(_this.viewBox().height/2))
		);
	},function(ent){
		var returncel = {
			position:{
				x:ent.position.x,
				y:ent.position.y
			},
			color:ent.color,
			radius:ent.radius
		};
		returncel.id = ent.id;
			
		if(ent instanceof UserCell){
			returncel.speed = ent.speed();
			returncel.direction = ent.direction;
			returncel.isUserCell=true;
		}else{
			returncel.isUserCell=false;
		}
		return returncel;
	});

	var out = {};
	out.player = {
		position:{
			x:this.position.x,
			y:this.position.y
		},
		viewBox:this.viewBox() ,
		color:this.color,
		radius:this.radius,
		id:this.id
	};


	out.add = entitysinsideBox
				.filter(function(t){ 
					return t.isUserCell || !_this.inView.some(function(t2){ 
																		return t2.id == t.id
																	}); 
				});

	out.removes = this.inView
						.filter((item)=>!entitysinsideBox.some((sub)=> sub.id == item.id))
						.map(function(item){return item.id});

	this.inView = entitysinsideBox;
	this.addPackage(package.update(this,out.add,out.removes));
};

UserCell.prototype.sendAllPackage = function(){
	var _this = this;
	
	this._packages.forEach(function(package){
		_this.send(package);
	});
	this._packages.splice(0,this._packages.length);
};

module.exports.Cell = Cell;
module.exports.UserCell = UserCell;