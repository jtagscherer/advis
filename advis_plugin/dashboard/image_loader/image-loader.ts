'use strict';

Polymer({
  is: 'image-loader',
	properties: {
		url: {
			type: String,
			observer: '_urlChanged'
		},
		width: {
			type: String,
			observer: '_widthChanged'
		},
		height: {
			type: String,
			observer: '_heightChanged'
		},
		_url: String,
		_loading: {
			type: Boolean,
			value: false
		}
	},
	
	_urlChanged: function(url) {
		this.set('_loading', true);
		this.set('_url', url);
	},
	
	_widthChanged: function(width) {
		this.customStyle['--image-width'] = width;
		this.updateStyles();
	},
	
	_heightChanged: function(height) {
		this.customStyle['--image-height'] = height;
		this.updateStyles();
	},
	
	_imageLoaded: function() {
		this.set('_loading', false);
	},
	
	_getSpinnerClass: function(loading) {
		if (loading) {
			return 'shown';
		} else {
			return 'hidden';
		}
	}
});
