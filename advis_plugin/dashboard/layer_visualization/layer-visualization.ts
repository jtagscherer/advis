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
		selectedImage: Object,
		_availableImages: Array,
		requestManager: Object
	},
	
	reload() {
		this.$$('layer-image').reload();
	},
	
	_fetchAvailableImages() {
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
