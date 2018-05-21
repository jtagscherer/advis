'use strict';

Polymer({
  is: 'swipe-comparison',
	
	properties: {
		sliderValue: {
			type: Number,
			value: 50,
			observer: '_updateClipRectangle'
		},
		_maximumSliderValue: {
			type: Number,
			value: 1000
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
		this._updateClipRectangle();
	},
	
	sizeChanged: function() {
		this._updateClipRectangle();
	},
	
	_sliderDragged: function() {
		this._adjustClipRectangle(
			this.$$('paper-slider').immediateValue / (this._maximumSliderValue * 1.0)
		);
	},
	
	_updateClipRectangle: function() {
		this._adjustClipRectangle(
			this.sliderValue / (this._maximumSliderValue * 1.0)
		);
	},
	
	_adjustClipRectangle: function(percentage) {
		let container = this.$$('#container').getBoundingClientRect();
		let images = this.$$('#distorted-images').getBoundingClientRect();
		
		let leftEdge = images.left - container.left;
		
		this.customStyle['--clip-left'] = leftEdge + 'px';
		this.customStyle['--clip-right'] = (leftEdge + (percentage * images.width))
			+ 'px';
		this.customStyle['--clip-bottom'] = images.height + 'px';
		
		this.updateStyles();
	}
} as any);
