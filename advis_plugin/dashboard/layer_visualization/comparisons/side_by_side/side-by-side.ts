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
	
	getImageClass: function(condition) {
		if (condition && this.state != 'empty') {
			return 'activation-visualization visible';
		} else {
			return 'activation-visualization invisible';
		}
	},
	
	getDialogInputUrl: function(data) {
		return this.getSingleTileImageUrl(
			data.visualizationType,
			data.selectedTile.index
		);
	},
	
	getDialogTitle: function(data) {
		let title = `Tensor ${Number(data.selectedTile.index) + 1}`;
		
		if (data.visualizationType == 'distorted') {
			return title + ' (Distorted)';
		} else {
			return title;
		}
	}
} as any);
