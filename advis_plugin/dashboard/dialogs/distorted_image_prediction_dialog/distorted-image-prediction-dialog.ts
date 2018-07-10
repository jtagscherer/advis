'use strict';

Polymer({
  is: 'distorted-image-prediction-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		model: String,
		associatedDataset: String,
		imageIndex: Number,
		distortion: String,
		groundTruthCategory: Number,
		requestManager: Object,
		
		_images: Array,
		
		eventId: {
			type: String,
			value: 'distorted-image-prediction-dialog'
		}
  },
	
	reload: function() {
		if (this.requestManager != null) {
			this._generateImageList();
		}
	},
	
	setContent: function(content) {
		this.model = content.model;
		this.associatedDataset = content.associatedDataset;
		this.imageIndex = content.imageIndex;
		this.distortion = content.distortion;
		this.groundTruthCategory = content.groundTruthCategory;
		this.requestManager = content.requestManager;
		
		this.reload();
	},
	
	_generateImageList: function() {
		const self = this;
		
		const distortionAmount = advis.config.requests.imageAmounts
			.distortedPredictions;
		var imageList = [];
		
		const predictionsReceived = function(result) {
			const imageUrl = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/distortions/single'), {
				distortion: self.distortion,
				dataset: self.associatedDataset,
				imageIndex: String(self.imageIndex),
				distortionIndex: String(result.input.distortion.distortionIndex),
				distortionAmount: String(result.input.distortion.distortionAmount)
			});
			
			imageList.push({
				url: imageUrl,
				certainty: result.predictions[0].certainty,
				configuration: result.input.distortion.configuration
			});
			
			console.log('Got ' + imageList.length + ' of ' + distortionAmount + ' predictions.');
			console.log(result.input.distortion);
			
			if (imageList.length == distortionAmount) {
				self.set('_images', imageList);
			}
		};
		
		for (var distortionIndex = 0; distortionIndex < distortionAmount;
			distortionIndex++) {
			var predictionUrl = tf_backend.addParams(
				tf_backend.getRouter().pluginRoute('advis', '/predictions/single'), {
					model: this.model,
					imageIndex: String(this.imageIndex),
					distortion: this.distortion,
					distortionIndex: String(distortionIndex),
					distortionAmount: String(distortionAmount),
					onlyCategory: String(this.groundTruthCategory)
				}
			);
			
			console.log(predictionUrl);
			this.requestManager.request(predictionUrl).then(result => {
				predictionsReceived(result);
			});
		}
	}
});
