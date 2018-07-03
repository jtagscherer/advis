'use strict';

Polymer({
  is: 'range-parameter',
	properties: {
		parameter: Object
	},
	
	_roundNumber(number) {
		return number.toFixed(1);
	}
});
