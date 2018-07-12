'use strict';

Polymer({
  is: 'dialog-header',
	properties: {
		eventId: String,
		modal: {
			type: Boolean,
			value: false
		}
	},
	
	closeButtonClicked: function() {
		this.fire('closeButtonClickedEvent', {
      eventId: this.eventId
    });
	}
});
