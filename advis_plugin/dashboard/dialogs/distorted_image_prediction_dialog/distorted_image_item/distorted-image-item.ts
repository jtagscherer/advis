'use strict';

Polymer({
  is: 'distorted-image-item',
	properties: {
		imageUrl: String,
		certainty: {
			type: Number,
			observer: '_certaintyChanged'
		}
	},
	
	_certaintyChanged: function(certainty) {
		this.customStyle['--certainty-value'] = `${certainty * 100}%`;
		this.updateStyles();
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
