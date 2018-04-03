'use strict';

Polymer({
  is: 'dialog-header',
	properties: {
		eventId: String
	},
	
	closeButtonClicked() {
		this.fire('closeButtonClickedEvent', {
      eventId: this.eventId
    });
	}
});
