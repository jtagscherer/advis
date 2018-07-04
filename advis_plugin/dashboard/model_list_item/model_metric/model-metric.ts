'use strict';

Polymer({
  is: 'model-metric',
	properties: {
		name: String,
		description: String,
		value: Number,
		percent: {
			type: Boolean,
			value: false
		}
	},
	
	_getFormattedValue: function(value, percent) {
		let roundedValue = (Math.round(value * 100) / 100.0).toFixed(2);
		
		if (percent) {
			return `${(Number(roundedValue) * 100).toFixed(0)}%`;
		} else {
			return roundedValue;
		}
	},
	
	_getTextClass: function(value) {
		if (value < 0) {
			return 'single-line number negative';
		} else {
			return 'single-line number positive';
		}
	}
});
