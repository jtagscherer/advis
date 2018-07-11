'use strict';

Polymer({
  is: 'circle-icon',
	properties: {
		icon: String,
		text: String,
		fontSize: {
			type: Number,
			value: 16,
			observer: '_updateStyles'
		}
	},
	
	_displayIcon: function(icon) {
		return icon != null;
	},
	
	_displayText: function(text) {
		return text != null;
	},
	
	_updateStyles: function() {
		this.customStyle['--font-size'] = `${this.fontSize}px`;
		this.updateStyles();
	}
});
