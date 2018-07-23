'use strict';

Polymer({
  is: 'model-metric',
	properties: {
		name: String,
		description: String,
		value: {
			type: Number,
			observer: '_valueChanged'
		},
		percent: {
			type: Boolean,
			value: false
		},
		_loading: {
			type: Boolean,
			value: true
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
	},
	
	_valueChanged: function(value) {
		this.set('_loading', value == null);
	}
});
