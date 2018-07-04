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
	
	_initializeAvailableMetrics: function() {
		var _availableMetrics = [];
		
		for (const metric of this.availableMetrics) {
			_availableMetrics.push({
				name: metric.name,
				description: metric.description,
				inModelList: this.selectedModelListMetrics.includes(metric.name)
			});
		}
		
		this.set('availableMetrics', _availableMetrics);
	},
	
	setContent: function(content) {
		this.selectedRadarChartMetric = content.selectedRadarChartMetric;
		this.selectedModelListMetrics = content.selectedModelListMetrics;
		this.availableMetrics = content.availableMetrics;
		
		this._initializeAvailableMetrics();
	},
	
	getContentOnDismiss: function() {
		var _selectedModelListMetrics = [];
		for (const metric of this.availableMetrics) {
			if (metric.inModelList) {
				_selectedModelListMetrics.push(metric.name);
			}
		}
		
		return {
			selectedRadarChartMetric: this.selectedRadarChartMetric,
			selectedModelListMetrics: _selectedModelListMetrics
		};
	}
});
