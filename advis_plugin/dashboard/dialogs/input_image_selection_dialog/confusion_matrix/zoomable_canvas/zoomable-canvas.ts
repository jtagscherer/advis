'use strict';

Polymer({
  is: 'zoomable-canvas',
	properties: {
		src: {
			type: String,
			observer: '_imageSourceChanged'
		},
		size: {
			type: Number,
			observer: 'reload'
		},
		hoveredPixel: {
			type: Object,
			notify: true
		},
		horizontalOffset: {
			type: Object,
			notify: true
		},
		verticalOffset: {
			type: Object,
			notify: true
		},
		selectionRectangle: {
			type: Object,
			notify: true
		},
		_context: Object,
		_image: Object,
		_resolutionScale: Number
	},
	
	attached: function() {
		// Set up all listeners
		let self = this;
		let canvas = this.$$('canvas');
		
		canvas.addEventListener('mousewheel', function(e) {
			e.preventDefault();
			
			let position = self._context.transformedPoint(
				e.offsetX * self._resolutionScale, e.offsetY * self._resolutionScale
			);
			
			let factor = Math.pow(1.1, e.wheelDelta * 0.01);
			
			self._context.translate(position.x, position.y);
			self._context.scale(factor, factor);
			self._context.translate(-position.x, -position.y);
			
			self._context.correctBounds();
			self._updateHoveredPixel(e.offsetX, e.offsetY);
			self._updateOffsets();
			
			self.redraw();
		});
		
		var lastPosition = null;
		var selectionStartPosition = null;
		
		canvas.addEventListener('mousedown', function(e) {
			e.preventDefault();
			
			if (e.shiftKey) {
				selectionStartPosition = self._context.transformedPoint(
					e.offsetX * self._resolutionScale, e.offsetY * self._resolutionScale
				);
			} else {
				lastPosition = self._context.transformedPoint(
					e.offsetX * self._resolutionScale, e.offsetY * self._resolutionScale
				);
			}
		});
		
		canvas.addEventListener('mousemove', function(e) {
			e.preventDefault();
			
			if (lastPosition) {
				let position = self._context.transformedPoint(
					e.offsetX * self._resolutionScale, e.offsetY * self._resolutionScale
				);
				
				self._context.translate(
					position.x - lastPosition.x,
					position.y - lastPosition.y
				);
				
				self._context.correctBounds();
				self._updateOffsets();
				
				self.redraw();
			} else if (selectionStartPosition) {
				let position = self._context.transformedPoint(
					e.offsetX * self._resolutionScale, e.offsetY * self._resolutionScale
				);
				
				if (position.x > selectionStartPosition.x
					&& position.y > selectionStartPosition.y) {
					self.set('selectionRectangle', {
						x: Math.floor(selectionStartPosition.x),
						y: Math.floor(selectionStartPosition.y),
						width: Math.ceil(position.x - selectionStartPosition.x),
						height: Math.ceil(position.y - selectionStartPosition.y)
					});
				} else {
					self.set('selectionRectangle', null);
				}
				
			} else {
				self._updateHoveredPixel(e.offsetX, e.offsetY);
			}
		});
		
		canvas.addEventListener('mouseup', function(e) {
			e.preventDefault();
			lastPosition = null;
			selectionStartPosition = null;
		});
		
		canvas.addEventListener('mouseleave', function(e) {
			e.preventDefault();
			self.set('hoveredPixel', null);
			lastPosition = null;
			selectionStartPosition = null;
		});
	},
	
	reload: function() {
		if (this.src == null || this.size == null) {
			return;
		}
		
		let self = this;
		
		let canvas = this.$$('canvas');
		
		// Scale the canvas for sharp rendering on screens with a high pixel density
    this.set('_resolutionScale', window.devicePixelRatio);
		canvas.width = this.size * this._resolutionScale;
		canvas.height = this.size * this._resolutionScale;
		canvas.style.width = `${this.size}px`;
		canvas.style.height = `${this.size}px`;
		
		this._context = canvas.getContext('2d');
		this._context.imageSmoothingEnabled = false;
		this._context.resetTransform();
		this._enhanceContext(this._context);
		
		this._image = new Image();
		
		this._image.onload = function() {
			// Zoom to a level that makes the image fit the canvas
			let scaleFactor = (self.size * self._resolutionScale) / self._image.width;
			self._context.scale(scaleFactor, scaleFactor);
			
			self._updateOffsets();
			
			self.redraw();
		};
		
		this._image.src = this.src;
	},
	
	_imageSourceChanged: function(source) {
		if (this._image == null) {
			return;
		}
		
		let self = this;
		
		this._image.onload = function() {
			self.redraw();
		};
		
		this._image.src = source;
	},
	
	redraw: function() {
		if (this._context == null || this._image == null) {
			return;
		}
		
		// Clear the canvas
		this._context.save();
		this._context.setTransform(1, 0, 0, 1, 0, 0);
		this._context.clearRect(
			0, 0,
			this.size * this._resolutionScale, this.size * this._resolutionScale
		);
		this._context.restore();
		
		// Draw the source image
		this._context.drawImage(this._image, 0, 0);
	},
	
	_updateHoveredPixel: function(mouseX, mouseY) {
		if (this._context != null) {
			let position = this._context.transformedPoint(
				mouseX * this._resolutionScale, mouseY * this._resolutionScale
			);
			
			this.set('hoveredPixel', {
				x: Math.floor(position.x),
				y: Math.floor(position.y)
			});
		}
	},
	
	_updateOffsets: function() {
		let leftTop = this._context.transformedPoint(0, 0);
		let rightTop = this._context.transformedPoint(
			this.size * this._resolutionScale, 0
		);
		let leftBottom = this._context.transformedPoint(
			0, this.size * this._resolutionScale
		);
		
		this.set('horizontalOffset', {
			start: leftTop.x,
			end: rightTop.x
		});
		
		this.set('verticalOffset', {
			start: leftTop.y,
			end: leftBottom.y
		});
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
			
			// Constrain the zoom level
			if (matrix.a + (sx - 1) < (self.size * self._resolutionScale)
				/ self._image.width) {
				// We have zoomed too far out, reset the view to show the whole image
				self._context.setTransform(1, 0, 0, 1, 0, 0);
				
				let scaleFactor = (self.size * self._resolutionScale) / self._image.width;
				matrix = matrix.scaleNonUniform(scaleFactor, scaleFactor);
				return scale.call(context, scaleFactor, scaleFactor);
			} else {
				// Our zoom level is in bounds
				return scale.call(context, sx, sy);
			}
		};
		
		var rotate = context.rotate;
		context.rotate = function(radians) {
			matrix = matrix.rotate((radians * 180) / Math.PI);
			return rotate.call(context, radians);
		};
		
		var translate = context.translate;
		context.translate = function(dx, dy) {
			matrix = matrix.translate(dx, dy);
			return translate.call(context, dx, dy);
		};
		
		context.correctBounds = function() {
			// Constrain the translation to the image's bounds
			if (self._image) {
				var corrections = { x: 0, y: 0 };
				
				let topLeft = self._context.transformedPoint(0, 0);
				
				if (topLeft.x < 0) {
					corrections.x += topLeft.x;
				}
				if (topLeft.y < 0) {
					corrections.y += topLeft.y;
				}
				
				let bottomRight = self._context.transformedPoint(
					self.size * self._resolutionScale, self.size * self._resolutionScale
				);
				
				if (bottomRight.x > self._image.width) {
					corrections.x -= (self._image.width - bottomRight.x);
				}
				if (bottomRight.y > self._image.height) {
					corrections.y -= (self._image.height - bottomRight.y);
				}
				
				self._context.translate(corrections.x, corrections.y);
			}
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
