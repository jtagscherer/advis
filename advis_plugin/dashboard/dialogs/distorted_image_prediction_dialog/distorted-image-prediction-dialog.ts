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
		distortionIndex: Number,
		groundTruthCategory: Number,
		requestManager: Object,
		
		_images: Array,
		_selectedImage: {
			type: Object,
			notify: true,
			observer: '_imageSelected'
		},
		_loadingImages: Boolean,
		_loadingProgress: Number,
		
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
		this.distortionIndex = content.distortionIndex;
		this.groundTruthCategory = content.groundTruthCategory;
		this.requestManager = content.requestManager;
		
		this.reload();
	},
	
	getContentOnApply: function() {
		return {
			index: this._selectedImage.index
		};
	},
	
	_imageSelected: function(image) {
		if (image != null) {
			this._applyDialog();
		}
	},
	
	_generateImageList: function() {
		const self = this;
		
		this.set('_loadingImages', true);
		this.set('_loadingProgress', 0);
		this.set('_images', []);
		
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
				configuration: result.input.distortion.configuration,
				index: result.input.distortion.distortionIndex
			});
			
			self.set(
				'_loadingProgress',
				(imageList.length / distortionAmount) * 100
			);
			
			if (imageList.length == distortionAmount) {
				self.set('_loadingImages', false);
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
			
			this.requestManager.request(predictionUrl).then(result => {
				predictionsReceived(result);
			});
		}
	}
});
