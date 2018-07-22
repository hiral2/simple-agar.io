if(typeof require !== 'undefined'){
    require('./extendMath.js');
}

var Vector = function(x,y){
    this.x = x;
    this.y = y;
    var _this = this;
    this.plus = function(vector){
        _this.x += vector.x;
        _this.y += vector.y;
            
    }
    this.for = function(number){
        return new Vector(_this.x*number,_this.y*number)
    }
    this.normalize = function(){
        var total = this.getLength();
        if(total!=0 && total!=1){
            _this.x = _this.x/total;
            _this.y = _this.y/total;
                
        }
    }

    this.clone = function(){
        var ret = new Vector(_this.x,_this.y);
        return ret;
    }

    this.set = function(vector){
        _this.x = vector.x;
        _this.y = vector.y;
    }

    this.setDirection = function(direction){
        var total = this.getLength();
        _this.x = Math.sin(direction)*total;
        _this.y = Math.cos(direction)*total;
    }

    this.setDirectionNormalize = function(direction){
        _this.x = Math.sin(direction);
        _this.y = Math.cos(direction);
    }

    this.getDirection = function(){
        var direction = Math.atan2(this.x,this.y);
        return direction;
    }

    this.getLength = function()
    {
        return Math.abs(_this.x)+Math.abs(_this.y);
    }

    this.equals = function(vector){
        return (_this.x == vector.x && _this.y == vector.y);
    }

}
//S
Vector.lerp = function(a,b,delt){
    return new Vector(Math.lerp(a.x,b.x,delt),Math.lerp(a.y,b.y,delt));
}
Vector.randomVector = function(x,y){
    var vr = new Vector(Math.random()*x,Math.random()*y);
    return vr;
}

if(typeof module !== 'undefined')
    module.exports = Vector;