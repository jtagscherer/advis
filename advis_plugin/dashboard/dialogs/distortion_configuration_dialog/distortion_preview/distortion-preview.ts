'use strict';

Polymer({
  is: 'distortion-preview',
	properties: {
		distortion: {
			type: Object,
			observer: 'reload'
		},
		requestManager: {
			type: Object,
			observer: 'reload'
		},
		_originalImageUrl: String,
		_distortedImageUrls: Array,
		_singlePreviewImage: {
			type: Boolean,
			value: false
		}
	},
	
	reload: function() {
		if (this.requestManager != null) {
			// First of all, choose the first image within the first dataset for our 
			// preview
			const datasetUrl = tf_backend.getRouter()
				.pluginRoute('advis', '/datasets');
			
			this.requestManager.request(datasetUrl).then(datasets => {
				var previewDataset;
				
				for (const dataset of datasets) {
					if (dataset.imageCount >= 1) {
						previewDataset = dataset.name;
						break;
					}
				}
				
				if (previewDataset != null) {
					// Now that we have chosen a dataset for our preview images, we 
					// construct URLs for all of them
					this.set('_originalImageUrl', 
						tf_backend.addParams(tf_backend.getRouter()
							.pluginRoute('advis', '/datasets/images/image'), {
							dataset: previewDataset,
							index: '0'
						})
					);
					
					// If there are no range parameters allowing for image variation, 
					// we display a single preview image instead of four
					this.set('_singlePreviewImage', true);
					var urlAmount = 1;
					
					for (const parameter in this.distortion.parameters) {
						const _parameter = this.distortion.parameters[parameter];
						
						if (_parameter.type == 'range') {
							this.set('_singlePreviewImage', false);
							urlAmount = 4;
						}
					}
					
					var distortedImageUrls = [];
					for (var i = 0; i < urlAmount; i++) {
						distortedImageUrls.push(tf_backend.addParams(tf_backend.getRouter()
							.pluginRoute('advis', '/distortions/single'), {
							distortion: this.distortion.name,
							dataset: previewDataset,
							imageIndex: '0',
							distortionIndex: String(i),
							distortionAmount: String(urlAmount),
							parameters: JSON.stringify(this.distortion.parameters)
						}));
					}
					this.set('_distortedImageUrls', distortedImageUrls);
				}
			});
		}
	}
});
