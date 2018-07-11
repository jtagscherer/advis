'use strict';

Polymer({
  is: 'distorted-image-item',
	properties: {
		imageUrl: String,
		certainty: {
			type: Number,
			observer: '_certaintyChanged'
		},
		index: Number,
		configuration: Object,
		parameters: Array,
		displayedParameter: Number,
		selected: {
			type: Boolean,
			observer: '_selectionChanged'
		}
	},
	
	_selectionChanged: function(selected) {
		if (selected) {
			this.$$('paper-card').elevation = 3;
		} else {
			this.$$('paper-card').elevation = 1;
		}
	},
	
	_certaintyChanged: function(certainty) {
		this.customStyle['--certainty-value'] = `${certainty * 100}%`;
		this.updateStyles();
	},
	
	_getParameterValue: function(displayedParameter, certainty, index,
		parameters, configuration) {
		if (displayedParameter == 0) {
			// Display the certainty
			return this._getFormattedValue(certainty);
		} else if (displayedParameter == 1) {
			// Display the index
			return index;
		} else {
			if (parameters == null || configuration == null) {
				return '';
			}
			
			// Display a parameter value
			let parameterName = parameters[displayedParameter - 2].name;
			
			for (let parameter of configuration) {
				if (parameter.name == parameterName) {
					return parameter.value;
				}
			}
		}
		
		return '';
	},
	
	_getFormattedValue: function(value) {
		let roundedValue = (Math.round(value * 10000) / 10000.0).toFixed(4);
		if (Number(roundedValue) * 100 < 0.01) {
			return '<0.01%';
		} else {
			return `${(Number(roundedValue) * 100).toFixed(2)}%`;
		}
	}
});
