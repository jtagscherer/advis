'use strict';

Polymer({
  is: 'side-by-side-comparison',
	
	behaviors: [
		VisualizationComparisonBehavior,
		(Polymer as any).NeonAnimatableBehavior
	],
	
	getImageContainerSize: function() {
		return Math.min(
			this.$$('#container').offsetWidth / 2,
			this.$$('#container').offsetHeight
		)
	}
} as any);
