'use strict';

Polymer({
  is: 'unit-details-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		model: Object,
		layer: String,
		imageIndex: Number,
		distortion: Object,
		unitIndex: Number,
		requestManager: Object,
		
    modelDescription: Object,
		unitDescription: Object,
		
		selectedPage: {
			type: Number,
			value: 0,
			observer: 'reload'
		},
		
		eventId: {
			type: String,
			value: 'unit-details-dialog'
		}
  },
	
	setContent: function(content) {
		this.model = content.model;
		this.layer = content.layer;
		this.imageIndex = content.imageIndex;
		this.distortion = content.distortion;
		this.unitIndex = content.unitIndex,
		this.requestManager = content.requestManager;
		
		this.modelDescription = content.modelDescription;
		this.unitDescription = content.unitDescription;
		this.selectedPage = content.selectedPage;
		
		let self = this;
		setTimeout(function() {
			self.reload();
		}, 500);
	},
	
	reload: function() {
		// Reload the currently active layer visualization comparison component
		let comparisonComponent = this.$$(this._getActiveComparisonComponentName());
		
		if (comparisonComponent != null) {
			comparisonComponent.reload();
		}
	},
	
	_getActiveComparisonComponentName: function() {
		switch(this.selectedPage) {
			case 0:
				return 'side-by-side-comparison';
			case 1:
				return 'swipe-comparison';
			case 2:
				return 'crossfade-comparison';
			case 3:
				return 'difference-comparison';
		}
	}
});
