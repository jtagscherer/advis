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
		percent: {
			type: Boolean,
			value: false
		},
		outlined: {
			type: Boolean,
			value: false
		},
		caption: {
			type: String,
			value: ''
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
		}
	},
	
	reload: function() {
		if (this.colorScale == null) {
			return;
		}
		
		this.customStyle['--legend-width'] = `${this.width}px`;
		this.customStyle['--legend-height'] = `${this.height}px`;
		
		this.updateStyles();
		
		this._updateGradient();
	},
	
	_updateGradient: function() {
		let canvas = this.$$('#gradient');
		let context = canvas.getContext('2d');
		
		for (var y = 0; y < canvas.height; y += this.resolution) {
			context.fillStyle = this.colorScale(1 - (y / canvas.height)).hex();
			context.fillRect(0, y, canvas.width, this.resolution);
		}
	},
	
	_isCaptionVisible: function(caption) {
		return caption != '';
	},
	
	_getFormattedNumber: function(value) {
		let formattedNumber = Math.round(value);
		
		if (this.percent) {
			return `${formattedNumber}%`;
		} else {
			return formattedNumber;
		}
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
	
	_getSelectionClass: function(selectedValue) {
		var baseClass = 'caption';
		if (this.outlined) {
			baseClass = `${baseClass} outlined`;
		}
		
		if (selectedValue != null && typeof selectedValue === 'object') {
			return `${baseClass} visible`;
		} else {
			return `${baseClass} invisible`;
		}
	},
	
	_getTextClass: function(outlined, prefix) {
		if (outlined) {
			return `${prefix} outlined`;
		} else {
			return prefix;
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
