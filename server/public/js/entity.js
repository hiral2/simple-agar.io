
var Entity = function(){
	this.destroyed = false;
	this.enable = true;
};

Entity.prototype.draw;
Entity.prototype.update;
Entity.prototype.beforeUpdate;
Entity.prototype.afterUpdate;

Entity.prototype.colisionCompare;
Entity.prototype.beforeDestroy;
Entity.prototype.destroy = function(){
	if(this.beforeDestroy!=undefined)this.beforeDestroy();
		this.destroyed = true;
};

var Cell = function(){
	Entity.call(this);
	this.position = new Vector(0,0);
	this.direction = new Vector(0,0);
	this.radius = 3;
	this.radiusLerp = 3;
	this.speed = 0;
	this.color = "#FF0000";
	this.borderColor = "#FF0000";
}

Cell.prototype = new Entity;

Cell.prototype.eatMe;

Cell.prototype.setRadius = function(radius){
	this.radius = radius;

}

Cell.prototype.setSpeed = function(speed){
	this.speed = speed;

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

Cell.prototype.colisionCompare = function(entity){
	if(Math.hypot(this.position.x-entity.position.x,this.position.y-entity.position.y)< this.radius+entity.radius){
		if(this.radius>entity.radius){
			this.radius +=entity.radius;
			entity.destroy();
		}else if(this.radius<entity.radius){
			entity.radius +=this.radius;
			this.destroy();
			if(entity.eatMe!=undefined)entity.eatMe();
			
		}
	}
}

Cell.prototype.canDraw;
Cell.prototype.draw = function(ctx){
	if(this.destroyed || this.canDraw!=undefined && !this.canDraw()){
		return;
	}
	
	ctx.beginPath();
	
    ctx.arc(this.position.x, this.position.y, this.radiusLerp<=1?3:this.radiusLerp, 0, 2 * Math.PI, false);
    ctx.fillStyle = Color.toString(this.color);
    ctx.fill();
    ctx.lineWidth = 4;
  
    var borderWidth = this.radiusLerp - (ctx.lineWidth)-3;
    if(borderWidth>=1){
    	ctx.beginPath();
	    ctx.arc(this.position.x, this.position.y,borderWidth , 0, 2 * Math.PI, false);
	    ctx.strokeStyle = Color.toString(this.borderColor);
	    ctx.stroke();
    }
}

Cell.prototype.speed = function(){
	return 80/this.radius;
}
Cell.prototype.update = function(){
	this.radiusLerp = Math.lerp(this.radiusLerp,this.radius,0.1);
}