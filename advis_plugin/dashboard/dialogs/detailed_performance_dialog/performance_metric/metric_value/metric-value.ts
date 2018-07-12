'use strict';

Polymer({
  is: 'metric-value',
	properties: {
		name: String,
		value: Number,
		originalValue: Number,
		percent: {
			type: Boolean,
			value: false
		}
	},
	
	_formatValue: function(value, percent) {
		let roundedValue = (Math.round(value * 100) / 100.0).toFixed(2);
		
		if (percent) {
			return `${(Number(roundedValue) * 100).toFixed(0)}%`;
		} else {
			return roundedValue;
		}
	},
	
	_getFormattedValue: function(value, percent) {
		return this._formatValue(value, percent);
	},
	
	_getFormattedDelta: function(value, originalValue, percent) {
		if (originalValue == null) {
			return 'lol';
		} else {
			return this._formatValue(value - originalValue, percent);
		}
	},
	
	_getTextClass: function(value, originalValue) {
		if ((value - originalValue) < 0) {
			return 'single-line number negative';
		} else {
			return 'single-line number positive';
		}
	}
});
