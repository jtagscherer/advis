'use strict';

Polymer({
  is: 'side-by-side-comparison',
	
	behaviors: [
		VisualizationComparisonBehavior,
		(Polymer as any).NeonAnimatableBehavior
	],
	
	getImageContainerSize: function() {
		return {
			width: this.$$('.image-wrapper').offsetWidth,
			height: this.$$('.image-wrapper').offsetHeight
		};
	},
	
	getImageClass: function(condition, state) {
		if (condition && state != 'empty') {
			return 'activation-visualization visible';
		} else {
			return 'activation-visualization invisible';
		}
	}
} as any);
