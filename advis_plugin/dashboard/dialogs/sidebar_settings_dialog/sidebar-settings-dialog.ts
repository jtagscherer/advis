'use strict';

Polymer({
  is: 'sidebar-settings-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		selectedRadarChartMetric: String,
		selectedModelListMetrics: Array,
		availableMetrics: Array,
		
		eventId: {
			type: String,
			value: 'sidebar-settings-dialog'
		}
  },
	
	setContent: function(content) {
		this.selectedRadarChartMetric = content.selectedRadarChartMetric;
		this.selectedModelListMetrics = content.selectedModelListMetrics;
		this.availableMetrics = content.availableMetrics;
	},
	
	getContentOnDismiss: function() {
		return {
			selectedRadarChartMetric: this.selectedRadarChartMetric,
			selectedModelListMetrics: this.selectedModelListMetrics
		};
	}
});
