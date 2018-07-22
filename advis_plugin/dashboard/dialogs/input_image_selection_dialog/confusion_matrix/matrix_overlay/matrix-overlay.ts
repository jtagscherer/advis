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
		verticalOffset: {
			type: Object,
			observer: 'redraw'
		},
		horizontalOffset: {
			type: Object,
			observer: 'redraw'
		},
		_context: Object,
		_opacity: {
			type: Number,
			value: 0,
			observer: '_updateStyles'
		},
		_fontSize: {
			type: Number,
			value: 18
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
			value: '#FFFFFF'
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
		this._context.font = `${this._fontSize}px Roboto`;
		this._context.fillStyle = this._fontFillColor;
		this._context.textAlign = 'center';
		this._context.textBaseline = 'middle';
	},
	
	redraw: function() {
		if (this._context == null || this.data == null
			|| this.verticalOffset == null || this.horizontalOffset == null) {
			return;
		}
		
		this._context.clearRect(0, 0, this.size, this.size);
		
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
		if (transitionPercentage > 0
			&& transitionPercentage < this._gridTransitionLength) {
			this.set(
				'_opacity',
				1 - (transitionPercentage / this._gridTransitionLength)
			);
		}
		
		// If the amount of visible categories is small enough, draw the overlay
		if (gridAmount < this._maximumGridLines + this._gridTransitionLength) {
			this._context.strokeStyle = this._gridStrokeColor;
			var position = 0;
			
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
			
			/*this._context.strokeStyle = this._fontStrokeColor;
			this._context.strokeText('0', 10, 10);
			this._context.fillText('0', 10, 10);*/
		}
	},
	
	_updateStyles: function() {
		this.customStyle['--overlay-opacity'] = String(this._opacity);
		this.updateStyles();
	}
});
