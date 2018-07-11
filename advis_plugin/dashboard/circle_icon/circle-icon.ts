'use strict';

Polymer({
  is: 'circle-icon',
	properties: {
		icon: String,
		text: String
	},
	
	_displayIcon: function(icon) {
		return icon != null;
	},
	
	_displayText: function(text) {
		return text != null;
	}
});
