'use strict';

Polymer({
  is: 'input-image-selection-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		dataset: Object,
		availableImages: Array,
		selectedImage: Object,
		eventId: {
			type: String,
			value: 'input-image-selection-dialog'
		}
  },
	
	setContent(content) {		
		this.dataset = content.dataset;
		this.availableImages = content.availableImages;
		this.selectedImage = content.selectedImage;
		
		this.$$('iron-list').selectItem(this.selectedImage);
	},
	
	getContentOnDismiss() {
		return this.selectedImage;
	}
});
