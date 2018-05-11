'use strict';

Polymer({
  is: 'input-image-selector',
	
  properties: {
		selectedImage: {
			type: Object,
			observer: '_selectedImageChanged'
		},
		associatedDataset: String,
		_selectedImageUrl: String
	},
	
	_selectedImageChanged: function(value) {
		// Build the URL for retrieving the currently selected image
		this._selectedImageUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/datasets/images/image'), {
			dataset: this.associatedDataset,
			index: this.selectedImage.index
		});
	}
});
