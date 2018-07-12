'use strict';

Polymer({
  is: 'enum-parameter',
	properties: {
		parameter: Object
	},
	
	observers: [
	  '_valueChanged(parameter.value.name)'
	],

	_valueChanged: function(value) {
	  var displayName = null;
	  
	  for (const option of this.parameter.options) {
	    if (option.name == value) {
	      displayName = option.displayName;
	    }
	  }
	  
	  this.set('parameter.value.displayName', displayName);
	}
});
