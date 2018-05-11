'use strict';

Polymer({
  is: 'layer-visualization',
	
  properties: {
		selectedModel: {
			type: Object,
			observer: '_fetchAvailableImages'
		},
		selectedLayer: String,
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
		
		// First of all, get the dataset associated with the selected model
		const modelUrl = tf_backend.getRouter().pluginRoute('advis', '/models');
		
		var self = this;
		this.requestManager.request(modelUrl).then(models => {
			var dataset;
			
			for (var model of models) {
				if (model.name == self.selectedModel.name) {
					dataset = model.dataset;
					break;
				}
			}
			
			if (dataset == null) {
				return;
			}
			
			// Now that we know which dataset we are using, fetch a list of its images
			const datasetUrl = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/datasets/images/list'), {
				dataset: dataset
			});
			
			self.requestManager.request(datasetUrl).then(images => {
				self._availableImages = images;
				
				// Select the first available image per default
				if (self._availableImages != null && self._availableImages.length > 0) {
					self.selectedImage = self._availableImages[0];
				}
			});
		});
	}
});
