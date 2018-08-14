'use strict';

Polymer({
  is: 'detailed-performance-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
    model: Object,
		availableMetrics: Object,
		availableDistortions: Array,
		_metricList: Array,
		
		eventId: {
			type: String,
			value: 'detailed-performance-dialog'
		}
  },
	
	setContent: function(content) {
		this.model = content.model;
		this.availableMetrics = content.availableMetrics;
		this.availableDistortions = content.availableDistortions;
		
		this._generateMetricList();
	},
	
	_generateMetricList: function() {
		var metricList = [];
		
		for (let metric of this.availableMetrics) {
			var metricItem = {
				name: metric.name,
				displayName: metric.displayName,
				percent: metric.percent,
				values: {}
			};
			
			for (let distortion in this.model.metrics) {
				if (distortion == 'original') {
					metricItem.values['original'] = {
						value: this.model.metrics['original'][metric.name],
						displayName: 'Original'
					};
				} else {
					for (let availableDistortion of this.availableDistortions) {
						if (availableDistortion.name == distortion) {
							metricItem.values[distortion] = {
								value: this.model.metrics[distortion][metric.name],
								displayName: availableDistortion.displayName
							};
						}
					}
				}
			}
			
			metricList.push(metricItem);
		}
		
		this.set('_metricList', metricList);
	}
});
