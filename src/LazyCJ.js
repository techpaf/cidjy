var LazyCJ = function(opt){
	var defaultOptions = {
		w: window.innerWidth,
		h: window.innerWidth / 16 * 9,
		fullClear: false,
		clearColor: "rgba(255,255,255,0.025)",
		callbacks: {
			init: function(){
				console.log("Default init callback");
			},
			render: function(){
				console.log("Default render callback");
			}
		},
		animated: false
	}
	var options = opt || defaultOptions;

	this.canvas = options.canvas;

	this.cj = new Cidjy(this.canvas);
	this.cj.fullClear = options.fullClear || defaultOptions.fullClear;
	this.cj.clearColor = options.clearColor || defaultOptions.clearColor;
	this.cWidth = options.w || defaultOptions.w;
	this.cHeight = options.h || defaultOptions.h;
	this.callBacks = {
		'init': (options.callBacks && options.callBacks.init)?options.callBacks.init : defaultOptions.callbacks.init,
		'render': (options.callBacks && options.callBacks.render)?options.callBacks.render : defaultOptions.callbacks.render
	};
	this.animated = options.animated || defaultOptions.animated;

	this.init();
}

LazyCJ.prototype.init = function(callback){
	this.cj.resize();			
	this.bindEvents();
	$(window).trigger('resize');

	this.callBacks.init(this);
	this.cj.render();

	if(this.animated){
	   this.loop();
	}
}

LazyCJ.prototype.resize = function(w, h){
	this.cj.resize(w, h);
}

LazyCJ.prototype.bindEvents = function(){
	var self = this;

	$( window ).resize(function(){
		self.cj.resize(self.cWidth, self.cHeight);
		console.log('resize')
	});
}

LazyCJ.prototype.loop = function(){
	var self = this;

	requestAnimationFrame( function(){
		self.loop();
	});

	this.callBacks.render(self);
	this.cj.render();
}