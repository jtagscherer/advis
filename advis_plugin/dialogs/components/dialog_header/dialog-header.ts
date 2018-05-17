'use strict';

Polymer({
  is: 'dialog-header',
	properties: {
		eventId: String
	},
	
	closeButtonClicked: function() {
		this.fire('closeButtonClickedEvent', {
      eventId: this.eventId
    });
	}
});
