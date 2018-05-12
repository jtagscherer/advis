'use strict';

Polymer({
  is: 'input-image-selector',
	
  properties: {
		selectedImage: Object,
		associatedDataset: Object,
		availableImages: Array
	},
	
	listeners: {
    'dialogReturnedEvent': '_handleDialogReturnedEvent'
  },
	
	tapped: function() {
		// Open a dialog that lets the user view all input images and select one
		if (this.hasValidData()) {
			this.$$('input-image-selection-dialog').open({
				dataset: this.associatedDataset,
				availableImages: this.availableImages,
				selectedImage: this.selectedImage,
				animationTarget: this.$$('#left').getBoundingClientRect()
			});
		}
	},
	
	hasValidData: function() {
		return this.associatedDataset != null && this.availableImages != null
			&& this.availableImages.length > 0;
	},
	
	_handleDialogReturnedEvent(e) {
		if (e.detail.eventId === 'input-image-selection-dialog') {
			this.selectedImage = e.detail.content;
		}
	}
});
