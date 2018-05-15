'use strict';

Polymer({
  is: 'model-list-item',
	properties: {
		model: {
			type: Object,
			observer: '_calculateAccuracy'
		},
		distortions: {
			type: Array,
			observer: '_calculateAccuracy'
		},
		lastItem: Boolean,
		requestManager: Object,
		_modelAccuracy: Number,
		_inputImageAmount: {
			type: Number,
			value: 20,
			observer: '_calculateAccuracy'
		}
	},
	
	_calculateAccuracy() {
		if (this.distortions == null || this.requestManager == null) {
			return;
		}
		
		var originalAccuracy = null;
		var accuracies = {};
		let self = this;
		
		// Define a function that will calculate the overall accuracy difference 
		// after all singular accuracies have been retrieved
		let evaluateAccuracies = async function(accuracies) {
			if (Object.keys(accuracies).length == self.distortions.length
				&& originalAccuracy != null) {
				// All distortion accuracies and the original accuracy have been 
				// retrieved, we can calculate their difference
				if (self.distortions.length == 0) {
					self._modelAccuracy = 0;
				} else {
					var deltaSum = 0;
					
					// Calculate the difference between the accuracy of each distorted 
					// prediction and the original one
					for (let distortion in accuracies) {
						deltaSum += (accuracies[distortion] - originalAccuracy);
					}
					
					// Calculate the average of the differences
					let result = (deltaSum * 1.0) / Object.keys(accuracies).length;
					
					// Finally, set the variable that will be shown
					self._modelAccuracy = result;
				}
			}
		};
		
		// First of all, request the accuracy of non-distorted input images
		var originalUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/predictions/accuracy'), {
			model: this.model.name,
			inputImageAmount: this._inputImageAmount
		});
		
		this.requestManager.request(originalUrl).then(data => {
			originalAccuracy = data.accuracy.top1;
			evaluateAccuracies(accuracies);
		});
		
		// Asynchronously retrieve accuracies of the model on input data that has 
		// been manipulated with all selected distortions
		for (var distortion of this.distortions) {
			var url = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/predictions/accuracy'), {
				model: this.model.name,
				inputImageAmount: this._inputImageAmount,
				distortion: distortion.name
			});
			
			this.requestManager.request(url).then(data => {
				accuracies[data.input.distortion] = data.accuracy.top1;
				evaluateAccuracies(accuracies);
			});
		}
	}
});
