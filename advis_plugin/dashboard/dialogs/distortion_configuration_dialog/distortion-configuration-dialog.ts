'use strict';

Polymer({
  is: 'distortion-configuration-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		distortions: Array,
		eventId: {
			type: String,
			value: 'distortion-configuration-dialog'
		}
  },
	
	setContent: function(content) {
		this.distortions = content.distortions;
	},
	
	getContentOnDismiss: function() {
		// TODO
	}
});
