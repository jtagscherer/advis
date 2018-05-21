'use strict';

Polymer({
  is: 'swipe-comparison',
	
	behaviors: [
		VisualizationComparisonBehavior,
		(Polymer as any).NeonAnimatableBehavior
	],
	
	getImageContainerSize: function() {
		return Math.min(
			this.$$('#container').offsetWidth,
			this.$$('#container').offsetHeight
		)
	},
	
	urlsChanged: function(urlType) {
		this._adjustClipRectangle(0.5);
	},
	
	sizeChanged: function() {
		this._adjustClipRectangle(0.5);
	},
	
	_adjustClipRectangle: function(percentage) {
		let container = this.$$('#container').getBoundingClientRect();
		let images = this.$$('#distorted-images').getBoundingClientRect();
		
		let leftEdge = images.left - container.left;
		let rightEdge = images.right - container.left;
		
		this.customStyle['--clip-left'] = leftEdge + 'px';
		this.customStyle['--clip-right'] = (leftEdge + (percentage * images.width))
			+ 'px';
		this.customStyle['--clip-bottom'] = images.height + 'px';
		
		this.updateStyles();
	}
} as any);
