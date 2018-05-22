'use strict';

Polymer({
  is: 'difference-comparison',
	
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
		this._calculateImageDifferences();
	},
	
	sizeChanged: function() {
		this._calculateImageDifferences();
	},
	
	_calculateImageDifferences: function() {
		// TODO: Calculate the image differences between each unit
	}
} as any);
