var package = require('../package.js');

var Entity = function(){
	this.destroyed = false;
	this.enable = true;
};

Entity.prototype.update;
Entity.prototype.beforeUpdate;
Entity.prototype.afterUpdate;

Entity.prototype.collisionCompare;
Entity.prototype.beforeDestroy;
Entity.prototype.destroy = function(){
	if(this.beforeDestroy!=undefined)this.beforeDestroy();
		this.destroyed = true;
};

module.exports = Entity;
