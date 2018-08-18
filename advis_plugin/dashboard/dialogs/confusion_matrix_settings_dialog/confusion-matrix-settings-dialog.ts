'use strict';

Polymer({
  is: 'confusion-matrix-settings-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		selectedColorScaleOption: String,
		
		eventId: {
			type: String,
			value: 'confusion-matrix-settings-dialog'
		}
  },
	
	setContent: function(content) {
		this.selectedColorScaleOption = content.selectedColorScaleOption;
	},
	
	getContentOnDismiss: function() {
		return {
			selectedColorScaleOption: this.selectedColorScaleOption
		};
	}
});
