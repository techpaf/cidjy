////////////////////////////////
// CONSTRUCTOR & DISPLAY LIST //
////////////////////////////////

var Cidjy = function( canvas ){
	this.canvas = canvas;
	this.ctx = this.canvas.getContext('2d');
	this.fullClear = true;
	this.clearColor = "rgba(0,0,0,0.25)";
	this.children = [];
	this.totalChildren = 0;
	this.mouseEvent = false;
	this.mouseStyle = true;
	this.mouse = { 'x': undefined, 'y': undefined }
	this.scaleRatio = 1;
	this.fx = [];
}

Cidjy.prototype.enableMouse = function(){
	var self = this
	this.mouseEvent = true;

	this.canvas.addEventListener('mousemove', function(e){
        self.mouse.x = e.offsetX;
      	self.mouse.y = e.offsetY;
	}, false);

	this.canvas.addEventListener('click', function(e){
		for( var i = 0; i < self.children.length; i++ ){
			if( self.children[i].events.click.callback != undefined ){
				if( self[ 'mouseover' + self.children[i].type ](self.children[i]) ){
					var e = { 'target': self.children[i], 'type': 'click' }
					self.children[i].events.click.callback( e );
				}
			}
		}
	}, false);
}

Cidjy.prototype.disableMouse = function(){
	this.mouseEvent = false;

	this.canvas.removeEventListener('mousemove', function(e){
		var rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
      	this.mouse.y = e.clientY - rect.top
	}, false);
}

Cidjy.prototype.enableMouseStyle = function(){
	this.mouseStyle = true;
}

Cidjy.prototype.disableMouseStyle = function(){
	this.mouseStyle = false;
}

Cidjy.prototype.screenshot = function(){
	
	var backupImage = new Image();
	backupImage.src = this.canvas.toDataURL("image/png");
	return backupImage;
}

Cidjy.prototype.resize = function( width, height ){
	/*var dpr = window.devicePixelRatio || 1;
	var rect = this.canvas.getBoundingClientRect();
	this.canvas.width = width * dpr;
	this.canvas.height = height * dpr;
	this.ctx.scale(dpr, dpr);*/


	this.canvas.width = width;
	this.canvas.height = height;
}

Cidjy.prototype.addChild = function( child ){
	this.totalChildren++;
	child.uid = this.totalChildren;
	this.children.push( child );
}

Cidjy.prototype.removeChild = function( child ){
	for( var i = 0; i < this.children.length; i++ ){
		if( this.children[i]['uid'] == child.uid ){
			this.children.splice( i, 1 );
			break;
		}
	}
}

Cidjy.prototype.getChildIndex = function( child ){
	var childIndex = undefined;

	for( var i = 0; i < this.children.length; i++ ){
		if( this.children[i]['uid'] == child.uid ){
			childIndex = i;
			break;
		}
	}

	return childIndex;
}

Cidjy.prototype.bringToFront = function( child ){
	while( this.getChildIndex( child ) < this.children.length-1 ){
		this.swapChildIndex( this.getChildIndex( child ), this.getChildIndex( child )+1 );
	}
}

Cidjy.prototype.bringForward = function( child ){
	if( this.getChildIndex( child ) < this.children.length-1 ){
		this.swapChildIndex( this.getChildIndex( child ), this.getChildIndex( child )+1 );
	}
}

Cidjy.prototype.bringBackward = function( child ){
	if( this.getChildIndex( child ) > 0 ){
		this.swapChildIndex( this.getChildIndex( child ), this.getChildIndex( child )-1 );
	}
}

Cidjy.prototype.sendToBack = function( child ){
	while( this.getChildIndex( child ) > 0 ){
		this.swapChildIndex( this.getChildIndex( child ), this.getChildIndex( child )-1 );
	}
}

Cidjy.prototype.swapChildIndex = function( childIndex, targetChildIndex ){
	this.children.splice( targetChildIndex, 0, this.children.splice( childIndex, 1 )[0] );
	return this;
}

Cidjy.prototype.getMetName = function( root ){
	
}

Cidjy.prototype.empty = function(){
	while( this.children.length > 0 ){
		this.children.pop();
	}
}



///////////////
// RENDERING //
///////////////

Cidjy.prototype.render = function(){
	if( this.fullClear ){
		this.ctx.clearRect ( 0 , 0 , window.innerWidth, window.innerHeight );
	}
	else{
		this.ctx.fillStyle = this.clearColor;
		this.ctx.fillRect( 0,0,window.innerWidth, window.innerHeight );
	}

	for( var i = 0; i < this.children.length; i++ ){
		var ci = this.children[i];
		this.ctx.save();	

		if( ci.group != undefined ){
			this.ctx.translate( ci.group.x, ci.group.y );
			this.ctx.rotate( Cidjy.degreeToRadian( ci.group.rotation ) );
			this.ctx.scale( ci.group.scaleX, ci.group.scaleY );
			this.ctx.globalAlpha = ci.group.opacity;
		}	

		if( ci.mask != undefined ){
			this.ctx.translate( ci.mask.x, ci.mask.y );
			this.ctx.rotate( Cidjy.degreeToRadian( ci.mask.rotation ) );
			this.ctx.scale( ci.mask.scaleX, ci.mask.scaleY );
			this.ctx.globalAlpha = ci.mask.opacity;
			this[ 'draw'+ci.mask.type ]( ci.mask );

			this.ctx.translate( -ci.mask.x, -ci.mask.y);
			this.ctx.clip();
		}

		this.ctx.translate( ci.x, ci.y );
		this.ctx.rotate( Cidjy.degreeToRadian( ci.rotation ) );
		this.ctx.scale( ci.scaleX, ci.scaleY );
		this.ctx.shadowBlur = ci.shadowBlur;
		this.ctx.shadowColor = ci.shadowColor;
		this.ctx.globalAlpha = ci.opacity;
		this.ctx.globalCompositeOperation = ci.blendMode;
		this[ 'draw'+ci.type ]( ci );

		if( ci.fill != '' ){
			this.ctx.fillStyle = ci.fill;
			this.ctx.fill();
		}
		if( ci.stroke != '' ){
			this.ctx.strokeStyle = ci.stroke;
			this.ctx.lineWidth = ci.strokeWidth;
			this.ctx.lineCap = ci.lineCap;
			this.ctx.lineJoin = ci.lineJoin;
			this.ctx.stroke();
		}
		this.ctx.translate( -ci.x, -ci.y);
		this.ctx.scale( 1, 1 );
		this.ctx.rotate( Cidjy.degreeToRadian( ci.rotation ) * -1 );
		this.ctx.restore();
	}

	if( this.mouseEvent ){
		//Detecting mouseover
		for( var i = 0; i < this.children.length; i++ ){
			if( this.children[i].events.mouseover.callback != undefined ){
				if( this[ 'mouseover' + this.children[i].type ](this.children[i]) && !this.children[i].events.mouseover.fired ){
					var e = { 'target': this.children[i], 'type': 'mouseover' }
					this.children[i].events.mouseover.fired = true;
					this.children[i].events.mouseover.callback( e );


					this.children[i].events.mouseout.fired = false;
				}
				if( this.children[i].events.mouseover.fired && !this.children[i].events.mouseout.fired ){
					if( !this[ 'mouseover' + this.children[i].type ](this.children[i]) ){
						this.children[i].events.mouseout.fired = true;
						this.children[i].events.mouseover.fired = false;

						if( this.children[i].events.mouseout.callback != undefined ){
							var e = { 'target': this.children[i], 'type': 'mouseout' }
							this.children[i].events.mouseout.callback(e);
						}
					}
				}
			}
		}

		//Setting the good cursor style
		var hasOver = false;
		for( var i = 0; i < this.children.length; i++ ){
			if( this.children[i].events.mouseover.callback != undefined || this.children[i].events.click.callback != undefined ){
				if( this[ 'mouseover' + this.children[i].type ](this.children[i]) ){
					hasOver = true;
					break;
				}
			}
		}

		if( this.mouseStyle ){
			if( hasOver ){
				this.canvas.style.cursor = "pointer";
			}
			else{
				this.canvas.style.cursor = "default"
			}
		}
	}

	if( this.fx.length > 0 ){
		for( var i = 0; i < this.fx.length; i++ ){
			var cFx = this.fx[i];

			if( cFx.name == 'repeatX' ){
				this.ctx.save();
				var imgData = this.ctx.getImageData(0,0,this.canvas.width/cFx.times,this.canvas.height);
				for( var j = 0; j < cFx.times; j++ ){
					this.ctx.putImageData(imgData,this.canvas.width/cFx.times*j,0);
				}
				this.ctx.restore();
			}

			if( cFx.name == 'symmertyX' ){
				this.ctx.save();
				this.snapCtx.save();

				this.snapCtx.scale(-1, 1);
				this.snapCtx.drawImage(this.canvas,0,0,this.canvas.width,this.canvas.height);

				this.ctx.translate(-this.canvas.width/2, -this.canvas.height/2);
				this.ctx.drawImage(this.snap, this.canvas.width/2, 0);

				this.snapCtx.restore();
				this.ctx.restore();
			}
		}
	}
}

Cidjy.prototype.forceClear = function(){
	this.ctx.clearRect ( 0 , 0 , window.innerWidth, window.innerHeight );
}

Cidjy.prototype.drawCube = function( obj ){
	this.ctx.beginPath();
	this.ctx.rect( -obj.width/2, -obj.height/2, obj.width, obj.height );
	this.ctx.closePath();
}

Cidjy.prototype.drawRectangle = function( obj ){
	this.ctx.beginPath();
	this.ctx.rect( -obj.width/2, -obj.height/2, obj.width, obj.height );
	this.ctx.closePath();
}

Cidjy.prototype.drawCircle = function( obj ){
	this.ctx.beginPath();
	this.ctx.arc( 0, 0, obj.radius, 0, 2 * Math.PI, false );
	this.ctx.closePath();
}

Cidjy.prototype.drawPath = function( obj ){
	this.ctx.beginPath();
	if( !obj.smoothed ){
		this.ctx.moveTo( obj.points[0].x, obj.points[0].y );
		for( var j = 1; j < obj.points.length; j++ ){
			this.ctx.lineTo( obj.points[j].x, obj.points[j].y );
		}
		if( obj.closed ){
			this.ctx.closePath();
		}
	}
	else if( obj.smoothed ){
		obj.smooth();
		if( !obj.closed ){
			this.ctx.moveTo( obj.smoothedPoints[0].x, obj.smoothedPoints[0].y );
			for( var j = 1; j < obj.smoothedPoints.length; j++ ){
				this.ctx.lineTo( obj.smoothedPoints[j].x, obj.smoothedPoints[j].y );
			}
		}
		else if( obj.closed ){
			this.ctx.moveTo( obj.smoothedPoints[ obj.smoothPointsNumber ].x, obj.smoothedPoints[ obj.smoothPointsNumber ].y );
			for( var j = obj.smoothPointsNumber+1; j < obj.smoothedPoints.length - obj.smoothPointsNumber; j++ ){
				this.ctx.lineTo( obj.smoothedPoints[j].x, obj.smoothedPoints[j].y );
			}
		}
	}
}

Cidjy.prototype.drawRegularPolygon = function( obj ){
	this.drawPath( obj.path );
}

Cidjy.prototype.drawArc = function( obj ){
	this.ctx.beginPath();
	if(obj.closed){
		this.ctx.moveTo(0,0);
	}
	this.ctx.arc( 0, 0, obj.radius, Cidjy.degreeToRadian( obj.startAngle ),  Cidjy.degreeToRadian( obj.endAngle ), obj.antiClockwise );
	this.ctx.closePath();
}

Cidjy.prototype.drawImage = function( obj ){
	this.ctx.drawImage( obj.img, -obj.width / 2, -obj.height / 2 );
}

Cidjy.prototype.drawSprite = function( obj ){
	this.ctx.drawImage( obj.img, obj.width * obj.currentFrame, 0, obj.width, obj.height,  -obj.width/2,  -obj.height/2, obj.width, obj.height );
}

Cidjy.prototype.drawText = function( obj ){
	this.ctx.fillStyle = obj.fill;
	this.ctx.font = obj.fontStyle + ' ' + obj.fontSize + ' ' + obj.fontFamily;
	this.ctx.textAlign = obj.textAlign;
	this.ctx.fillText( obj.txt, 0, 0 );
}



///////////////
// COLLISION //
///////////////

Cidjy.prototype.mouseoverCircle = function( obj ){
	if( Cidjy.distanceBetween( obj, this.mouse ) < obj.radius ){
		return true;
	}
	else{
		return false;
	}
}

Cidjy.prototype.mouseoverCube = function( obj ){
	if( this.mouse.x > obj.x - obj.width/2 && this.mouse.x < obj.x + obj.width/2 ){
		if( this.mouse.y > obj.y - obj.height/2 && this.mouse.y < obj.y + obj.height/2 ){
			return true;
		}
		else{
			return false;
		}
	}
	else{
		return false;
	}
}

Cidjy.prototype.mouseoverRectangle = function( obj ){
	if( this.mouse.x > obj.x - obj.width/2 && this.mouse.x < obj.x + obj.width/2 ){
		if( this.mouse.y > obj.y - obj.height/2 && this.mouse.y < obj.y + obj.height/2 ){
			return true;
		}
		else{
			return false;
		}
	}
	else{
		return false;
	}
}

Cidjy.prototype.mouseoverRegularPolygon = function( obj ){
	//Substract polygon pos because poly point pos ar relative to polygon x and y
	var normalizedMousePos = { 'x': this.mouse.x - obj.x, 'y': this.mouse.y - obj.y }
	return Cidjy.pointInPolygon( obj.path.points, normalizedMousePos );
}

Cidjy.prototype.mouseoverImage = function( obj ){
	if( this.mouse.x > obj.x - obj.width/2 && this.mouse.x < obj.x + obj.width/2 ){
		if( this.mouse.y > obj.y - obj.height/2 && this.mouse.y < obj.y + obj.height/2 ){
			return true;
		}
		else{
			return false;
		}
	}
	else{
		return false;
	}
}

Cidjy.prototype.mouseoverSprite = function( obj ){
	if( this.mouse.x > obj.x - obj.width/2 && this.mouse.x < obj.x + obj.width/2 ){
		if( this.mouse.y > obj.y - obj.height/2 && this.mouse.y < obj.y + obj.height/2 ){
			return true;
		}
		else{
			return false;
		}
	}
	else{
		return false;
	}
}



////////////////////
// SHAPES & IMAGE //
////////////////////

//Base
Cidjy.BaseShape = function(){
	this.uid = 0;
	this.x = 0;
	this.y = 0; 
	this.blendMode = 'source-over';
	this.rotation = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.opacity = 1;
	this.fill = '';
	this.stroke = '';
	this.strokeWidth = 1;
	this.lineCap = 'butt';
	this.lineJoin = 'miter';
	this.shadowBlur = 0;
	this.shadowColor = "#000";
	this.mask;
	this.group;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Cidjy.BaseShape.prototype.addEventListener = function( event, callback ){
	if( this.events[event] != undefined ){
		this.events[event]['fired'] = false;
		this.events[event]['callback'] = callback;
	}
}

//Cube
Cidjy.Cube = function( size ){
	this.type = 'Cube';
	this.width = size || 50;
	this.height = size || 50;
	this.size = size || 50;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Cidjy.Cube.prototype = new Cidjy.BaseShape();
Cidjy.Cube.prototype.setSize = function( size ){
	if( size != undefined && size != null && !isNaN( parseFloat( size ) ) ){
		this.width = size;
		this.height = size;
		this.size = size;
	}
}

//Rectangle
Cidjy.Rectangle = function( width, height ){
	this.type = 'Rectangle';
	this.width = width||150;
	this.height = height||100;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Cidjy.Rectangle.prototype = new Cidjy.BaseShape();

//Circle
Cidjy.Circle = function( radius ){
	this.type = 'Circle';
	this.radius = radius || 50;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Cidjy.Circle.prototype = new Cidjy.BaseShape();

//Regular Polygon
Cidjy.RegularPolygon = function( radius, nPoints ){
	this.type = 'RegularPolygon';
	this.radius = radius || 50;

	var nPts = nPoints || 5;

	var points = [];
	var angle = Math.PI * 2 / nPts;
	for( var i = 0; i < nPts; i++ ){
		points.push( new Cidjy.Point( this.radius * Math.sin( angle * i ), this.radius * Math.cos( angle * i ) ) );
	}

	this.path = new Cidjy.Path( points );
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Cidjy.RegularPolygon.prototype = new Cidjy.BaseShape();

//Image
Cidjy.Image = function( src, callback ){
	var self = this;
	this.type = 'Image';
	this.src = src || '';
	this.loaded = false;
	this.img = new Image();

	this.img.onload = function(){
		self.loaded = true;
		self.width = self.img.width;
		self.height = self.img.height;

		if( callback != undefined ){
			callback( self );
		}
	}

	if( this.src != '' ){
		this.img.src = this.src;
	}
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Cidjy.Image.prototype = new Cidjy.BaseShape();

//Sprite
Cidjy.Sprite = function( src, width, height, frames, fps, loop, callback ){
	var self = this;
	this.type = 'Sprite';
	this.src = src || '';
	this.loaded = false;
	this.img = new Image();
	this.frames = frames;
	this.loop = loop || false;
	this.width = width;
	this.height = height;
	this.pWidth;
	this.pHeight;
	this.currentFrame = 0;
	this.reverse = false;
	this.fps = fps || 30;
	this.interval;

	this.img.onload = function(){
		self.loaded = true;
		self.pWidth = self.img.width;
		self.pHeight = self.img.height;

		if( callback != undefined ){
			callback( self );
		}
	}

	if( this.src != '' ){
		this.img.src = this.src;
	}
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Cidjy.Sprite.prototype = new Cidjy.BaseShape();
Cidjy.Sprite.prototype.nextFrame = function(){
	if( this.currentFrame < this.frames-1 ){
		this.currentFrame++;
	}
	else if( this.loop ){
		this.currentFrame = 0;
	}
	else{
		this.stop();
	}
	
}
Cidjy.Sprite.prototype.prevFrame = function(){
	if( this.currentFrame > 0 ){
		this.currentFrame--;
	}
	else if( this.loop ){
		this.currentFrame = this.frames-1;
	}
	else{
		this.stop();
	}
}
Cidjy.Sprite.prototype.render = function(){
	if( !this.reverse ){
		this.nextFrame();
	}
	else{
		this.prevFrame();
	}

	this.img.x = -this.currentFrame * this.pWidth;
}
Cidjy.Sprite.prototype.play = function(){
	var self = this;
	if( this.interval == undefined ){
		this.interval = setInterval(function(){
			self.render();
		}, 1000/this.fps);
	}
}
Cidjy.Sprite.prototype.stop = function(){
	var self = this;
	clearInterval( self.interval );
	self.interval = undefined;
}
Cidjy.Sprite.prototype.gotoAndPlay = function( frame ){
	if( frame > -1 && frame < this.frames ){
		this.currentFrame = frame;
		this.loop = false;
		this.play();
	}
}
Cidjy.Sprite.prototype.gotoAndStop = function( frame ){
	if( frame > -1 && frame < this.frames ){
		this.currentFrame = frame;
		this.loop = false;
		this.stop();
	}
}

//Text
Cidjy.Text = function( text, styles ){
	var self = this;
	this.type = 'Text';
	this.txt = text;
	this.fontFamily = styles.fontFamily || 'Arial' ;
	this.fontSize = styles.fontSize || '16px' ;
	this.fontStyle = styles.fontStyle || 'normal' ;
	this.textAlign = styles.textAlign || 'center' ;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Cidjy.Text.prototype = new Cidjy.BaseShape();



///////////////////
// POINTS'N'PATH //
///////////////////

//Path
Cidjy.Path = function( points ){
	this.type = 'Path';
	this.points = points;
	this.smoothedPoints;
	this.smoothed = false;
	this.closed = false;
	this.tension = 0.5;
	this.smoothPointsNumber = 16;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Cidjy.Path.prototype = new Cidjy.BaseShape();
Cidjy.Path.prototype.smooth = function(){
	var tempPoints = [];
	if( this.closed ){
		tempPoints.push( this.points[ this.points.length-1 ].x );
		tempPoints.push( this.points[ this.points.length-1 ].y );
	}

	for( var i = 0; i < this.points.length; i++ ){
		tempPoints.push( this.points[i].x );
		tempPoints.push( this.points[i].y );
	}

	if( this.closed ){
		tempPoints.push( this.points[0].x );
		tempPoints.push( this.points[0].y );
		tempPoints.push( this.points[1].x );
		tempPoints.push( this.points[1].y );
	}

	var smoothedPoints = Cidjy.smoothPath( tempPoints, this.tension, false, this.smoothPointsNumber );
	this.smoothedPoints = [];

	for( var i = 0; i < smoothedPoints.length; i+=2 ){
		this.smoothedPoints.push( new Cidjy.Point( smoothedPoints[i], smoothedPoints[i+1] ) );
	}
	this.smoothed = true;
}
Cidjy.Path.prototype.unSmooth = function(){
	this.smoothed = false;
}
Cidjy.Path.prototype.add = function( point ){
	this.points.push( point );
}
Cidjy.Path.prototype.shuffle = function( radius ){
	for( var i = 0; i < this.points.length; i++ ){
		this.points[i].moveRandom( radius );
	}
}

//Arc
Cidjy.Arc = function( startAngle, endAngle, radius, antiClockwise ){
	this.type = 'Arc';
	this.startAngle = startAngle || 0;
	this.endAngle = endAngle || 45;
	this.radius = radius || 50;
	this.antiClockwise = antiClockwise || false;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Cidjy.Arc.prototype = new Cidjy.BaseShape();

//Point
Cidjy.Point = function( x, y ){
	this.type = 'Point';
	this.x = x || 0;
	this.y = y || 0;
}
Cidjy.Point.prototype.moveRandom = function( radius ){
	this.x += Math.round( Math.random() * ( radius * 2 ) ) - radius;
	this.y += Math.round( Math.random() * ( radius * 2 ) ) - radius;
}



///////////
// GROUP //
///////////

//Base
Cidjy.Group = function(){
	this.uid = 0;
	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.opacity = 1;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
	this.children = [];
}

Cidjy.Group.prototype.add = function( item ){
	item.group = this;
	this.children.push(item);
}

Cidjy.Group.prototype.remove = function( item ){
	item.group = undefined;
	this.children.slice(this.children.indexOf(item), 1);
}


//////////
// MATH //
//////////

// K3N cardinal curve - http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
Cidjy.smoothPath = function( ptsa, tension, isClosed, numOfSegments ){
    tension = (typeof tension != 'undefined') ? tension : 0.5;
    isClosed = isClosed ? isClosed : false;
    numOfSegments = numOfSegments ? numOfSegments : 16;

    var _pts = [], res = [], x, y, t1x, t2x, t1y, t2y, c1, c2, c3, c4, st, t, i;

    _pts = ptsa.slice(0);

    if (isClosed) {
        _pts.unshift(_pts[_pts.length - 1]);
        _pts.unshift(_pts[_pts.length - 2]);
        _pts.unshift(_pts[_pts.length - 1]);
        _pts.unshift(_pts[_pts.length - 2]);
        _pts.push(_pts[0]);
        _pts.push(_pts[1]);
    }
    else {
        _pts.unshift(_pts[1]);
        _pts.unshift(_pts[0]);
        _pts.push(_pts[_pts.length - 2]);
        _pts.push(_pts[_pts.length - 1]);
    }

    for (i=2; i < (_pts.length - 4); i+=2) {
        for (t=0; t <= numOfSegments; t++) {

            // calc tension vectors
            t1x = (_pts[i+2] - _pts[i-2]) * tension;
            t2x = (_pts[i+4] - _pts[i]) * tension;

            t1y = (_pts[i+3] - _pts[i-1]) * tension;
            t2y = (_pts[i+5] - _pts[i+1]) * tension;

            // calc step
            st = t / numOfSegments;

            // calc cardinals
            c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1; 
            c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2); 
            c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st; 
            c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);

            // calc x and y cords with common control vectors
            x = c1 * _pts[i]    + c2 * _pts[i+2] + c3 * t1x + c4 * t2x;
            y = c1 * _pts[i+1]  + c2 * _pts[i+3] + c3 * t1y + c4 * t2y;

            //store points in array
            res.push(x);
            res.push(y);

        }
    }

    return res;
}

Cidjy.degreeToRadian = function( degree ){
	return degree * Math.PI / 180;
}

Cidjy.radianToDegree = function( radian ){
	return radian * 180 / Math.PI;
}



/////////////////
// CO9LLISIONS //
/////////////////

Cidjy.distanceBetween = function( p1, p2 ){
    var xs = 0;
    var ys = 0;

    xs = p2.x - p1.x;
    xs = xs * xs;

    ys = p2.y - p1.y;
    ys = ys * ys;

    return Math.sqrt( xs + ys );
}

Cidjy.pointInPolygon = function( poly, pt ){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c); return c;
}

Cidjy.collisionRectCircle = function( rect, circle ){
    var distX = Math.abs(circle.x - rect.x);
    var distY = Math.abs(circle.y - rect.y);

    if (distX > (rect.width/2 + circle.radius)) { return false; }
    if (distY > (rect.height/2 + circle.radius)) { return false; }

    if (distX <= (rect.width/2)) { return true; } 
    if (distY <= (rect.height/2)) { return true; }

    var dx=distX-rect.width/2;
    var dy=distY-rect.height/2;
    return (dx*dx+dy*dy<=(circle.radius*circle.radius));
}

Cidjy.collisionRectCircle2 = function( rect, circle ){
    var enlagedRect = { width: rect.width + circle.radius*2, height: rect.height + circle.radius*2, x: rect.x, y: rect.y };

    var colliding = Cidjy.collisionPointRect({x: circle.x, y: circle.y}, enlagedRect);
    var colSide = null;

    if(colliding){
    	if(circle.y > rect.y && circle.x > rect.x - rect.width / 2 && circle.x < rect.x + rect.width / 2){
    		colSide = 'bottom';
    	}
    	else if(circle.y < rect.y && circle.x > rect.x - rect.width / 2 && circle.x < rect.x + rect.width / 2){
    		colSide = 'top';
    	}
    	else if(circle.x < rect.x && circle.y > rect.y - rect.height / 2 && circle.y < rect.y + rect.height / 2){
    		colSide = 'left';
    	}
    	else if(circle.x > rect.x && circle.y > rect.y - rect.height / 2 && circle.y < rect.y + rect.height / 2){
    		colSide = 'right';
    	}
    	else if(circle.y > rect.y && circle.x < rect.x - rect.width / 2){
    		colSide = 'bottom-left';
    	}
    	else if(circle.y > rect.y && circle.x > rect.x + rect.width / 2){
    		colSide = 'bottom-right';
    	}
    	else if(circle.y < rect.y && circle.x < rect.x - rect.width / 2){
    		colSide = 'top-left';
    	}
    	else if(circle.y < rect.y && circle.x > rect.x + rect.width / 2){
    		colSide = 'top-right';
    	}
    }

    return {'collide': colliding, 'side': colSide};
}

Cidjy.collisionPointRect = function( point, rect ){
	var collide = false;

	if(point.x > rect.x - rect.width/2 && point.x < rect.x + rect.width/2 && point.y < rect.y + rect.height/2 && point.y > rect.y - rect.height / 2 ){
    	collide = true;
	}

	return collide;
}

Cidjy.collisionCircleCircle = function( circle, circle2 ){
    var dist = this.distanceBetween(circle, circle2)
    return (dist<=circle.radius+circle2.radius);
}

Cidjy.collisionCircleLine = function( circle, p1, p2 ){
	var x1 = p1.x;
	var y1 = p1.y;
	var x2 = p2.x;
	var y2 = p2.y;
	var xc = circle.x;
	var yc = circle.y;
	var rc = circle.radius;

	var ac = [xc - x1, yc - y1];
	var ab = [x2 - x1, y2 - y1];
	var ab2 = Cidjy.dot(ab, ab);
	var acab = Cidjy.dot(ac, ab);
	var t = acab / ab2;
	t = (t < 0) ? 0 : t;
	t = (t > 1) ? 1 : t;
	var h = [(ab[0] * t + x1) - xc, (ab[1] * t + y1) - yc];
	var h2 = Cidjy.dot(h, h);
	return h2 <= rc * rc;
}



Cidjy.dot = function( v1, v2 ){
	return (v1[0] * v2[0]) + (v1[1] * v2[1]);
}



////////////
// COLORS //
////////////

Cidjy.randomColor = function(){
	var glyph = '0123456789ABCDEF'.split('');
    var color = '#';
    for( var i = 0; i < 6; i++ ){
        color += glyph[ Math.round( Math.random() * 15 ) ];
    }
    return color;
}

Cidjy.randomColorFromScheme = function( scheme ){
	var color = Cidjy.scheme[ scheme ][ Math.round( Math.random()*(Cidjy.scheme[ scheme ].length-1 ) ) ];
    return color;
}

Cidjy.changeColorLuminance = function( hexa, luminance ){
	hexa = String(hexa).replace(/[^0-9a-f]/gi, '');
	if( hexa.length < 6 ){
		hexa = hexa[0] + hexa[0] + hexa[1] + hexa[1] + hexa[2] + hexa[2];
	}
	luminance = luminance || 0;

	var rgb = "#", c, i;
	for( i = 0; i < 3; i++ ){
		c = parseInt( hexa.substr( i * 2 , 2 ), 16 );
		c = Math.round( Math.min( Math.max( 0, c + ( c * luminance ) ), 255 ) ).toString( 16 );
		rgb += ( "00"+c ).substr( c.length );
	}

	return rgb;
}

//HEX TO RGB & RGB TO HEX | credits Tim Down http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
Cidjy.hexToRgb = function( hex ){
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace( shorthandRegex, function( m, r, g, b ){
        return r + r + g + g + b + b;
    } );

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
    return result ? {
        r: parseInt( result[1], 16 ),
        g: parseInt( result[2], 16 ),
        b: parseInt( result[3], 16 )
    } : null;
}

Cidjy.componentToHex = function( c ){
    var hex = c.toString( 16 );
    return hex.length == 1 ? "0" + hex : hex;
}

Cidjy.rgbToHex = function( r, g, b ){
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
}

Cidjy.getPixelColor = function( canvas, x, y ){
    var imgData = canvas.getContext('2d').getImageData(x, y, 1, 1);
    var red = imgData.data[0];
    var green = imgData.data[1];
    var blue = imgData.data[2];
    var alpha = imgData.data[3];
    return Cidjy.rgbToHex( red, green, blue );
}



//////////////////
// COLOR SCHEME //
//////////////////

Cidjy.scheme = {};
Cidjy.scheme.beach = [ '#FFD946', '#F9C74B', '#2996C1', '#268DA5', '#FFFFFF' ];
Cidjy.scheme.bert = [ '#F0EDE6', '#95BFB8', '#63A497', '#332936', '#DCD5C1' ];
Cidjy.scheme.breizh = [ '#275D8C', '#0578A6', '#15A0BF', '#BFB1A8', '#F2D5C4' ];
Cidjy.scheme.cake = [ '#BF3B58', '#5B3349', '#F4C284', '#F5A286', '#F06363' ];
Cidjy.scheme.dawn = [ '#A49294', '#282240', '#2E2759', '#323073', '#BF5F56' ];
Cidjy.scheme.irland = [ '#005572', '#006573', '#008B8D', '#81BEAA', '#F4D4AD' ];
Cidjy.scheme.mint = [ '#005B4F', '#157362', '#61A486', '#92D7B2', '#C3F4D0' ];
Cidjy.scheme.nebula = [ '#D99F00', '#D92B4B', '#040740', '#010626', '#0596A6', '#0BD9C4' ];
Cidjy.scheme.patriot = [ '#BF3542', '#CDC5BA', '#EBE3D6', '#1F2A3C', '#2E2E2E' ];
Cidjy.scheme.volcano = [ '#D6D0D9', '#252622', '#F27B35', '#F2622E', '#F2522E' ];