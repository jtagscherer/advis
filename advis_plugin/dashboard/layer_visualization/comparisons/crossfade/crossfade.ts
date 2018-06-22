'use strict';

Polymer({
  is: 'crossfade-comparison',
	
	properties: {
		sliderValue: {
			type: Number,
			value: 500,
			observer: '_updateOpacity'
		},
		_maximumSliderValue: {
			type: Number,
			value: 1000
		},
		_foregroundVisualization: {
			type: String,
			value: 'original'
		}
	},
	
	behaviors: [
		VisualizationComparisonBehavior,
		(Polymer as any).NeonAnimatableBehavior
	],
	
	listeners: {
		'immediate-value-change': '_sliderDragged'
	},
	
	getImageContainerSize: function() {
		return {
			width: this.$$('#container').offsetWidth,
			height: this.$$('#container').offsetHeight
		};
	},
	
	getDialogImageSource: function(data, callback) {
		let source = this.getSingleTileImageUrl(
			this._foregroundVisualization,
			data.selectedTile.index
		);
		
		callback(source);
	},
	
	getDialogTitle: function(data) {
		let title = `Slice ${Number(data.selectedTile.index) + 1}`;
		
		if (this._foregroundVisualization == 'distorted') {
			return title + ' (Distorted)';
		} else {
			return title;
		}
	},
	
	getImageClass: function(condition) {
		if (this.state == 'loaded') {
			return 'visible';
		} else {
			return 'invisible';
		}
	},
	
	sizeChanged: function() {
		this._updateOpacity();
	},
	
	stateChanged: function() {
		this._updateOpacity();
	},
	
	_sliderDragged: function() {
		this._adjustImageOpacity(
			this.$$('paper-slider').immediateValue / (this._maximumSliderValue * 1.0)
		);
	},
	
	_updateOpacity: function() {
		this._adjustImageOpacity(
			this.sliderValue / (this._maximumSliderValue * 1.0)
		);
	},
	
	_adjustImageOpacity: function(percentage) {
		if (isNaN(percentage)) {
			return;
		}
		
		this.customStyle['--image-opacity'] = String(1 - percentage);
		
		// When clicking an image tile, the zoomed in details dialog should be  
		// using the normal or distorted visualization depending on which one has 
		// the higher opacity
		if (percentage <= 0.5) {
			this._foregroundVisualization = 'original';
		} else {
			this._foregroundVisualization = 'distorted';
		}
		
		this.updateStyles();
	}
} as any);
