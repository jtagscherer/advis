'use strict';

Polymer({
  is: 'prediction-category',
	properties: {
		name: String,
		value: Number
	},
	
	_getFormattedValue: function(value) {
		let roundedValue = (Math.round(value * 10000) / 10000.0).toFixed(4);
		if (Number(roundedValue) * 100 < 0.01) {
			return '<0.01%';
		} else {
			return `${(Number(roundedValue) * 100).toFixed(2)}%`;
		}
	},
	
	_getPercentage: function(value) {
		return value * 100;
	}
});
