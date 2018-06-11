'use strict';

Polymer({
  is: 'activation-visualization-settings-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		colorScaleName: String,
		
		eventId: {
			type: String,
			value: 'activation-visualization-settings-dialog'
		}
  },
	
	setContent: function(content) {
		this.colorScaleName = content.colorScaleName;
	},
	
	getContentOnDismiss: function() {
		return {
			colorScaleName: this.colorScaleName
		};
	}
});
