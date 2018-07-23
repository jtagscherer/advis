'use strict';

Polymer({
  is: 'matrix-metric',
	properties: {
		src: {
			type: String,
			observer: 'reload'
		},
		width: {
			type: Number,
			observer: 'reload'
		},
		height: {
			type: Number,
			observer: 'reload'
		},
		orientation: {
			type: String,
			observer: 'reload'
		},
		data: {
			type: Array,
			observer: 'redraw'
		},
		offset: {
			type: Object,
			observer: 'redraw'
		},
		_image: Object,
		_context: Object,
		_fontFillColor: {
			type: String,
			value: '#FFFFFF'
		},
		_fontStrokeColor: {
			type: String,
			value: '#1B1C1D'
		},
		_maximumGridLines: {
			type: Number,
			value: 20
		},
		_gridTransitionLength: {
			type: Number,
			value: 5
		},
		_gridStrokeColor: {
			type: String,
			value: '#FFFFFF'
		}
	},
	
	reload: function() {
		if (this.src == null || this.width == null || this.height == null
			|| this.orientation == null) {
			return;
		}
		
		let canvas = this.$$('canvas');
    
    // Scale the canvas for sharp rendering on screens with a high pixel density
    let scale = window.devicePixelRatio;
		canvas.width = this.width * scale;
		canvas.height = this.height * scale;
		canvas.style.width = `${this.width}px`;
		canvas.style.height = `${this.height}px`;
		
		this._context = canvas.getContext('2d');
		this._context.imageSmoothingEnabled = false;
		this._context.scale(scale, scale);
		this._context.fillStyle = this._fontFillColor;
		this._context.textAlign = 'center';
		this._context.textBaseline = 'middle';
		
		// Load the source image
		this._image = new Image();
		
		let self = this;
		this._image.onload = function() {
			self.redraw();
		};
		
		this._image.src = this.src;
	},
	
	redraw: function() {
		if (this._context == null || this.offset == null || this.data == null
			|| this._image == null) {
			return;
		}
		
		this._context.clearRect(0, 0, this.width, this.height);
		
		let offsetRange = this.offset.end - this.offset.start;
		var categorySize = 0;
		
		// Draw the image that visualizes the metric
		if (this.orientation == 'vertical') {
			categorySize = this.height / offsetRange;
			this._context.drawImage(
				this._image,
				0, this.offset.start, 1, offsetRange,
				0, 0, this.width, this.height
			);
		} else if (this.orientation == 'horizontal') {
			categorySize = this.width / offsetRange;
			this._context.drawImage(
				this._image,
				this.offset.start, 0, offsetRange, 1,
				0, 0, this.width, this.height
			);
		}
	}
});
