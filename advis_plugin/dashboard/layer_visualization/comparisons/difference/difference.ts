'use strict';

declare var resemble: any;

Polymer({
  is: 'difference-comparison',
	
	properties: {
		_differenceImageUrl: String,
		_differenceImageLoaded: Boolean,
		differenceMode: {
			type: String,
			value: 'difference-highlight',
			observer: '_calculateImageDifferences'
		}
	},
	
	behaviors: [
		VisualizationComparisonBehavior,
		(Polymer as any).NeonAnimatableBehavior
	],
	
	getImageContainerSize: function() {
		return {
			width: this.$$('#container').offsetWidth,
			height: this.$$('#container').offsetHeight
		};
	},
	
	getImageClass: function(condition) {
		if (this.state == 'loaded') {
			return 'visible';
		} else {
			return 'invisible';
		}
	},
	
	sizeChanged: function() {
		this._calculateImageDifferences();
	},
	
	stateChanged: function(state) {
		this._calculateImageDifferences();
	},
	
	_updateState: function() {
		if (this._originalMetaData == null || this._distortedMetaData == null) {
			this.set('state', 'loading');
		} else if (Object.keys(this._originalMetaData).length == 0
			|| Object.keys(this._distortedMetaData).length == 0) {
			this.set('state', 'empty');
		} else if (!this._differenceImageLoaded) {
			this.set('state', 'loading');
		} else {
			this.set('state', 'loaded');
		}
	},
	
	_differenceImageCallback: function() {
		this.set('_differenceImageLoaded', true);
		this._updateState();
	},
	
	_calculateImageDifferences: function() {
		if (this.state == 'empty' || this._originalImageUrl == null
			|| this._distortedImageUrl == null) {
			return;
		}
		
		this.set('_differenceImageUrl', null);
		this.set('_differenceImageLoaded', false);
		
		let self = this;
		
		// Set up the Resemble comparator
		var resembleControl = resemble(this._originalImageUrl)
			.compareTo(this._distortedImageUrl)
			.ignoreColors();
		
		// Configure the comparator
		var outputSettings = {
			errorColor: {
				red: 244,
				green: 112,
				blue: 0
			}
		};
		
		switch (this.differenceMode) {
			case 'difference-highlight':
				outputSettings['errorType'] = 'flat';
				break;
			case 'difference-intensity-highlight':
				outputSettings['errorType'] = 'flatDifferenceIntensity';
				break;
			case 'only-difference':
				outputSettings['errorType'] = 'diffOnly';
				break;
		}
		
		resembleControl.outputSettings(outputSettings);
		
		// Perform the comparison asynchronously and update the displayed image as 
		// soon as it is loaded
		resembleControl.onComplete(function(data) {
			self.set('_differenceImageUrl', data.getImageDataUrl());
		});
	}
} as any);
