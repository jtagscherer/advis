'use strict';

Polymer({
  is: 'distortion-list-item',
	properties: {
		compact: {
			type: Boolean,
			value: false
		},
		lastItem: {
			type: Boolean,
			value: false
		},
		distortion: Object
	}
});
