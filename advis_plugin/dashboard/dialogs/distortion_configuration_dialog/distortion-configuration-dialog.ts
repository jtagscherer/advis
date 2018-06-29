'use strict';

Polymer({
  is: 'distortion-configuration-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		eventId: {
			type: String,
			value: 'distortion-configuration-dialog'
		}
  },
	
	setContent: function(content) {
		// TODO
	},
	
	getContentOnDismiss: function() {
		// TODO
	}
});
