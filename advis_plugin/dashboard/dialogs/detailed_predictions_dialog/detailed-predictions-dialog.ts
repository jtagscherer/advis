'use strict';

Polymer({
  is: 'detailed-predictions-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		model: String,
		associatedDataset: String,
		imageIndex: Number,
		distortion: String,
		invariantDistortion: Boolean,
		requestManager: Object,
		
		_originalImageUrl: String,
		_distortedImageUrls: Array,
		_singlePreviewImage: Boolean,
		
		_originalPredictions: Array,
		_distortedPredictions: Array,
		_predictionAmount: {
			type: Number,
			value: 10
		},
		
		eventId: {
			type: String,
			value: 'detailed-predictions-dialog'
		}
  },
	
	reload: function() {
		// Clean up potential old values
		this.set('_originalImageUrl', '');
		this.set('_distortedImageUrls', '');
		this.set('_singlePreviewImage', true);
		this.set('_originalPredictions', []);
		this.set('_distortedPredictions', []);
		this.set('_predictionAmount', 10);
		
		if (this.requestManager != null) {
			this._fetchPreviewImageUrls();
			this._fetchPredictions();
		}
	},
	
	setContent: function(content) {
		this.model = content.model;
		this.associatedDataset = content.associatedDataset;
		this.imageIndex = content.imageIndex;
		this.distortion = content.distortion;
		this.invariantDistortion = content.invariantDistortion;
		this.requestManager = content.requestManager;
		
		this.reload();
	},
	
	loadMorePredictions: function() {
		if (!this._allPredictionsShown(this._originalPredictions,
			this.predictionAmount)) {
			this.set('_predictionAmount', this._predictionAmount + 10);
		}
	},
	
	_allPredictionsShown: function(predictions, predictionAmount) {
		return predictionAmount > predictions.length;
	},
	
	_sliceArray: function(array, endIndex) {
		if (array == null || endIndex == null || endIndex < 0) {
			return [];
		}
		
		if (endIndex >= array.length) {
			return array;
		} else {
			return array.slice(0, endIndex);
		}
	},
	
	_fetchPreviewImageUrls: function() {
		// Fetch the URL of the original image
		this.set('_originalImageUrl', 
			tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/datasets/images/image'), {
				dataset: this.associatedDataset,
				index: String(this.imageIndex)
			})
		);
		
		this.set('_singlePreviewImage', this.invariantDistortion);
		var urlAmount = 1;
		if (!this._singlePreviewImage) {
			urlAmount = 4;
		}
		
		// Fetch the URLs of distorted images
		var distortedImageUrls = [];
		for (var i = 0; i < urlAmount; i++) {
			distortedImageUrls.push(tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/distortions/single'), {
				distortion: this.distortion,
				dataset: this.associatedDataset,
				imageIndex: String(this.imageIndex),
				distortionIndex: String(i),
				distortionAmount: String(urlAmount)
			}));
		}
		this.set('_distortedImageUrls', distortedImageUrls);
	},
	
	_fetchPredictions: function() {
		const self = this;
		
		// Fetch the predictions of the original input image
		const originalPredictionsUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/predictions/single'), {
			model: this.model,
			imageIndex: String(this.imageIndex),
			predictionAmount: '-1'
		});
		
		this.requestManager.request(originalPredictionsUrl).then(result => {
			self.set('_originalPredictions', result.predictions);
		});
		
		// Fetch the average predictions of the distorted input image
		const distortedPredictionsUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/predictions/average'), {
			model: this.model,
			imageIndex: String(this.imageIndex),
			distortion: this.distortion,
			distortionAmount: String(advis.config.requests.imageAmounts
				.distortedPredictions)
		});
		
		this.requestManager.request(distortedPredictionsUrl).then(result => {
			self.set('_distortedPredictions', result.predictions);
		});
	}
});
