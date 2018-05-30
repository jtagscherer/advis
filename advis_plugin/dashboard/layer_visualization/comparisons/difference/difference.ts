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
	
	getDialogImageSource: function(data, callback) {
		// Retrieve the two tiles that will be compared
		let unitIndex = data.selectedTile.index;
		let originalUnit = this.getSingleTileImageUrl('original', unitIndex);
		let distortedUnit = this.getSingleTileImageUrl('distorted', unitIndex);
		
		// Set up the Resemble comparator
		var resembleControl = resemble(originalUnit)
			.compareTo(distortedUnit)
			.ignoreColors();
		resembleControl = this._configureResembleControl(resembleControl);
		
		// Perform the comparison and asynchronously return its result
		resembleControl.onComplete(function(data) {
			callback(data.getImageDataUrl());
		});
	},
	
	getDialogTitle: function(data) {
		let title = `Tensor ${Number(data.selectedTile.index) + 1}`;
		
		switch (this.differenceMode) {
			case 'difference-highlight':
				return title + ' (Difference Highlight)';
			case 'difference-intensity-highlight':
				return title + ' (Difference Intensity Highlight)';
			case 'only-difference':
				return title + ' (Only Difference)';
		}
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
		resembleControl = this._configureResembleControl(resembleControl);
		
		// Perform the comparison asynchronously and update the displayed image as 
		// soon as it is loaded
		resembleControl.onComplete(function(data) {
			self.set('_differenceImageUrl', data.getImageDataUrl());
		});
	},
	
	_configureResembleControl: function(resembleControl) {
		// Choose a color used to highlight differences
		var outputSettings = {
			errorColor: {
				red: 244,
				green: 112,
				blue: 0
			}
		};
		
		// Choose a difference mode based on the user's mode selection
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
		
		return resembleControl;
	}
} as any);
