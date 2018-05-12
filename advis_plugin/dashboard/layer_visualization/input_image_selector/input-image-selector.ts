'use strict';

Polymer({
  is: 'input-image-selector',
	
  properties: {
		selectedImage: {
			type: Object,
			observer: '_selectedImageChanged'
		},
		associatedDataset: Object,
		_selectedImageUrl: String
	},
	
	tapped: function() {
		// Open a dialog that lets the user view all input images and select one
		this.$$('input-image-selection-dialog').open({
			dataset: this.associatedDataset,
			animationTarget: this.$$('#left').getBoundingClientRect()
		});
	},
	
	_selectedImageChanged: function(value) {
		// Build the URL for retrieving the currently selected image
		this._selectedImageUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/datasets/images/image'), {
			dataset: this.associatedDataset.name,
			index: this.selectedImage.index
		});
	}
});
