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
		for (var distortion of this.availableDistortions) {
			if (distortion.index == e.detail.item.distortionIndex) {
				this.set('selectedDistortion', distortion);
				break;
			}
		}
	},
	
	hasValidData: function() {
		return this.availableDistortions != null
			&& this.availableDistortions.length > 0;
	}
});
