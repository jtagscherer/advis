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
			value: '#5B5C5C'
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
		this._context.globalAlpha = 1.0;
		
		let offsetRange = this.offset.end - this.offset.start;
		var categorySize = 0;
		var gridAmount = 0;
		
		// Draw the image that visualizes the metric
		if (this.orientation == 'vertical') {
			categorySize = this.height / offsetRange;
			gridAmount = this.height / categorySize;
			this._context.drawImage(
				this._image,
				0, this.offset.start, 1, offsetRange,
				0, 0, this.width, this.height
			);
		} else if (this.orientation == 'horizontal') {
			categorySize = this.width / offsetRange;
			gridAmount = this.width / categorySize;
			this._context.drawImage(
				this._image,
				this.offset.start, 0, offsetRange, 1,
				0, 0, this.width, this.height
			);
		}
		
		// When zoomed in far enough, draw a grid and individual values
		let transitionPercentage = gridAmount - this._maximumGridLines;
		let opacity = 1 - (transitionPercentage / this._gridTransitionLength);
		this._context.globalAlpha = opacity;
		
		if (transitionPercentage < 0) {
			this._context.globalAlpha = 1;
		}
		
		if (gridAmount < this._maximumGridLines + this._gridTransitionLength) {
			this._context.strokeStyle = this._gridStrokeColor;
			var position = 0;
			
			// Draw a grid
			var transformedPosition = 0;
			for (var position = Math.ceil(this.offset.start);
				position < Math.ceil(this.offset.end); position++) {
				transformedPosition = (position - this.offset.start) * categorySize;
				
				if (this.orientation == 'vertical') {
					this._context.beginPath();
					this._context.moveTo(0, transformedPosition);
					this._context.lineTo(this.width, transformedPosition);
					this._context.stroke();
				} else if (this.orientation == 'horizontal') {
					this._context.beginPath();
					this._context.moveTo(transformedPosition, 0);
					this._context.lineTo(transformedPosition, this.height);
					this._context.stroke();
				}
			}
			
			// Draw individual values
			this._context.strokeStyle = this._fontStrokeColor;
			var fontSize = 0;
			if (this.orientation == 'vertical') {
				fontSize = Math.min(categorySize / 2, this.width / 2);
			} else if (this.orientation == 'horizontal') {
				fontSize = Math.min(categorySize / 2, this.height / 2);
			}
			this._context.font = `${fontSize}px Roboto Condensed`;
			
			for (var position = Math.floor(this.offset.start);
				position < Math.ceil(this.offset.end); position++) {
				transformedPosition = (position - this.offset.start) * categorySize;
				let value = this.data[position];
				
				var text = '';
				if (value != null) {
					text = String(Number.parseFloat(value).toFixed(2));
				} else {
					text = '?';
				}
				
				var textX = 0;
				var textY = 0;
				if (this.orientation == 'vertical') {
					textX = this.width / 2;
					textY = transformedPosition + (categorySize / 2);
				} else if (this.orientation == 'horizontal') {
					textX = transformedPosition + (categorySize / 2);
					textY = this.height / 2;
				}
				
				this._context.strokeText(text, textX, textY);
				this._context.fillText(text, textX, textY);
			}
		}
	}
});
