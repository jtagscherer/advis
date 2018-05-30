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
	
	getDialogImageSource: function(data, callback) {
		let source = this.getSingleTileImageUrl(
			this._getClickedVisualizationType(data.clickCoordinates),
			data.selectedTile.index
		);
		
		callback(source);
	},
	
	getDialogTitle: function(data) {
		let title = `Tensor ${Number(data.selectedTile.index) + 1}`;
		let visualizationType = this._getClickedVisualizationType(
			data.clickCoordinates);
		
		if (visualizationType == 'distorted') {
			return title + ' (Distorted)';
		} else {
			return title;
		}
	},
	
	sizeChanged: function() {
		this._updateClipRectangle();
	},
	
	stateChanged: function() {
		this._updateClipRectangle();
	},
	
	_getClickedVisualizationType: function(clickCoordinates) {
		let images = this.$$('#distorted-image').getBoundingClientRect();
		let percentage = this.sliderValue / (this._maximumSliderValue * 1.0);
		
		if (clickCoordinates.x < percentage * images.width) {
			return 'original';
		} else {
			return 'distorted';
		}
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
		let images = this.$$('#distorted-image').getBoundingClientRect();
		
		this.customStyle['--clip-right'] = (percentage * images.width) + 'px';
		this.customStyle['--clip-bottom'] = images.height + 'px';
		
		this.customStyle['--image-container-width'] = images.width + 'px';
		
		this.updateStyles();
	}
} as any);
