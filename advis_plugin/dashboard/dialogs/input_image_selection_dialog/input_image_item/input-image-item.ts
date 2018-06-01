'use strict';

Polymer({
  is: 'input-image-item',
	properties: {
		image: Object,
		selected: {
			type: Boolean,
			observer: '_selectionChanged'
		}
	},
	
	_selectionChanged: function() {
		if (this.selected) {
			this.$$('paper-card').elevation = 3;
		} else {
			this.$$('paper-card').elevation = 1;
		}
	},
	
	_getClass: function(selected, type) {
		var computedClass = '';
		
		if (type == 'card') {
			computedClass += 'card-content';
			
			if (this.selected) {
				computedClass += ' selected-card';
			}
		} else if (type == 'title') {
			computedClass += 'single-line title';
			
			if (this.selected) {
				computedClass += ' selected-text';
			}
		} else if (type == 'caption') {
			computedClass += 'single-line monospaced caption';
			
			if (this.selected) {
				computedClass += ' selected-text';
			}
		}
		
		return computedClass;
	}
});
