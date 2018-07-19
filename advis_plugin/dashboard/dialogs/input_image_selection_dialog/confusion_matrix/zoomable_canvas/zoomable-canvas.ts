'use strict';

Polymer({
  is: 'zoomable-canvas',
	properties: {
		src: {
			type: String,
			observer: 'reload'
		},
		size: {
			type: Number,
			observer: 'reload'
		},
		_context: Object,
		_image: Object,
		_x: {
			type: Number,
			value: 0
		},
		_y: {
			type: Number,
			value: 0
		},
		_zoom: {
			type: Number,
			value: 1.0
		}
	},
	
	attached: function() {
		// Set up all listeners
		let self = this;
		let canvas = this.$$('canvas');
		
		canvas.addEventListener('mousewheel', function(e) {
			e.preventDefault();
			let zoomFactor = Math.pow(1.1, e.wheelDelta * 0.01) - 1;
			
			let cursorX = e.offsetX / (self.size * self._zoom);
			let cursorY = e.offsetY / (self.size * self._zoom);
			
			self.zoom(zoomFactor);
			self.translate(
				self.size * zoomFactor * -0.5,
				self.size * zoomFactor * -0.5
			);
		});
		
		var lastPosition = null;
		
		canvas.addEventListener('mousedown', function(e) {
			e.preventDefault();
			lastPosition = {
				x: e.offsetX,
				y: e.offsetY
			};
		});
		
		canvas.addEventListener('mousemove', function(e) {
			e.preventDefault();
			
			if (lastPosition) {
				self.translate(
					e.offsetX - lastPosition.x,
					e.offsetY - lastPosition.y
				);
				
				lastPosition = {
					x: e.offsetX,
					y: e.offsetY
				};
			}
		});
		
		canvas.addEventListener('mouseup', function(e) {
			e.preventDefault();
			lastPosition = null;
		});
		
		canvas.addEventListener('mouseleave', function(e) {
			e.preventDefault();
			lastPosition = null;
		});
	},
	
	reload: function() {
		if (this.src == null || this.size == null) {
			return;
		}
		
		let self = this;
		
		let canvas = this.$$('canvas');
		canvas.width = this.size;
		canvas.height = this.size;
		
		this._context = canvas.getContext('2d');
		this._context.imageSmoothingEnabled = false;
		
		this._image = new Image();
		
		this._image.onload = function() {
			self.redraw();
		};
		
		this._image.src = this.src;
	},
	
	redraw: function() {
		if (this._context == null || this._image == null) {
			return;
		}
		
		// Clear the canvas
		this._context.save();
		this._context.setTransform(1, 0, 0, 1, 0, 0);
		this._context.clearRect(0, 0, this.size, this.size);
		this._context.restore();
		
		// Draw the source image
		// this._context.drawImage(this._image, 0, 0);
		let imageSize = this._zoom * this.size;
		
		this._context.drawImage(
			this._image, 0, 0, this._image.width, this._image.height,
			this._x, this._y, imageSize, imageSize
		);
	},
	
	zoom: function(delta) {
		this._zoom += delta;
		this.redraw();
		
		/*if (this._context != null) {
			let factor = Math.pow(1.1, delta);
			
			this._zoom += (factor - 1);
			// this._context.scale(factor, factor);
			this.redraw();
			console.log(this._zoom);
		}*/
	},
	
	translate: function(x, y) {
		this._x += x;
		this._y += y;
		this.redraw();
	}
});
