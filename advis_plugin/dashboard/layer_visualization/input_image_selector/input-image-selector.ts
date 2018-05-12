'use strict';

Polymer({
  is: 'input-image-selector',
	
  properties: {
		selectedImage: Object,
		associatedDataset: Object,
		availableImages: Array
	},
	
	tapped: function() {
		// Open a dialog that lets the user view all input images and select one
		if (this.hasValidData()) {
			this.$$('input-image-selection-dialog').open({
				dataset: this.associatedDataset,
				availableImages: this.availableImages,
				animationTarget: this.$$('#left').getBoundingClientRect()
			});
		}
	},
	
	hasValidData: function() {
		return this.associatedDataset != null && this.availableImages != null
			&& this.availableImages.length > 0;
	}
});
