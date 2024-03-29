'use strict';

Polymer({
  is: 'preview-and-predictions',
	properties: {
		titleText: String,
		width: {
			type: Number,
			observer: '_updateStyles'
		},
		model: String,
		associatedDataset: String,
		imageIndex: Number,
		distortion: String,
		distortionIndex: {
			type: Number,
			observer: 'reload'
		},
		invariantDistortion: Boolean,
		predictionAmount: {
			type: Number,
			observer: '_updateShowingAllPredictions'
		},
		requestManager: Object,
		
		loadingPredictions: {
			type: Boolean,
			notify: true
		},
		showingAllPredictions: {
			type: Boolean,
			notify: true
		},
		
		_imageUrls: Array,
		_singlePreviewImage: Boolean,
		_predictions: Array,
    _groundTruthCategory: Number,
		_distortionConfiguration: Array,
		
		_imageGridPadding: {
			type: Number,
			value: 3,
			observer: '_updateStyles'
		}
	},
	
	attached: function() {
		this.reload();
	},
	
	reload: function() {
		// Clean up potential old values
		this.set('_imageUrls', []);
		this.set('_singlePreviewImage', true);
		this.set('_predictions', []);
    this.set('_groundTruthCategory', null);
		
		if (this.requestManager != null) {
			this._fetchPreviewImageUrls();
			this._fetchPredictions();
		}
	},
  
  openDistortedImagePredictionDialog: function() {
		if (this._groundTruthCategory != null && !this.invariantDistortion
			&& this.distortion != null) {
			var animationTarget = null;
			
			if (this._singlePreviewImage) {
				animationTarget = this.$$('#single-preview-image-loader')
					.getBoundingClientRect();
			} else {
				animationTarget = this.$$('#button-overlay').getBoundingClientRect();
			}
			
			this.fire('open-distorted-image-prediction-dialog', {
				model: this.model,
				associatedDataset: this.associatedDataset,
				imageIndex: this.imageIndex,
				distortion: this.distortion,
				distortionIndex: this.distortionIndex,
				groundTruthCategory: this._groundTruthCategory,
				animationTarget: animationTarget
			});
		}
  },
	
	_isGroundTruth: function(categoryId, groundTruthCategory) {
		return categoryId == groundTruthCategory;
	},
	
	_getSingleImageLoaderClass: function(invariantDistortion) {
		var baseClass = 'single-image';
		
		if (this.distortion != null && !invariantDistortion) {
			return baseClass + ' clickable';
		} else {
			return baseClass;
		}
	},
	
	_getSingleImageRippleClass: function(distortion, invariantDistortion,
		distortionIndex) {
		if (distortion != null && !invariantDistortion && distortionIndex != null) {
			return 'shown';
		} else {
			return 'hidden';
		}
	},
	
	_getSpinnerClass: function(loading) {
		if (loading) {
			return 'shown';
		} else {
			return 'hidden';
		}
	},
  
  _displayInvariantSinglePreviewImage: function(singlePreviewImage,
    invariantDistortion) {
    return singlePreviewImage && !invariantDistortion;
  },
	
	_generateConfigurationDescription: function(configuration) {
		var parameters = [];
		
		for (let parameter of configuration) {
			parameters.push(parameter.displayName + ': ' + parameter.value);
		}
		
		return parameters;
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
		var imageUrls = [];
		
		if (this.distortion == null) {
			// Fetch the URL of the original image
			this.set('_singlePreviewImage', true);
			
			imageUrls.push(
				tf_backend.addParams(tf_backend.getRouter()
					.pluginRoute('advis', '/datasets/images/image'), {
					dataset: this.associatedDataset,
					index: String(this.imageIndex)
				})
			);
		} else {
			// Fetch the URLs of distorted images
			if (this.distortionIndex == null) {
				this.set('_singlePreviewImage', this.invariantDistortion);
				
				var urlAmount = 1;
				if (!this._singlePreviewImage) {
					urlAmount = 4;
				}
				
				var distortedImageUrls = [];
				for (var i = 0; i < urlAmount; i++) {
					imageUrls.push(tf_backend.addParams(tf_backend.getRouter()
						.pluginRoute('advis', '/distortions/single'), {
						distortion: this.distortion,
						dataset: this.associatedDataset,
						imageIndex: String(this.imageIndex),
						distortionIndex: String(i),
						distortionAmount: String(urlAmount)
					}));
				}
			} else {
				this.set('_singlePreviewImage', true);
				
				imageUrls.push(tf_backend.addParams(tf_backend.getRouter()
					.pluginRoute('advis', '/distortions/single'), {
					distortion: this.distortion,
					dataset: this.associatedDataset,
					imageIndex: String(this.imageIndex),
					distortionIndex: String(this.distortionIndex),
					distortionAmount: String(advis.config.requests.imageAmounts
						.distortedPredictions)
				}));
			}
		}
		
		this.set('_imageUrls', imageUrls);
	},
	
	_fetchPredictions: function() {
		const self = this;
		
		this.set('loadingPredictions', true);
		
		const predictionsReceived = function(result) {
      if (self._groundTruthCategory == null) {
        self.set('_groundTruthCategory', result.input.categoryId);
      }
      
      if ('distortion' in result.input) {
        self.set('_distortionConfiguration', result.input.distortion
  				.configuration);
      }
			
			self.set('loadingPredictions', false);
			self.set('_predictions', result.predictions);
			self._updateShowingAllPredictions();
		};
		
		if (this.distortion == null) {
			// Fetch the predictions of the original input image
			const originalPredictionsUrl = tf_backend.addParams(
				tf_backend.getRouter().pluginRoute('advis', '/predictions/single'), {
					model: this.model,
					imageIndex: String(this.imageIndex),
					predictionAmount: '-1'
				}
			);
			
			this.requestManager.request(originalPredictionsUrl).then(result => {
				predictionsReceived(result);
			});
		} else {
			// Fetch the predictions of the distorted input image
			if (this.distortionIndex == null) {
				const distortedPredictionsUrl = tf_backend.addParams(
					tf_backend.getRouter().pluginRoute('advis', '/predictions/average'), {
						model: this.model,
						imageIndex: String(this.imageIndex),
						distortion: this.distortion,
						distortionAmount: String(advis.config.requests.imageAmounts
							.distortedPredictions)
					}
				);
				
				this.requestManager.request(distortedPredictionsUrl).then(result => {
					predictionsReceived(result);
				});
			} else {
				const originalPredictionsUrl = tf_backend.addParams(
					tf_backend.getRouter().pluginRoute('advis', '/predictions/single'), {
						model: this.model,
						imageIndex: String(this.imageIndex),
						distortion: this.distortion,
						distortionIndex: String(this.distortionIndex),
						distortionAmount: String(advis.config.requests.imageAmounts
							.distortedPredictions),
						predictionAmount: '-1'
					}
				);
				
				this.requestManager.request(originalPredictionsUrl).then(result => {
					predictionsReceived(result);
				});
			}
		}
	},
	
	_getContainerWidth: function(width) {
		return `${width}px`;
	},
	
	_getImageGridSize: function(width, padding) {
		return `${(width / 2) - padding}px`;
	},
	
	_updateStyles: function() {
		this.customStyle['--image-grid-padding'] = `${this._imageGridPadding}px`;
		this.customStyle['--image-grid-size'] = this._getImageGridSize(this.width,
			this._imageGridPadding);
		this.customStyle['--container-width'] = this._getContainerWidth(this.width);
		this.updateStyles();
	},
	
	_updateShowingAllPredictions: function() {
		if (this._predictions != null) {
			this.set(
				'showingAllPredictions',
				this.predictionAmount > this._predictions.length
			);
		} else {
			this.set('showingAllPredictions', false);
		}
	}
});
