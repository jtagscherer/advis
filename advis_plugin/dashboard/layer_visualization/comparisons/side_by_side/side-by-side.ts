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
	},
	
	getDialogImageSource: function(data, callback) {
		let source = this.getSingleTileImageUrl(
			data.visualizationType,
			data.selectedTile.index
		);
		
		callback(source);
	},
	
	getDialogTitle: function(data) {
		let title = `Slice ${Number(data.selectedTile.index) + 1}`;
		
		if (data.visualizationType == 'distorted') {
			return title + ' (Distorted)';
		} else {
			return title;
		}
	}
} as any);
