'use strict';

Polymer({
  is: 'detailed-predictions-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		model: String,
		imageIndex: Number,
		distortion: String,
		
		eventId: {
			type: String,
			value: 'detailed-predictions-dialog'
		}
  },
	
	setContent: function(content) {
		this.model = content.model;
		this.imageIndex = content.imageIndex;
		this.distortion = content.distortion;
	}
});
