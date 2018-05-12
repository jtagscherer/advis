'use strict';

Polymer({
  is: 'input-image-selection-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		dataset: Object,
		availableImages: Array,
		eventId: {
			type: String,
			value: 'input-image-selection-dialog'
		}
  },
	
	setContent(content) {
		this.dataset = content.dataset;
		this.availableImages = content.availableImages;
	}
});
