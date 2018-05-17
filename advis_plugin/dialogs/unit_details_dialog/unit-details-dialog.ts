'use strict';

Polymer({
  is: 'unit-details-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
    model: Object,
		unit: Object,
		imageUrl: String,
		
		eventId: {
			type: String,
			value: 'unit-details-dialog'
		}
  },
	
	setContent: function(content) {
		this.model = content.model;
		this.unit = content.unit;
		this.imageUrl = content.url;
	}
});
