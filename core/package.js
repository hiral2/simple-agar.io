(function(exports){

	exports.receive = function(buf){
		var result = {};
    	var view = new DataView(buf);
		result.id = view.getUint8(0,true);

		switch(result.id){
			case this.types.DIRECTION:
				result.direction = view.getFloat32(1,true);
				break;
			case this.types.UPDATE:
				var player = {};

				player.position = {
					x:view.getFloat32(1,true),
			    	y:view.getFloat32(5,true)
				};

			    player.speed = view.getFloat32(9,true);
			    player.direction = view.getFloat32(13,true);

			    result.player = player;

			    var showCount = view.getUint16(17,true);
			    //type,x,y,speed,direction, add cell count
				var offset = (1+4+4+4+4+2);
				// x,y,size,r,g,b,speed
				var cellSize = (2+4+4+2);
				result.add = [];
			    for(var i=0;i<showCount;i++){
			    	var cell = {};
			    	var buffId = (cellSize*i)+offset;

			    	cell.id = view.getUint16(buffId,true);
			    	buffId+=2;
			    	
			    	cell.position = {};
			    	cell.position.x = view.getFloat32(buffId,true);
			    	buffId+=4;
			    	cell.position.y = view.getFloat32(buffId, true);
			    	buffId+=4;
			    	cell.size = view.getUint16(buffId,true);
			    	result.add.push(cell);
			    }

			    result.removes = [];
			    var removeOffset = offset+(cellSize*showCount);
			    var removesCount = (view.byteLength - removeOffset)/2;

			    for(var i=0;i<removesCount;i++){
			    	var buffId = removeOffset+(i*2);
			    	var removeId = view.getUint16(buffId,true);
			    	result.removes.push(removeId);
			    }

				break;
			case this.types.SIZE:
				var size = view.getFloat32(1,true);
				result.size = size;

				break;
			case this.types.COLOR:
				var r = view.getUint8(1,true);
				var g = view.getUint8(2,true);
				var b = view.getUint8(3,true);
				var a = view.getUint8(4,true);
				
				result.color = [r,g,b,a];
				result.entityId = view.getUint16(5,true);
				break;
			case this.types.VIEWBOX:
				var width = view.getFloat32(1,true);
				var height = view.getFloat32(5,true);

				result.viewBox={
					width:width,
					height:height
				};
				
				break;
			case this.types.REQUESTCOLOR:
				result.entityId = view.getUint16(1,true);
				break;	
			case this.types.PLAYER:
				result.player ={};
				result.player.color = [
					view.getUint8(1,true),
					view.getUint8(2,true),
					view.getUint8(3,true),
					view.getUint8(4,true)
				];
				result.player.id = view.getUint16(5,true);
		};
		return result;
	};

	exports.eatMe = function(){
		var buf = new ArrayBuffer(1);
	    var view = new DataView(buf);

	    view.setUint8(0, this.types.EATME, true);
	    return buf;
	};

	exports.reset = function(){
		var buf = new ArrayBuffer(1);
	    var view = new DataView(buf);

	    view.setUint8(0, this.types.RESET, true);
	    return buf;
	};


	exports.update = function(cell,shows,removes)
	{
		//type,x,y,speed,direction, add cell count
		var offset = (1+4+4+4+4+2);
		// x,y,size
		var cellSize = (2+4+4+2)
		var showsByteCount = shows.length*cellSize;
		var removeIdByteCount = removes.length*2;

		var buf = new ArrayBuffer(offset+showsByteCount+removeIdByteCount);
	    var view = new DataView(buf);

	    view.setUint8(0, this.types.UPDATE, true);
	    view.setFloat32(1,cell.position.x,true);
	    view.setFloat32(5,cell.position.y,true);
	    view.setFloat32(9,cell.speed(),true);
	    view.setFloat32(13,cell.direction.getDirection(),true);

	    view.setUint16(17,shows.length,true);
	    
	    for(var i=0;i<shows.length;i++){
	    	var currentCell  = shows[i];
	    	var buffId = (cellSize*i)+offset;

	    	view.setUint16(buffId, currentCell.id,true);
	    	buffId+=2;
	    	view.setFloat32(buffId, currentCell.position.x,true);
	    	buffId+=4;
	    	view.setFloat32(buffId, currentCell.position.y,true);
	    	buffId+=4;
	    	view.setUint16(buffId, currentCell.radius,true);
	    }

	    var removeOffset = ((cellSize*shows.length)+offset);
	    for(var i=0;i<removes.length;i++){
	    	var buffId = removeOffset+(i*2);
	    	view.setUint16(buffId,removes[i],true);
	    }

	    return buf;	
	};

	exports.size = function(size){
		var buf = new ArrayBuffer(1+4);
	    var view = new DataView(buf);

		view.setUint8(0,this.types.SIZE,true);
		view.setFloat32(1,size,true)
	    return buf;
	};

	exports.requestColor = function(id){
		var buf = new ArrayBuffer(1+2);
	    var view = new DataView(buf);

		view.setUint8(0,this.types.REQUESTCOLOR,true);
		view.setUint16(1,id,true);
		
		return buf;
	}
	exports.color = function(entityId,color){
		var buf = new ArrayBuffer(1+4+2);
	    var view = new DataView(buf);

		view.setUint8(0,this.types.COLOR,true);
		view.setUint8(1,color[0],true);
		view.setUint8(2,color[1],true);
		view.setUint8(3,color[2],true);
		view.setUint8(4,color[3],true);
		view.setUint16(5,entityId,true);
		
	    return buf;
	};

	exports.viewBox = function(viewbox){
		var buf = new ArrayBuffer(1+4+4);
	    var view = new DataView(buf);

		view.setUint8(0,this.types.VIEWBOX,true);
		view.setFloat32(1,viewbox.width,true);
		view.setFloat32(5,viewbox.height,true);
		
	    return buf;
	};

	exports.direction = function(direction){
		var buf = new ArrayBuffer(1+4);
	    var view = new DataView(buf);

	    view.setUint8(0,this.types.DIRECTION,true);
	    view.setFloat32(1,direction,true)
	    return buf;
	};

	exports.player = function(player){
		var buf = new ArrayBuffer(1+2+4);
	    var view = new DataView(buf);

	    view.setUint8(0,this.types.PLAYER,true);
	    view.setUint8(1,player.color[0],true)
	    view.setUint8(2,player.color[1],true)
	    view.setUint8(3,player.color[2],true)
	    view.setUint8(4,player.color[3],true)

	    view.setUint16(5,player.id,true)

	    return buf;
	}

	exports.types = {
		DIRECTION:1,
		RESET:2,
		EATME:3,
		UPDATE:4,
		SIZE:5,
		COLOR:6,
		VIEWBOX:7,
		REQUESTCOLOR:8,
		PLAYER:9
	};

	exports.toArrayBuffer = function(buffer) {
	    var ab = new ArrayBuffer(buffer.length);
	    var view = new Uint8Array(ab);
	    for (var i = 0; i < buffer.length; ++i) {
	        view[i] = buffer[i];
	    }
	    return ab;
	};

})(typeof exports === 'undefined'? this['package']={}: exports);
