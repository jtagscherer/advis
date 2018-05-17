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
		distortions: {
			type: Array,
			observer: '_calculateAccuracyDifference'
		},
		accuracyCalculationFlag: {
			type: Boolean,
			observer: '_calculateAccuracyDifference'
		},
		lastItem: Boolean,
		_selected: Boolean,
		_modelAccuracyDifference: Number
	},
	
	_modelChanged: function() {
		this._selected = this.model.selectedForStatistics;
		this.$$('#checkbox').checked = this._selected;
		
		this._calculateAccuracyDifference();
	},
	
	_computeTitleStyle: function(model, _selected) {
		if (_selected) {
			return `color: #${model.color};`;
		} else {
			return '';
		}
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
	
	_calculateAccuracyDifference: function() {
		if (this.model == null || this.distortions == null) {
			return;
		}
		
		// Only calculate the accuracy difference if accuracies for all selected 
		// distortions and the original input have been retrieved
		if (Object.keys(this.model.accuracy).length >= this.distortions
			.length + 1 && 'original' in this.model.accuracy) {
			if (this.distortions.length == 0) {
				this._modelAccuracyDifference = 0;
			} else {
				var deltaSum = 0;
				
				// Calculate the difference between the accuracy of each distorted 
				// prediction and the original one
				for (let selectedDistortion in this.distortions) {
					for (let distortion in this.model.accuracy) {
						if (distortion == this.distortions[selectedDistortion].name) {
							deltaSum += (this.model.accuracy[distortion].top5 
								- this.model.accuracy.original.top5);
							break;
						}
					}
				}
				
				// Calculate the average of the differences
				let result = (deltaSum * 1.0)
				 	/ (Object.keys(this.model.accuracy).length - 1);
				
				// Finally, set the variable that will be shown
				this._modelAccuracyDifference = result;
			}
		} else {
			this._modelAccuracyDifference = undefined;
		}
	}
});
