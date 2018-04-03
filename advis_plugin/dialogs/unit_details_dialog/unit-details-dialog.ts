'use strict';

Polymer({
  is: 'unit-details-dialog',
	listeners: {
    'closeButtonClickedEvent': '_handleCloseEvent'
  },
  properties: {
    model: Object,
		unit: Object,
		imageUrl: String
  },

  open(content) {
		this.model = content.model;
		this.unit = content.unit;
		this.imageUrl = content.url;
		
		this.$$('paper-dialog').open();
	},
	close() {
		this.$$('paper-dialog').close();
	},
	
	_handleCloseEvent(e) {
		if (e.detail.eventId === 'unit-details-dialog') {
			this.close();
		}
	}
});
