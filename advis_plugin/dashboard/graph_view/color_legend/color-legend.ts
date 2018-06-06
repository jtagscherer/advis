'use strict';

Polymer({
  is: 'color-legend',
	properties: {
		state: {
			type: String,
			value: 'empty'
		},
		colorScale: {
			type: Object,
			observer: 'reload'
		},
		valueRange: Object,
		selectedValue: {
			type: Object,
			notify: true
		},
		
		_gradientColors: Array
	},
	
	reload: function() {
		if (this.colorScale == null) {
			return;
		}
		
		// Update the color scale gradients
		this.set('_gradientColors', []);
		
		var gradientColors = [];
		for (var index = 0; index < 50; index += 1) {
			gradientColors.push(this.colorScale((49 - index) / 50.0).hex());
		}
		
		this.set('_gradientColors', gradientColors);
	},
	
	_getFormattedNumber: function(value) {
		return Math.round(value);
	},
	
	_getSelectionHeight: function(selectedValue) {
		let textHeight = 12;
		let containerHeight = 100 - textHeight;
		
		var percentage;
		
		if (selectedValue == null) {
			percentage = 0.5;
		} else {
			percentage = selectedValue.percentual;
		}
		
		var height = containerHeight * percentage;
		height = Math.min(Math.max(height, 0), containerHeight);
		
		return `bottom: ${height}px;`;
	},
	
	_getGradientColor: function(item) {
		return `background-color: ${item};`;
	},
	
	_getSelectionClass: function(selectedValue) {
		if (selectedValue != null && typeof selectedValue === 'object') {
			return 'caption visible';
		} else {
			return 'caption invisible';
		}
	},
	
	_getLegendClass: function(state) {
		if (state == 'loaded') {
			return 'visible';
		} else {
			return 'invisible';
		}
	},
	
	_getSpinnerClass: function(state) {
		if (state == 'loading') {
			return 'visible';
		} else {
			return 'invisible';
		}
	}
});
