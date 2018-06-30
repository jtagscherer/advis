'use strict';

Polymer({
  is: 'distortion-configuration-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		distortions: Array,
		requestManager: Object,
		eventId: {
			type: String,
			value: 'distortion-configuration-dialog'
		},
		_selectedDistortion: {
			type: Number,
			value: 0
		} 
  },
	
	_getSelectedDistortion: function(distortions, _selectedDistortion) {
		return distortions[_selectedDistortion];
	},
	
	_isLastDistortionListItem: function(index) {
		return index == this.distortions.length - 1;
	},
	
	setContent: function(content) {
		this.distortions = content.distortions;
		this.requestManager = content.requestManager;
	},
	
	getContentOnDismiss: function() {
		// TODO
	}
});
