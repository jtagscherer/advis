'use strict';

declare var chroma: any;

Polymer({
  is: 'difference-comparison',
	
	properties: {
		_differenceImageUrl: String,
		_differenceImageLoaded: Boolean,
		differenceMode: {
			type: String,
			value: 'difference-highlight',
			observer: '_updateImages'
		},
		_colorScale: {
			type: Object,
			observer: '_updateImages'
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
	
	/*getDialogImageSource: function(data, callback) {
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
	},*/
	
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
		this._updateImages();
	},
	
	stateChanged: function(state) {
		this._updateImages();
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
	
	_updateImages: function() {
		if (this.state == 'empty' || this._originalImageUrl == null
			|| this._distortedImageUrl == null) {
			return;
		}
		
		let self = this;
		
		this._calculateImageDifference(
			this._originalImageUrl,
			this._distortedImageUrl,
			function(result) {
				self.set('_differenceImageUrl', result);
			}
		);
	},
	
	_differenceImageCallback: function() {
		this.set('_differenceImageLoaded', true);
		this._updateState();
	},
	
	_calculateImageDifference: function(first, second, callback) {
		let colorScale = chroma.scale('Spectral').domain([1, 0]);
		
		let canvas = document.createElement('canvas');
		let context = canvas.getContext('2d');
		
		var firstImage = new Image();
		firstImage.setAttribute('crossOrigin', 'anonymous');
		var firstImageLoaded = false;
		
		var secondImage = new Image();
		secondImage.setAttribute('crossOrigin', 'anonymous');
		var secondImageLoaded = false;
		
		let calculateDifference = function() {
			if (!firstImageLoaded || !secondImageLoaded) {
				return;
			}
			
			let width = firstImage.naturalWidth;
			let height = firstImage.naturalHeight;
			
			canvas.width = width;
			canvas.height = height;
      
      // Draw images onto canvases
      let firstCanvas = document.createElement('canvas');
      firstCanvas.width = width;
      firstCanvas.height = height;
  		let firstContext = firstCanvas.getContext('2d');
      firstContext.drawImage(firstImage, 0, 0);
      
      let secondCanvas = document.createElement('canvas');
      secondCanvas.width = width;
      secondCanvas.height = height;
  		let secondContext = secondCanvas.getContext('2d');
      secondContext.drawImage(secondImage, 0, 0);
      
      // Fetch data of input images
      let firstImageData = firstContext.getImageData(0, 0, width, height);
      let secondImageData = secondContext.getImageData(0, 0, width, height);
      
      var differenceImageData = context.getImageData(0, 0, width, height);
			
			// Iterate through pixels, stored as RGBA data
			for (var x = 0; x < width; x++) {
				for (var y = 0; y < height; y++) {
					// Get the data of both image's pixels
					// Since we assume to be greyscale, we can simply use the red channel
					let dataIndex = (x + (y * width)) * 4;
					let firstValue = firstImageData.data[dataIndex] / 255;
					let secondValue = secondImageData.data[dataIndex] / 255;
					
					// Calculate the difference and visualize it using a color scale
					let valueDelta = Math.abs(firstValue - secondValue);
					let currentColor = colorScale(valueDelta).get('rgba');
					
					// Assign values to the pixel's color channels
					differenceImageData.data[dataIndex] = currentColor[0];
          differenceImageData.data[dataIndex + 1] = currentColor[1];
          differenceImageData.data[dataIndex + 2] = currentColor[2];
          differenceImageData.data[dataIndex + 3] = currentColor[3] * 255;
				}
			}
      
      // Draw the image data onto the canvas
      context.putImageData(differenceImageData, 0, 0);
      
      // Finally, return the result's data URL
      callback(canvas.toDataURL('image/png'));
		};
		
		firstImage.onload = function() {
			firstImageLoaded = true;
			calculateDifference();
		};
		
		secondImage.onload = function() {
			secondImageLoaded = true;
			calculateDifference();
		};
		
		firstImage.src = first;
		secondImage.src = second;
	}
} as any);
