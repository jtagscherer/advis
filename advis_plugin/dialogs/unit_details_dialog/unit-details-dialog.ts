'use strict';

Polymer({
  is: 'unit-details-dialog',
  properties: {
    model: Object,
		unit: Object
  },

  open() {
		this.$$('paper-dialog').open();
	}
});
