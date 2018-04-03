'use strict';

Polymer({
  is: 'unit-details-dialog',
  properties: {
    model: Object,
		unit: Object
  },

  open(content) {
		this.model = content.model;
		this.unit = content.unit;
		
		this.$$('paper-dialog').open();
	}
});
