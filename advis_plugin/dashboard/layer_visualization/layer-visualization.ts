'use strict';

Polymer({
  is: 'layer-visualization',
	
  properties: {
		selectedModel: String,
		selectedLayer: String,
		requestManager: Object
	},
	
	reload() {
		this.$$('layer-image').reload();
	}
});
