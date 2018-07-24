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
		selectedImageIndex: Number,
		requestManager: Object,
		
		_verticalOffset: {
			type: Object,
			observer: '_reloadImageList'
		},
		_horizontalOffset: {
			type: Object,
			observer: '_reloadImageList'
		},
		_selectionRectangle: {
      type: Object,
			value: null,
      notify: true,
			observer: '_reloadImageList'
    },
		_matrixMode: {
			type: String,
			observer: '_reloadImageList'
		},
		_imageSortMethod: {
			type: String,
			observer: '_reloadImageList'
		},
		_sortSelection: {
			type: Number,
			value: 0,
			observer: '_sortSelectionChanged'
		},
		_offsetDirty: Boolean,
		_imageRequestRunning: {
			type: Boolean,
			value: false
		},
		_intervalId: Number,
		
		_loadingInputImages: {
			type: Boolean,
			value: false
		},
		
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
		this.selectedImageIndex = content.selectedImageIndex;
		this._offsetDirty = true;
		this._imageRequestRunning = false;
		this.requestManager = content.requestManager;
		
		// Update the image list periodically
		clearInterval(this._intervalId);
		
		let self = this;
		this._intervalId = setInterval(function() {
			if (self._offsetDirty && !self._imageRequestRunning) {
				if (self._matrixMode != null && self.model != null
					&& self.distortion != null && self._verticalOffset != null
					&& self._horizontalOffset != null && self._imageSortMethod != null) {
					self.set('_loadingInputImages', true);
					self.set('_imageRequestRunning', true);
					
					// Fetch all images matching the current selection
					var inputMode;
					if (self._matrixMode == 'difference') {
						inputMode = 'distorted';
					} else {
						inputMode = self._matrixMode;
					}
					
					// Use the selection rectangle as the input image's bounds if one has 
					// been selected, and the current viewport rectangle otherwise
					var actualStart = 0;
					var actualEnd = 0;
					var predictedStart = 0;
					var predictedEnd = 0;
					
					if (self._selectionRectangle != null) {
						actualStart = self._selectionRectangle.y;
						actualEnd = self._selectionRectangle.y
							+ self._selectionRectangle.height;
						predictedStart = self._selectionRectangle.x;
						predictedEnd = self._selectionRectangle.x
							+ self._selectionRectangle.width;
					} else {
						actualStart = Math.floor(self._verticalOffset.start);
						actualEnd = Math.floor(self._verticalOffset.end);
						predictedStart = Math.floor(self._horizontalOffset.start);
						predictedEnd = Math.floor(self._horizontalOffset.end);
					}
					
					// Construct the URL for retrieving the input images
					let imagesUrl = tf_backend.addParams(tf_backend.getRouter()
						.pluginRoute('advis', '/confusion/images/subset'), {
						model: self.model.name,
						distortion: self.distortion.name,
						actualStart: String(actualStart),
						actualEnd: String(actualEnd),
						predictedStart: String(predictedStart),
						predictedEnd: String(predictedEnd),
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
						
						// If the currently selected item is present within the list we 
						// have retrieved, select it in the list
						for (let image of images) {
							if (image.index == self.selectedImageIndex) {
								self.$$('iron-list').selectItem(image);
								break;
							}
						}
						
						self.set('_offsetDirty', false);
						self.set('_imageRequestRunning', false);
						self.set('_loadingInputImages', false);
					});
				}
			}
		}, 1000);
	},
	
	getContentOnDismiss: function() {
		clearInterval(this._intervalId);
		return this.selectedImageIndex;
	},
	
	_getEmptyStateClass: function(inputImages, loadingInputImages) {
		if ((inputImages != null && inputImages.length > 0)
			|| loadingInputImages) {
			return 'hidden';
		} else {
			return 'shown';
		}
	},
  
  _getVisibilityClass: function(condition, negation, prefix='') {
    if (negation == 'negative') {
      condition = !condition;
    }
    
    if (condition) {
      return `${prefix} shown`;
    } else {
			return `${prefix} hidden`;
		}
  },
	
	_sortSelectionChanged: function(value) {
		switch (value) {
			case 0:
				this.set('_imageSortMethod', 'descending');
				break;
			case 1:
				this.set('_imageSortMethod', 'ascending');
				break;
			case 2:
				this.set('_imageSortMethod', 'index');
				break;
		}
	},
	
	_reloadImageList: function() {
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
				if (imageIndex == this.selectedImageIndex) {
					e.stopPropagation();
				}
				
				this.set('selectedImageIndex', imageIndex);
			}
		}
	}
});
