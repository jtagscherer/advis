'use strict';

Polymer({
  is: 'matrix-overlay',
	properties: {
		size: {
			type: Number,
			observer: 'reload'
		},
		data: {
			type: Object,
			observer: 'redraw'
		},
		labels: {
			type: Array,
			observer: 'redraw'
		},
		verticalOffset: {
			type: Object,
			observer: 'redraw'
		},
		horizontalOffset: {
			type: Object,
			observer: 'redraw'
		},
		selectionRectangle: {
			type: Object,
			observer: 'redraw'
		},
		_context: Object,
		_opacity: {
			type: Number,
			value: 0,
			observer: 'redraw'
		},
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
		},
		_selectionRectangleColor: {
			type: String,
			value: '#F47000'
		},
		_selectionRectangleWidth: {
			type: Number,
			value: 3
		}
	},
	
	reload: function() {
		if (this.size == null) {
			return;
		}
		
		let canvas = this.$$('canvas');
    
    // Scale the canvas for sharp rendering on screens with a high pixel density
    let scale = window.devicePixelRatio;
		canvas.width = this.size * scale;
		canvas.height = this.size * scale;
		canvas.style.width = `${this.size}px`;
		canvas.style.height = `${this.size}px`;
		
		this._context = canvas.getContext('2d');
		this._context.scale(scale, scale);
		this._context.fillStyle = this._fontFillColor;
		this._context.textAlign = 'center';
		this._context.textBaseline = 'middle';
	},
	
	redraw: function() {
		if (this._context == null || this.data == null || this.labels == null
			|| this.verticalOffset == null || this.horizontalOffset == null) {
			return;
		}
		
		this._context.clearRect(0, 0, this.size, this.size);
		this._context.lineWidth = 1;
		
		let verticalOffsetRange = this.verticalOffset.end
			- this.verticalOffset.start;
		let verticalCategorySize = this.size / verticalOffsetRange;
		
		let horizontalOffsetRange = this.horizontalOffset.end
			- this.horizontalOffset.start;
		let horizontalCategorySize = this.size / horizontalOffsetRange;
		
		let gridAmount = Math.max(this.size / verticalCategorySize,
			this.size / horizontalCategorySize);
		
		// Fade in the overlay if we are in the transition period
		let transitionPercentage = gridAmount - this._maximumGridLines;
		this._context.globalAlpha = 1 - (transitionPercentage
			/ this._gridTransitionLength);
		
    if (transitionPercentage < 0) {
			this._context.globalAlpha = 1;
		}
		
		// If the amount of visible categories is small enough, draw the overlay
		if (gridAmount < this._maximumGridLines + this._gridTransitionLength) {
			this._context.strokeStyle = this._gridStrokeColor;
			var position = 0;
			
			// Draw a grid
			for (var y = Math.ceil(this.verticalOffset.start);
				y < Math.ceil(this.verticalOffset.end); y++) {
				position = (y - this.verticalOffset.start) * verticalCategorySize;
				this._context.beginPath();
				this._context.moveTo(0, position);
				this._context.lineTo(this.size, position);
				this._context.stroke();
			}
			
			for (var x = Math.ceil(this.horizontalOffset.start);
				x < Math.ceil(this.horizontalOffset.end); x++) {
				position = (x - this.horizontalOffset.start) * horizontalCategorySize;
				this._context.beginPath();
				this._context.moveTo(position, 0);
				this._context.lineTo(position, this.size);
				this._context.stroke();
			}
			
			// Draw cell values
			this._context.strokeStyle = this._fontStrokeColor;
			let fontSize = Math.min(verticalCategorySize, horizontalCategorySize)
				* 0.5;
			this._context.font = `${fontSize}px Roboto`;
			
			var verticalPosition = 0;
			var horizontalPosition = 0;
			for (var x = Math.floor(this.horizontalOffset.start);
				x < Math.ceil(this.horizontalOffset.end); x++) {
				horizontalPosition = ((x - this.horizontalOffset.start) 
					* horizontalCategorySize) + (horizontalCategorySize / 2);
				for (var y = Math.floor(this.verticalOffset.start);
					y < Math.ceil(this.verticalOffset.end); y++) {
					verticalPosition = ((y - this.verticalOffset.start) 
						* verticalCategorySize) + (verticalCategorySize / 2);
					var value = '';
					
					if (x >= 0 && x < this.labels.length
						&& y >= 0 && y < this.labels.length) {
						let predictedLabel = this.labels[x];
						let actualLabel = this.labels[y];
						
						if (this.data != null && this.data[actualLabel] != null
							&& this.data[actualLabel][predictedLabel] != null) {
							value = this.data[actualLabel][predictedLabel];
						}
					}
					
					this._context.strokeText(value, horizontalPosition, verticalPosition);
					this._context.fillText(value, horizontalPosition, verticalPosition);
				}
			}
		}
		
		// Draw the rectangle of the current selection if one has been made
		if (this.selectionRectangle != null) {
			this._context.globalAlpha = 1.0;
			this._context.strokeStyle = this._selectionRectangleColor;
			this._context.lineWidth = this._selectionRectangleWidth;
			
			this._context.strokeRect(
				(this.selectionRectangle.x - this.horizontalOffset.start)
					* horizontalCategorySize,
				(this.selectionRectangle.y - this.verticalOffset.start)
					* verticalCategorySize,
				this.selectionRectangle.width * horizontalCategorySize,
				this.selectionRectangle.height * verticalCategorySize
			);
		}
	}
});
