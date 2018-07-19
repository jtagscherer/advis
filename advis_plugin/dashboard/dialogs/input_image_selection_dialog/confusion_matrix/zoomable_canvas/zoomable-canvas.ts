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
			
			let position = self._context.transformedPoint(
				e.offsetX, e.offsetY
			);
			
			let factor = Math.pow(1.1, e.wheelDelta * 0.01);
			
			self._context.translate(position.x, position.y);
			self._context.scale(factor, factor);
			self._context.translate(-position.x, -position.y);
			
			self.redraw();
		});
		
		var lastPosition = null;
		
		canvas.addEventListener('mousedown', function(e) {
			e.preventDefault();
			lastPosition = self._context.transformedPoint(
				e.offsetX, e.offsetY
			);
		});
		
		canvas.addEventListener('mousemove', function(e) {
			e.preventDefault();
			
			if (lastPosition) {
				let position = self._context.transformedPoint(
					e.offsetX, e.offsetY
				);
				
				self._context.translate(
					position.x - lastPosition.x,
					position.y - lastPosition.y
				);
				
				self.redraw();
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
		this._enhanceContext(this._context);
		
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
		this._context.drawImage(this._image, 0, 0);
	},
	
	_enhanceContext: function(context) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var matrix = svg.createSVGMatrix();
		let self = this;
		
		context.getTransformationMatrix = function() {
			return matrix;
		};

		var savedTransformations = [];
		
		var save = context.save;
		context.save = function() {
			savedTransformations.push(matrix.translate(0, 0));
			return save.call(context);
		};

		var restore = context.restore;
		context.restore = function() {
			matrix = savedTransformations.pop();
			return restore.call(context);
		};

		var scale = context.scale;
		context.scale = function(sx, sy) {
			matrix = matrix.scaleNonUniform(sx, sy);
			self._zoom += (sx - 1);
			console.log(self._zoom);
			return scale.call(context, sx, sy);
		};

		var rotate = context.rotate;
		context.rotate = function(radians) {
			matrix = matrix.rotate((radians * 180) / Math.PI);
			return rotate.call(context, radians);
		};

		var translate = context.translate;
		context.translate = function(dx, dy) {
			matrix = matrix.translate(dx, dy);
			self._x += dx;
			self._y += dy;
			// console.log(context.transformedPoint(0, 0));
			return translate.call(context, dx, dy);
		};

		var transform = context.transform;
		context.transform = function(a, b, c, d, e, f) {
			var temp = svg.createSVGMatrix();
			temp.a = a;
			temp.b = b;
			temp.c = c;
			temp.d = d;
			temp.e = e;
			temp.f = f;
			matrix = matrix.multiply(temp);
			return transform.call(context, a, b, c, d, e, f);
		};

		var setTransform = context.setTransform;
		context.setTransform = function(a, b, c, d, e, f) {
			matrix.a = a;
			matrix.b = b;
			matrix.c = c;
			matrix.d = d;
			matrix.e = e;
			matrix.f = f;
			return setTransform.call(context, a, b, c, d, e, f);
		};
		
		context.transformedPoint = function(x, y) {
			var point = svg.createSVGPoint();
			point.x = x;
			point.y = y;
			return point.matrixTransform(matrix.inverse());
		}
	}
});
