'use strict';

Polymer({
  is: 'color-legend',
	properties: {
		state: {
			type: String,
			value: 'empty'
		}
	},
	
	_getSpinnerClass(state) {
		if (state == 'loading') {
			return 'visible';
		} else {
			return 'invisible';
		}
	}
});
