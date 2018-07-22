(function(exports){

	var BaseEngine = function(){
		this.interval;
		this.timeSleep = 40;
		this.entityList = new Array();
		this.lastTime=0;
		this.deltaTime = 0;
		this.entityIndex =0;	
		this.componentsEnable ={
			collision:true,
			draw:true,
			update:true,
			autoIncrement:true
		};

		var _this = this;

		this.init = function(){};
		this.start = function(){
			_this.init();
			_this.interval = setInterval(_this.Loop,_this.timeSleep);

		}
		
		this.draw = function(){}

		this.update = function(){
			_this.entityList.forEach(function(item){
				if(item.enable){
					if(item.beforeUpdate!=undefined)item.beforeUpdate();
					if(item.update!=undefined)item.update();
					if(item.afterUpdate!=undefined)item.afterUpdate();
				}

			});
		}

		this.beforeUpdate = function(){}
		this.afterUpdate = function(){}

		this.collision = function(){
			var length = _this.entityList.length;
			for(var i=0;i<length;i++){
				var entityI = _this.entityList[i];
				if(!entityI.enable)continue;
				for(var j=i+1;j<length;j++){
					var entityJ = _this.entityList[j];
					if(!entityJ.enable)continue;

					if(entityI.collisionCompare)entityI.collisionCompare(entityJ);
					if(entityJ.collisionCompare)entityJ.collisionCompare(entityI);
				}
			}
		}

		this.clearDestroy = function(){
			for(var i=0;i<_this.entityList.length;i++){
				var entityI = _this.entityList[i];
				if(entityI.destroyed){
					 _this.entityList.splice(i, 1);
					 i--;
				}
			}
		}

		this.findFirst = function(where){
			var length = _this.entityList.length;
			for(var i=0;i<length;i++){
				var entityI = _this.entityList[i];
				if(where(entityI)){
					return entityI;
				}
			}
		}

		this.findEntityById = function(id){
			return this.findFirst(function(e){return e.id == id});
		}

		this.findEntitys = function(where,projection){
			var length = _this.entityList.length;
			var subArray =new Array();
			for(var i=0;i<length;i++){
				var entityI = _this.entityList[i];
				if(where(entityI)){
					if(projection!=undefined)
						subArray.push(projection(entityI));
					else
						subArray.push(entityI);
				}
			}
			return subArray;
		}

		this.findAndDo = function(where,doSomthing,breakAtfirst){
			var length = _this.entityList.length;
			for(var i=0;i<length;i++){
				var entityI = _this.entityList[i];
				if(where(entityI)){
					if(!doSomthing(entityI) && (breakAtfirst!=undefined && breakAtfirst)){
						break;
					};
				}
			}
		}


		this.deltaTimeProcess = function(){
			var now = Date.now();
			_this.deltaTime = now - _this.lastTime;
			_this.lastTime = now;

		}

		this.Loop = function(){
			_this.deltaTimeProcess();
			if(_this.componentsEnable.collision)
				_this.collision();
			
			if(_this.componentsEnable.update){
				_this.beforeUpdate();
				_this.update();
				_this.afterUpdate();
			}

			if(_this.componentsEnable.draw)
				_this.draw();	

			_this.clearDestroy();
		}

		this.addEntity = function(entity){
			if(this.componentsEnable.autoIncrement){
				_this.entityIndex++;
				entity.id = _this.entityIndex;
			}
			entity.engine = _this;
			_this.entityList.push(entity);
			return entity;
		}

	};

	exports.BaseEngine = BaseEngine;

})(typeof exports === 'undefined'? this['game']={}: exports);