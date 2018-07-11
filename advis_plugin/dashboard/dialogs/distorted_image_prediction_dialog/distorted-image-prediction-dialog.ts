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
		_selectedSortMethod: {
			type: Number,
			notify: true,
			value: 0,
			observer: '_sortImages'
		},
		_loadingImages: Boolean,
		_loadingProgress: Number,
		_distortionDisplayName: {
			type: String,
			value: 'Unknown'
		},
		_parameters: Array,
		
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
	
	_sortImages: function(method) {
		if (this._images == null) {
			return;
		}
		
		var images = this._images;
		this.set('_images', null);
		
		if (method == 0) {
			// Sort by certainty
			images.sort((a, b) => b.certainty - a.certainty);
		} else if (method == 1) {
			// Sort by index
			images.sort((a, b) => b.index - a.index);
		} else if (this._parameters != null) {
			// Sort by a parameter
			let parameterName = this._parameters[method - 2].name;
			
			let findParameterValue = function(configuration, name) {
				for (let parameter of configuration) {
					if (parameter.name == name) {
						return parameter.value;
					}
				}
				
				return 0;
			}
			
			images.sort((a, b) => findParameterValue(b.configuration, parameterName)
				- findParameterValue(a.configuration, parameterName));
		}
		
		this.set('_images', images);
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
		this.set('_distortionDisplayName', '...');
		this.set('_parameters', null);
		this.set('_selectedSortMethod', 0);
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
			
			self.set('_distortionDisplayName', result.input.distortion.displayName);
			
			if (self._parameters == null) {
				var parameters = [];
				
				for (let parameter of result.input.distortion.configuration) {
					if (parameter.type == 'range') {
						parameters.push({
							name: parameter.name,
							displayName: parameter.displayName
						});
					}
				}
				
				self.set('_parameters', parameters);
			}
			
			self.set(
				'_loadingProgress',
				(imageList.length / distortionAmount) * 100
			);
			
			if (imageList.length == distortionAmount) {
				self.set('_loadingImages', false);
				self.set('_images', imageList);
				self._sortImages(self._selectedSortMethod);
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
