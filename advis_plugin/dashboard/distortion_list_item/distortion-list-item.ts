'use strict';

Polymer({
  is: 'distortion-list-item',
	properties: {
		compact: {
			type: Boolean,
			value: false
		},
		highlighted: {
			type: Boolean,
			value: false,
			observer: '_updateStyles'
		},
		lastItem: {
			type: Boolean,
			value: false
		},
		distortion: Object
	},
	
	_getTitle: function(distortion) {
		if (this.highlighted) {
			return distortion.displayName + ' *';
		} else {
			return distortion.displayName;
		}
	},
	
	_updateStyles: function() {
		if (this.highlighted) {
			this.customStyle['--title-style'] = 'italic';
		} else {
			this.customStyle['--title-style'] = 'normal';
		}
		
		this.updateStyles();
	}
});
