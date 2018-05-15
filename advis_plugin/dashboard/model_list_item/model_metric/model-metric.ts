'use strict';

Polymer({
  is: 'model-metric',
	properties: {
		title: String,
		value: Number,
		percent: {
			type: Boolean,
			value: true
		},
		floatingPointPrecision: {
			type: Number,
			value: 2
		}
	},
	
	_getFormattedValue(value, percent, floatingPointPrecision) {
		let roundedValue = this._round(value, floatingPointPrecision);
		
		if (percent) {
			return `${roundedValue * 100}%`;
		} else {
			return String(roundedValue);
		}
	},
	
	_getTextClass(value) {
		if (value < 0) {
			return 'number negative';
		} else {
			return 'number positive';
		}
	},
	
	_round(number, precision) {
		var shift = function(number, precision) {
			var numArray = ('' + number).split("e");
			return +(numArray[0] + 'e'
			 	+ (numArray[1] ? (+numArray[1] + precision) : precision));
		};
		
		return shift(Math.round(shift(number, +precision)), -precision);
	}
});
