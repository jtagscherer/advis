'use strict';

Polymer({
  is: 'swipe-comparison',
	
	properties: {
		sliderValue: {
			type: Number,
			value: 500,
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
		return {
			width: this.$$('#container').offsetWidth,
			height: this.$$('#container').offsetHeight
		};
	},
	
	getImageClass: function(condition) {
		if (this.state == 'loaded') {
			return 'visible';
		} else {
			return 'invisible';
		}
	},
	
	sizeChanged: function() {
		this._updateClipRectangle();
	},
	
	stateChanged: function() {
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
		let images = this.$$('#distorted-image').getBoundingClientRect();
		
		let leftEdge = images.left - container.left;
		
		this.customStyle['--clip-left'] = leftEdge + 'px';
		this.customStyle['--clip-right'] = (leftEdge + (percentage * images.width))
			+ 'px';
		this.customStyle['--clip-bottom'] = images.height + 'px';
		
		this.customStyle['--image-container-width'] = images.width + 'px';
		
		this.updateStyles();
	}
} as any);
