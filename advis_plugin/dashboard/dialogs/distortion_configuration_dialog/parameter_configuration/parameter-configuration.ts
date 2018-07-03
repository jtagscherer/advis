'use strict';

Polymer({
  is: 'parameter-configuration',
	properties: {
		index: Number,
		parameters: Array
	},
	
	observers: [ 
		'_parametersChanged(parameters.*)'
	],
	
	_parametersChanged: function(value) {
		this.fire('parametersChangedEvent', {
			distortionIndex: this.index,
			parameters: this.parameters
		});
	},
	
	_isType: function(parameter, type) {
		return parameter.type == type;
	}
});
