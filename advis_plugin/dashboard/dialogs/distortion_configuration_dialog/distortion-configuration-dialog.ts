'use strict';

Polymer({
  is: 'distortion-configuration-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		distortions: Array,
		modifiedDistortions: Array,
		requestManager: Object,
		eventId: {
			type: String,
			value: 'distortion-configuration-dialog'
		},
		_selectedDistortionIndex: {
			type: Number,
			value: 0
		},
		_dirty: {
			type: Boolean,
			notify: true
		}
  },
	
	listeners: {
		'parametersChangedEvent': '_parametersChanged'
	},
	
	_parametersChanged: function(e) {
		if (this.modifiedDistortions == null) {
			return;
		}
		
		this.set(
			'modifiedDistortions.' + e.detail.distortionIndex + '.parameters',
			e.detail.parameters
		);
		
		this.set('_dirty', !this._dirty);
	},
	
	_getModifiedDistortionNames: function(originalDistortions,
		modifiedDistortions) {
		var modifiedDistortionNames = [];
		
		for (var i = 0; i < originalDistortions.length; i++) {
			const originalDistortion = originalDistortions[i];
			const modifiedDistortion = modifiedDistortions[i];
			
			if (!_.isEqual(originalDistortion, modifiedDistortion)) {
				modifiedDistortionNames.push(originalDistortion.name);
			}
		}
		
		return modifiedDistortionNames;
	},
	
	_getSelectedDistortion: function(distortions, _selectedDistortionIndex) {
		return distortions[_selectedDistortionIndex];
	},
	
	_hasBeenChanged: function(distortion) {
		return this._getModifiedDistortionNames(this.distortions,
			this.modifiedDistortions).includes(distortion.name);
	},
	
	_isLastDistortionListItem: function(index) {
		return index == this.distortions.length - 1;
	},
	
	setContent: function(content) {
		this.distortions = content.distortions;
		this.requestManager = content.requestManager;
		
		// Copy the original distortions to allow lossless modification
		this.set('modifiedDistortions', JSON.parse(JSON.stringify(
			this.distortions)));
		this.set('_selectedDistortionIndex', 0);
		this.$$('#distortion-list').render();
	}
});
