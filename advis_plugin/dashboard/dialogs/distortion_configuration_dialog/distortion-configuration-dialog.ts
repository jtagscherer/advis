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
			value: 0,
			observer: '_selectedDistortionChanged'
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
		this._updateResetButtonOpacity();
		this.$$('#distortion-preview').reload();
	},
	
	_selectedDistortionChanged: function() {
		this._updateResetButtonOpacity();
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
	
	_isNotDirty: function() {
		return this._getModifiedDistortionNames(this.distortions,
			this.modifiedDistortions).length == 0;
	},
	
	_isLastDistortionListItem: function(index) {
		return index == this.distortions.length - 1;
	},
	
	_updateResetButtonOpacity: function() {
		if (this.distortions == null || this.modifiedDistortions == null) {
			this.customStyle['--reset-button-opacity'] = '0';
		} else {
			if (this._hasBeenChanged(this.distortions
				[this._selectedDistortionIndex])) {
				this.customStyle['--reset-button-opacity'] = '1';
			} else {
				this.customStyle['--reset-button-opacity'] = '0';
			}
		}
		
		this.updateStyles();
	},
	
	resetDistortion: function(e) {
		const distortionIndex = e.target.getAttribute('data-args');
		
		this.set(
			'modifiedDistortions.' + distortionIndex + '.parameters',
			JSON.parse(JSON.stringify(this.distortions[distortionIndex].parameters))
		);
		
		this.set('_dirty', !this._dirty);
		this._updateResetButtonOpacity();
	},
	
	setContent: function(content) {
		this.distortions = content.distortions;
		this.requestManager = content.requestManager;
		
		// Copy the original distortions to allow lossless modification
		this.set('modifiedDistortions', JSON.parse(JSON.stringify(
			this.distortions)));
		this.set('_selectedDistortionIndex', 0);
		this.$$('#distortion-list').render();
		
		this.set('_dirty', !this._dirty);
		this._updateResetButtonOpacity();
	},
	
	getContentOnApply: function() {
		var result = [];
		
		for (var distortion of this.modifiedDistortions) {
			if (this._hasBeenChanged(distortion)) {
				result.push(distortion);
			}
		}
		
		return result;
	}
});
