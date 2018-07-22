if(typeof require !== 'undefined'){
    require('./extendMath.js');
}

var Color = {
    get:function (strcolor) {
            if(strcolor instanceof Array)
            {
                if(strcolor.length==3)
                    strcolor.push(1);
                return strcolor;
            }
            switch(strcolor.toUpperCase()){
                case "WHITE":
                    return [255,255,255,1];
                case "BLACK":
                    return [0,0,0,1];
                case "RED":
                    return [255,0,0,1];
                case "GREEN":
                    return [0,255,0,1];
                case "'BLUE'":
                    return [0,0,255,1];
            }
            if(strcolor.search(/rgb|rgba/i)!=-1){
                var value = strcolor.replace(/rgb|rgba|\(|\)/ig,"").split(",");
                for (var i = 0; i < value.length; i++) {
                    var val = (i==3?parseFloat(value[i]):parseInt(value[i]));
                    if(isNaN(val)){
                        val = 0;
                    }

                    value[i] = val;
                };
                return value;
            }else{ 
                var doubleHex = false;
                var valuesTemp = "";
                if(strcolor.length==4 || strcolor.length==5){
                    valuesTemp = strcolor.match(/[0-9a-fA-F]/ig);
                    
                    doubleHex = true;
                }else{ 
                    valuesTemp = strcolor.match(/[0-9A-Fa-f]{2}/ig);
            
                }
                
                var values = new Array();
                for (var i = 0; i < valuesTemp.length; i++) {
                    values.push(parseInt(doubleHex?(valuesTemp[i]+valuesTemp[i]):valuesTemp[i],16));
                };
                if(values.length==3){
                    values.push(1);
                }else if(values.length==4){
                    values[3] = values[3]/255;
                }
                return values;
            }
            return [0,0,0,0];

    },

    lerp:function(a,b,c){
        var colora = Color.get(a);
        var colorb = Color.get(b);
        var colorc = new Array();
        for (var i = 0; i < 4; i++) {
            colorc.push(Math.lerp(colora[i],colorb[i],c));

            if(i!=3){
                colorc[i]=Math.floor(colorc[i]);
            }
        };
        return colorc;
    },

    random:function(){
        return [
            Math.round(Math.random()*255),
            Math.round(Math.random()*255),
            Math.round(Math.random()*255),
            1
        ];
    },
    toString:function(color){
        return "rgba("+color[0]+","+color[1]+","+color[2]+","+color[3]+")";
    }
};

if(typeof module !== 'undefined')
	module.exports = Color;