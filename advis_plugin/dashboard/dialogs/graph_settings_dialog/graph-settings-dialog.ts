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
		displayLegend: Boolean,
		dataMode: String,
		accumulationMethod: String,
		colorScaleName: String,
		
		eventId: {
			type: String,
			value: 'graph-settings-dialog'
		}
  },
	
	setContent: function(content) {
		this.displayMode = content.displayMode;
		this.displayNodeInformation = content.displayNodeInformation;
		this.displayMinimap = content.displayMinimap;
		this.displayLegend = content.displayLegend;
		this.dataMode = content.dataMode;
		this.accumulationMethod = content.accumulationMethod;
		this.colorScaleName = content.colorScaleName;
	},
	
	getContentOnDismiss: function() {
		return {
			displayMode: this.displayMode,
			displayNodeInformation: this.displayNodeInformation,
			displayMinimap: this.displayMinimap,
			displayLegend: this.displayLegend,
			dataMode: this.dataMode,
			accumulationMethod: this.accumulationMethod,
			percentageMode: this.percentageMode,
			colorScaleName: this.colorScaleName
		};
	}
});
