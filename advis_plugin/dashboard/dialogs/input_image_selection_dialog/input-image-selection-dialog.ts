'use strict';

Polymer({
  is: 'input-image-selection-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		dataset: Object,
		availableImages: Array,
		selectedImage: Object,
		eventId: {
			type: String,
			value: 'input-image-selection-dialog'
		}
  },
	
	setContent: function(content) {		
		this.dataset = content.dataset;
		this.availableImages = content.availableImages;
		this.selectedImage = content.selectedImage;
		
		this.$$('iron-list').selectItem(this.selectedImage);
	},
	
	getContentOnDismiss: function() {
		return this.selectedImage;
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
