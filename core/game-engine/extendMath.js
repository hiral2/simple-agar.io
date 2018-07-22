Math.lerp = function(value,next,avg){
	return next*avg + (value*(1-avg));
};

Math.clamp = function(value,min,max){
	return value<min?min:((value>max)?max:value);
};

Math.hypot = function(x,y){
	return Math.sqrt((x*x)+(y*y));
};