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
		displayLegend: {
			type: Boolean,
			notify: true
		},
		onlyGradient: {
			type: Boolean,
			value: false
		},
		width: {
			type: Number,
			value: 20,
			observer: 'reload'
		},
		height: {
			type: Number,
			value: 100,
			observer: 'reload'
		},
		resolution: {
			type: Number,
			value: 1,
			observer: 'reload'
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
		let colorAmount = this.height / this.resolution;
		for (var index = 0; index < colorAmount; index += 1) {
			gradientColors.push(
				this.colorScale((colorAmount - index) / colorAmount).hex()
			);
		}
		
		this.set('_gradientColors', gradientColors);
		
		this.customStyle['--legend-width'] = `${this.width}px`;
		this.customStyle['--legend-height'] = `${this.height}px`;
		this.customStyle['--legend-resolution'] = `${this.resolution}px`;
		
		this.updateStyles();
	},
	
	_getFormattedNumber: function(value) {
		return Math.round(value);
	},
	
	_getSelectionHeight: function(selectedValue) {
		let textHeight = 12;
		let containerHeight = this.height - textHeight;
		
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
	
	_getLegendClass: function(state, displayLegend) {
		if (!displayLegend) {
			return 'invisible';
		}
		
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
