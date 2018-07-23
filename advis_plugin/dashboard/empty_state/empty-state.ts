'use strict';

Polymer({
  is: 'empty-state',
	properties: {
		icon: String,
		headline: String,
		caption: String
	},
	
	_displayComponent: function(component) {
		return component != null;
	}
});
