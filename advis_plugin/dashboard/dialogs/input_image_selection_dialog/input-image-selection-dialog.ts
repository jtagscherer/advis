'use strict';

Polymer({
  is: 'input-image-selection-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		model: Object,
		distortion: Object,
		dataset: Object,
		inputImages: Array,
		selectedImage: Object,
		requestManager: Object,
		
		_verticalOffset: {
			type: Object,
			observer: '_matrixChanged'
		},
		_horizontalOffset: {
			type: Object,
			observer: '_matrixChanged'
		},
		_matrixMode: {
			type: String,
			observer: '_matrixChanged'
		},
		_imageSortMethod: {
			type: String,
			value: 'descending'
		},
		_offsetDirty: Boolean,
		_imageRequestRunning: {
			type: Boolean,
			value: false
		},
		_intervalId: Number,
		
		eventId: {
			type: String,
			value: 'input-image-selection-dialog'
		}
  },
	
	setContent: function(content) {		
		this.model = content.model;
		this.distortion = content.distortion;
		this.dataset = content.dataset;
		this.inputImages = [];
		// this.selectedImage = content.selectedImage;
		this.requestManager = content.requestManager;
		
		// Update the image list periodically
		clearInterval(this._intervalId);
		
		let self = this;
		this._intervalId = setInterval(function() {
			if (self._offsetDirty && !self._imageRequestRunning) {
				if (self._matrixMode != null && self.model != null
					&& self.distortion != null && self._verticalOffset != null
					&& self._horizontalOffset != null && self._imageSortMethod != null) {
					self.set('_imageRequestRunning', true);
					
					// Fetch all images matching the current selection
					var inputMode;
					if (self._matrixMode == 'difference') {
						inputMode = 'distorted';
					} else {
						inputMode = self._matrixMode;
					}
					
					let imagesUrl = tf_backend.addParams(tf_backend.getRouter()
						.pluginRoute('advis', '/confusion/images/subset'), {
						model: self.model.name,
						distortion: self.distortion.name,
						actualStart: String(Math.floor(self._verticalOffset.start)),
						actualEnd: String(Math.floor(self._verticalOffset.end)),
						predictedStart: String(Math.floor(self._horizontalOffset.start)),
						predictedEnd: String(Math.floor(self._horizontalOffset.end)),
						sort: self._imageSortMethod,
						inputMode: inputMode
					});
					
					self.requestManager.request(imagesUrl).then(images => {
						// Add URLs for each image
						for (let image of images) {
							image.url = tf_backend.addParams(tf_backend.getRouter()
								.pluginRoute('advis', '/datasets/images/image'), {
								dataset: self.dataset.name,
								index: image.index
							});
						}
						
						self.set('inputImages', images);
						
						self.set('_offsetDirty', false);
						self.set('_imageRequestRunning', false);
					});
				}
			}
		}, 1000);
	},
	
	getContentOnDismiss: function() {
		clearInterval(this._intervalId);
		return this.selectedImage;
	},
	
	_matrixChanged: function() {
		this.set('_offsetDirty', true);
	},
	
	_inputImageClicked: function(e) {
		let findParentNode = function(parentName, node) {
			if (node.nodeName == parentName) {
				return node;
			} else if (node.parentNode == null) {
				return null;
			} else {
				return findParentNode(parentName, node.parentNode);
			}
		}
		
		// Walk through the target's parent nodes until we reach the root node
		let inputImageItemNode = findParentNode('INPUT-IMAGE-ITEM', e.target);
		
		// Extract the attached image index attribute
		if (inputImageItemNode != null && inputImageItemNode.dataset != null) {
			if ('imageIndex' in inputImageItemNode.dataset) {
				let imageIndex = inputImageItemNode.dataset.imageIndex;
				
				// If the input image item that has been clicked is the one that is 
				// already selected, prevent it from being deselected
				if (imageIndex == this.selectedImage.index) {
					e.stopPropagation();
				}
			}
		}
	}
});
