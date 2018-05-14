'use strict';

Polymer({
  is: 'distortion-selector',
	
  properties: {
		selectedDistortion: {
			type: Object,
			notify: true
		},
		availableDistortions: Array
	},
	
	_distortionSelected: function(e) {
		this.selectedDistortion = this.availableDistortions[e.detail.item.value];
	},
	
	hasValidData: function() {
		return this.availableDistortions != null
			&& this.availableDistortions.length > 0;
	}
});
