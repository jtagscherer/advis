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
			value: 'normal'
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
		return Math.min(
			this.$$('#container').offsetWidth,
			this.$$('#container').offsetHeight
		)
	},
	
	urlsChanged: function(urlType) {
		this._updateOpacity();
	},
	
	sizeChanged: function() {
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
		
		// console.log(percentage);
		this.customStyle['--image-opacity'] = String(percentage);
		
		// Always keep the visualization with higher opacity on the foreground so 
		// that it's the one responding to clicks
		if (percentage <= 0.5) {
			this._foregroundVisualization = 'normal';
		} else {
			this._foregroundVisualization = 'distorted';
		}
		
		this.updateStyles();
	}
} as any);
