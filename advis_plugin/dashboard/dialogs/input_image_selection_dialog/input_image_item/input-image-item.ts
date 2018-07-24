'use strict';

Polymer({
  is: 'input-image-item',
	properties: {
		image: {
			type: Object,
			observer: '_imageChanged'
		},
		selected: {
			type: Boolean,
			observer: '_selectionChanged'
		},
		_certaintyDifferenceNegative: {
			type: Boolean,
			value: false
		}
	},
	
	_imageChanged: function(image) {
		if (image == null) {
			return;
		}
		
		// Update the size of the certainty bars
		this.customStyle['--original-certainty-value']
			= `${image.certainty.original * 100}%`;
		this.customStyle['--distorted-certainty-value']
			= `${image.certainty.distorted * 100}%`;
		this.customStyle['--certainty-difference-value']
			= `${(Math.abs(image.certainty.difference) / 2) * 100}%`;
		
		this.set('_certaintyDifferenceNegative', image.certainty.difference < 0);
		
		this.updateStyles();
	},
	
	_selectionChanged: function() {
		if (this.selected) {
			this.$$('paper-card').elevation = 3;
		} else {
			this.$$('paper-card').elevation = 1;
		}
	},
	
	_getCertaintyDifferenceBarClass: function(negative) {
		let baseClass = 'certainty-bar';
		
		if (negative) {
			return `${baseClass} negative`;
		} else {
			return `${baseClass} positive`;
		}
	},
	
	_getFormattedValue: function(value) {
		let roundedValue = (Math.round(value * 10000) / 10000.0).toFixed(4);
		let percentage = Number(roundedValue) * 100;
		
		if (percentage < 0.01 && percentage > 0) {
			return '<0.01%';
		} else if (percentage > -0.01 && percentage < 0) {
			return '>-0.01%';
		} else {
			return `${percentage.toFixed(2)}%`;
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
			computedClass += 'single-line caption';
			
			if (this.selected) {
				computedClass += ' selected-text';
			}
		} else if (type == 'certainty-bar') {
			computedClass += 'certainty-bar';
			
			if (this.selected) {
				computedClass += ' selected';
			}
		}
		
		return computedClass;
	}
});
