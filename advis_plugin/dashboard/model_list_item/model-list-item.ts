'use strict';

Polymer({
  is: 'model-list-item',
	listeners: {
		'checkbox.down': '_onCheckboxDown'
	},
	properties: {
		model: {
			type: Object,
			observer: '_modelChanged',
			notify: true
		},
		metrics: Array,
		distortions: {
			type: Array,
			observer: '_updateAllMetrics'
		},
		accuracyCalculationFlag: {
			type: Boolean,
			observer: '_updateAllMetrics'
		},
		lastItem: Boolean,
		_selected: Boolean,
		_metricDifferences: {
			type: Object,
			value: {
				top5: undefined,
				top1: undefined,
				f1: undefined,
				precision: undefined,
				recall: undefined
			}
		}
	},
	
	_openDetailedPerformanceDialog: function(e) {
		this.fire('open-detailed-performance-dialog', {
			model: this.model,
			animationTarget: this.$$('#metrics').getBoundingClientRect()
		});
		
		e.stopPropagation();
	},
	
	_modelChanged: function() {
		this._selected = this.model.selectedForStatistics;
		this.$$('#checkbox').checked = this._selected;
		
		this._updateAllMetrics();
	},
	
	_computeTitleStyle: function(model, _selected) {
		if (_selected) {
			return `color: #${model.color};`;
		} else {
			return '';
		}
	},
	
	_displayMetric: function(metrics, metric) {
		return metrics.includes(metric);
	},
	
	_onCheckboxTapped: function(e) {
		// If only the checkbox has been toggled we do not want the model list item 
		// to be selected
		e.stopPropagation();
	},
	
	_onCheckboxDown: function(e) {
		// Stop the ripple animation for the whole container when only the checkbox 
		// has been toggled
		e.stopPropagation();
	},
	
	_updateSelectionStatus: function() {
		this._selected = this.$$('#checkbox').checked;
		
		// Fire an event to let the dashboard know that the selection has changed
		this.fire('model-statistics-selection-changed', {
			model: this.model,
			selected: this._selected
		});
	},
	
	_updateAllMetrics: function() {
		if (this.model == null || this.distortions == null ||
			this.model.metrics == null || !('original' in this.model.metrics)) {
			return;
		}
		
		for (const metric of Object.keys(this.model.metrics.original)) {
			this.set(
				`_metricDifferences.${metric}`,
				this._calculateMetricDifference(metric)
			);
		}
	},
	
	_calculateMetricDifference: function(name) {
		// Only calculate the metric difference if metrics for all selected 
		// distortions and the original input have been retrieved
		if (Object.keys(this.model.metrics).length >= this.distortions
			.length + 1 && 'original' in this.model.metrics) {
			if (this.distortions.length == 0) {
				return 0;
			} else {
				var deltaSum = 0;
				
				// Calculate the difference between the metric of each distorted 
				// prediction and the original one
				for (let selectedDistortion in this.distortions) {
					for (let distortion in this.model.metrics) {
						if (distortion == this.distortions[selectedDistortion].name) {
							deltaSum += (this.model.metrics[distortion][name] 
								- this.model.metrics.original[name]);
							break;
						}
					}
				}
				
				// Calculate the average of the differences
				let result = (deltaSum * 1.0)
				 	/ (Object.keys(this.model.metrics).length - 1);
				
				return result;
			}
		} else {
			return undefined;
		}
	}
});
