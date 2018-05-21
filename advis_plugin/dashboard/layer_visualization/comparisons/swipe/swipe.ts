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
	}
} as any);
