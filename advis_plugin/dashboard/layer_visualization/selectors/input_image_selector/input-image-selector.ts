'use strict';

Polymer({
  is: 'input-image-selector',
	
  properties: {
		selectedImage: {
			type: Object,
			notify: true
		},
		selectedDistortion: Object,
		selectedModel: Object,
		associatedDataset: Object,
		availableImages: Array,
		requestManager: Object
	},
	
	listeners: {
    'dialogReturnedEvent': '_handleDialogReturnedEvent'
  },
	
	tapped: function() {
		// Open a dialog that lets the user view all input images and select one
		if (this.hasValidData()) {
			this.$$('input-image-selection-dialog').open({
				model: this.selectedModel,
				distortion: this.selectedDistortion,
				dataset: this.associatedDataset,
				selectedImageIndex: this.selectedImage.index,
				requestManager: this.requestManager,
				animationTarget: this.$$('#left').getBoundingClientRect()
			});
		}
	},
	
	hasValidData: function() {
		return this.associatedDataset != null && this.availableImages != null
			&& this.availableImages.length > 0;
	},
	
	_handleDialogReturnedEvent: function(e) {
		if (e.detail.eventId === 'input-image-selection-dialog') {
			let selectedImageIndex = e.detail.content;
			
			for (let image of this.availableImages) {
				if (image.index == selectedImageIndex) {
					this.set('selectedImage', image);
					return;
				}
			}
		}
	}
});
