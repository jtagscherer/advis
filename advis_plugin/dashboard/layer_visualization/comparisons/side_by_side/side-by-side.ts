'use strict';

Polymer({
  is: 'side-by-side',
	
	properties: {
		tileSize: Number,
		_imagePadding: {
			type: Number,
			value: 2
		}
	},
	
	behaviors: [
		VisualizationComparisonBehavior,
		(Polymer as any).NeonAnimatableBehavior
	],
	
	urlsChanged: function(urlType) {
		this._updateTileSize();
	},
	
	sizeChanged: function() {
		this._updateTileSize();
	},
	
	_updateTileSize: function() {
		// In the following, tiles of normal and distorted images will be handled 
		// in the same way since their amounts and container sizes will always be 
		// equal.
		if (this.normalUrls == null || this.normalUrls.length == 0
			|| this.$$('#container') == null) {
			return;
		}
		
		// Get the minimum container size that we have to fill with tiles
		let containerSize = Math.min(
			this.$$('#container').offsetWidth / 2,
			this.$$('#container').offsetHeight
		)
		
		// Calculate the amount of images per row such that we get as close as 
		// possible to a square arrangement
		let imagesPerRow = Math.ceil(Math.sqrt(this.normalUrls.length));
		
		
		// Set the size of all individual image tiles
		this.set('tileSize', (containerSize / imagesPerRow) + this._imagePadding);
		
		// Finally, update the width of the image tile container to be able to 
		// center it horizontally
		this.customStyle['--image-container-width'] = 
			((imagesPerRow + 1) * (this.tileSize + this._imagePadding)) + 'px';
		this.updateStyles();
	},
	
	tileTapped: function(e) {
		let inputType = e.target.dataset.inputType;
		let unitIndex = e.target.dataset.unitIndex;
		
		var unitTitle = `Tensor ${Number(unitIndex) + 1}`;
		var unitImageUrl;
		
		if (inputType == 'distorted') {
			unitTitle += ' (Distorted)';
			unitImageUrl = this.distortedUrls[unitIndex];
		} else {
			unitImageUrl = this.normalUrls[unitIndex];
		}
		
		// Show the enlarged image tile in a dialog
		this.$$('unit-details-dialog').open({
			model: {
				title: this.model.displayName,
				caption: `Version ${this.model.version}`
			},
			unit: {
				title: unitTitle,
				caption: this.layer
			},
			url: unitImageUrl,
			animationTarget: e.target.getBoundingClientRect()
		});
	}
} as any);
