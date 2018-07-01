'use strict';

Polymer({
  is: 'distortion-configuration-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		distortions: Array,
		modifiedDistortions: Array,
		requestManager: Object,
		eventId: {
			type: String,
			value: 'distortion-configuration-dialog'
		},
		_selectedDistortionIndex: {
			type: Number,
			value: 0
		}
  },
	
	listeners: {
		'parametersChangedEvent': '_parametersChanged'
	},
	
	_parametersChanged: function(e) {
		if (this.modifiedDistortions == null) {
			return;
		}
		
		this.modifiedDistortions[e.detail.distortionIndex].parameters =
			e.detail.parameters;
	},
	
	_getSelectedDistortion: function(distortions, _selectedDistortionIndex) {
		return distortions[_selectedDistortionIndex];
	},
	
	_isLastDistortionListItem: function(index) {
		return index == this.distortions.length - 1;
	},
	
	setContent: function(content) {
		this.distortions = content.distortions;
		this.requestManager = content.requestManager;
		
		// Copy the original distortions to allow lossless modification
		this.set('modifiedDistortions', JSON.parse(JSON.stringify(
			this.distortions)));
		this.set('_selectedDistortionIndex', 0);
	},
	
	getContentOnDismiss: function() {
		// TODO
	}
});
