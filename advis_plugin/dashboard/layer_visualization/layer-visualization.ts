'use strict';

Polymer({
  is: 'layer-visualization',
	
  properties: {
		selectedModel: {
			type: Object,
			observer: '_fetchAvailableImages'
		},
		selectedLayer: String,
		associatedDataset: Object,
		selectedImage: {
			type: Object,
			observer: '_selectedImageChanged'
		},
		distortions: {
			type: Array,
			observer: '_distortionsChanged'
		},
		selectedDistortion: {
			type: Object,
			observer: '_selectedDistortionChanged'
		},
		selectedPage: {
			type: Number,
			value: 0,
			observer: 'reload'
		},
		_availableImages: Array,
		requestManager: Object
	},
	
	reload: function() {
		// Reload all available layer visualization comparison components
		this.$$('side-by-side-comparison').reload();
		this.$$('swipe-comparison').reload();
		this.$$('crossfade-comparison').reload();
		this.$$('difference-comparison').reload();
	},
	
	_selectedImageChanged: function() {
		this.reload();
	},
	
	_selectedDistortionChanged: function() {
		this.reload();
	},
	
	_distortionsChanged: function() {
		// Bail out if the distortion list is invalid
		if (this.distortions == null || this.distortions.length == 0) {
			return;
		}
		
		// Put all available distortions into a dictionary for convenience's sake
		var distortionDictionary = {};
		
		for (var distortion of this.distortions) {
			distortionDictionary[distortion.name] = distortion;
		}
		
		if (this.selectedDistortion == null) {
			// If no distortion had been selected yet, select the first one
			this.selectedDistortion = this.distortions[0];
		} else if (this.selectedDistortion.name in distortionDictionary) {
			// If the currently selected distortion is still present in the list of 
			// available distortions, keep it selected
			this.selectedDistortion = distortionDictionary[this.selectedDistortion
				.name];
		} else {
			// If the list of available selections no longer contains the selected 
			// one, select the first one instead
			this.selectedDistortion = this.distortions[0];
		}
	},
	
	_fetchAvailableImages: function() {
		if (this.selectedModel == null) {
			return;
		}
		
		// First of all, get the name of the dataset associated with the selected 
		// model
		const modelUrl = tf_backend.getRouter().pluginRoute('advis', '/models');
		
		var self = this;
		this.requestManager.request(modelUrl).then(models => {
			var datasetName;
			
			for (var model of models) {
				if (model.name == self.selectedModel.name) {
					datasetName = model.dataset;
					break;
				}
			}
			
			if (datasetName == null) {
				return;
			}
			
			// Fetch some more information about the dataset
			const datasetUrl = tf_backend.getRouter()
				.pluginRoute('advis', '/datasets');
			
			this.requestManager.request(datasetUrl).then(datasets => {
				for (var dataset of datasets) {
					if (dataset.name == datasetName) {
						self.associatedDataset = dataset;
						break;
					}
				}
				
				if (self.associatedDataset == null) {
					return;
				}
				
				// Now that we know which dataset we are using, fetch a list of its 
				// images
				const datasetUrl = tf_backend.addParams(tf_backend.getRouter()
					.pluginRoute('advis', '/datasets/images/list'), {
					dataset: self.associatedDataset.name
				});
				
				self.requestManager.request(datasetUrl).then(images => {
					self._availableImages = [];
					
					// Add each image's URL
					for (var image of images) {
						image.url = tf_backend.addParams(tf_backend.getRouter()
							.pluginRoute('advis', '/datasets/images/image'), {
							dataset: self.associatedDataset.name,
							index: image.index
						});
						
						self._availableImages.push(image);
					}
					
					// Select the first available image per default
					if (self._availableImages != null
					 	&& self._availableImages.length > 0) {
						self.selectedImage = self._availableImages[0];
					}
				});
			});
		});
	}
});
