'use strict';

Polymer({
  is: 'side-by-side',
	
	behaviors: [
		VisualizationComparisonBehavior,
		(Polymer as any).NeonAnimatableBehavior
	],
	
	tileTapped: function(e) {
		var unitTitle = `Tensor ${Number(e.target.dataset.args) + 1}`;
		
		if (this.distortion != null) {
			unitTitle += ' (Distorted)'
		}
		
		// Show the enlarged image tile in a dialog
		this.$$('unit-details-dialog').open({
			model: {
				title: this.model.displayName,
				caption: `Version ${this.model.version}`
			},
			unit: {
				title: unitTitle,
				caption: this.layer
			},
			// TODO: Choose the right URL array and index
			url: this.normalUrls[e.target.dataset.args % 5],
			animationTarget: e.target.getBoundingClientRect()
		});
	}
} as any);
