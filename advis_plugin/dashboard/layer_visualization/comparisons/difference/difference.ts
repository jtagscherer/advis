'use strict';

declare var resemble: any;

Polymer({
  is: 'difference-comparison',
	
	properties: {
		differenceImages: {
			type: Array,
			value: []
		}
	},
	
	behaviors: [
		VisualizationComparisonBehavior,
		(Polymer as any).NeonAnimatableBehavior
	],
	
	getImageContainerSize: function() {
		return Math.min(
			this.$$('#container').offsetWidth,
			this.$$('#container').offsetHeight
		)
	},
	
	urlsChanged: function(urlType) {
		this._calculateImageDifferences();
	},
	
	sizeChanged: function() {
		this._calculateImageDifferences();
	},
	
	getDialogInputUrl: function(inputType, unitIndex) {
		return this.differenceImages[unitIndex];
	},
	
	getDialogTitle: function(inputType, unitTitle) {
		if (inputType == 'difference') {
			return unitTitle + ' (Difference)';
		}
	},
	
	_calculateImageDifferences: function() {
		if (this.normalUrls == null || this.normalUrls.length == 0
			|| this.distortedUrls == null || this.distortedUrls.length == 0
			|| this.normalUrls.length != this.distortedUrls.length) {
			return;
		}
		
    var computedImages = new Array(this.normalUrls.length);
		let self = this;
    
    // This function will be called after every completed tile calculation
    let checkCompletion = function(computedImages) {
      // Only continue if all tile calculations have been completed
      for (var result of computedImages) {
        if (result == null) {
          return;
        }
      }
      
      // Now that all calculations have been completed, update the image URL 
      // array that is being displayed in the UI
      self.set('differenceImages', []);
      
      for (var image of computedImages) {
        self.push('differenceImages', image);
      }
    };
		
    // Calculate the image differences between each unit
		for (var index in this.normalUrls) {
			resemble(this.normalUrls[index]).compareTo(this.distortedUrls[index], 
				index).onComplete(function(data) {
				computedImages[Number(data.requestIndex)] = data.getImageDataUrl();
				checkCompletion(computedImages);
			});
		}
	}
} as any);