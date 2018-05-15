'use strict';

Polymer({
  is: 'model-metric',
	properties: {
		title: String,
		value: Number,
		percent: {
			type: Boolean,
			value: true
		}
	},
	
	_getFormattedValue(value, percent) {
		let roundedValue = (Math.round(value * 100) / 100.0).toFixed(2);
		
		if (percent) {
			return `${(Number(roundedValue) * 100).toFixed(0)}%`;
		} else {
			return roundedValue;
		}
	},
	
	_getTextClass(value) {
		if (value < 0) {
			return 'single-line number negative';
		} else {
			return 'single-line number positive';
		}
	}
});
