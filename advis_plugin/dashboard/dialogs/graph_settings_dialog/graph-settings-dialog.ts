'use strict';

Polymer({
  is: 'graph-settings-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		displayMode: String,
		displayNodeInformation: Boolean,
		displayMinimap: Boolean,
		accumulationMethod: String,
		
		eventId: {
			type: String,
			value: 'graph-settings-dialog'
		}
  },
	
	setContent: function(content) {
		this.displayMode = content.displayMode;
		this.displayNodeInformation = content.displayNodeInformation;
		this.displayMinimap = content.displayMinimap;
		this.accumulationMethod = content.accumulationMethod;
	},
	
	getContentOnDismiss: function() {
		return {
			displayMode: this.displayMode,
			displayNodeInformation: this.displayNodeInformation,
			displayMinimap: this.displayMinimap,
			accumulationMethod: this.accumulationMethod,
			percentageMode: this.percentageMode
		};
	}
});
