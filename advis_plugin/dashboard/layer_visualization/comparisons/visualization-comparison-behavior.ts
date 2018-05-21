'use strict';

const VisualizationComparisonBehavior = {
	properties: {
		model: Object,
		layer: String,
		imageIndex: Number,
		distortion: {
			type: Object,
			observer: 'reload'
		},
		normalUrls: Array,
		distortedUrls: Array,
		tileSize: Number,
		_imagePadding: {
			type: Number,
			value: 2
		},
		_requestManager: {
			type: Object,
			value: () => new tf_backend.RequestManager()
		},
		animationConfig: {
			value: function() {
				return {
					'entry': {
						name: 'fade-in-animation',
						node: this
					},
					'exit': {
						name: 'fade-out-animation',
						node: this
					}
				}
			}
		}
	},
	
	listeners: {
		'iron-resize': '_sizeChanged'
	},
	
	behaviors: [
		(Polymer as any).IronResizableBehavior
	],

  observers: [
		'_fetchNewData(model.name, layer)'
	],
	
  attached: function() {
    this._attached = true;
    this.reload();
  },
	
  reload: function() {
		if (this._hasValidData()) {
			this._fetchNewData(this.model.name, this.layer);
		} else {
			this._updateTileSize();
		}
  },
	
	_sizeChanged: function() {
		this._updateTileSize();
		this.sizeChanged();
	},
	
	urlsChanged: function(urlType) {
		// Can be implemented by components using this behavior
	},
	
	sizeChanged: function() {
		// Can be implemented by components using this behavior
	},
	
	openUnitDialog: function(e) {
		let inputType = e.target.dataset.inputType;
		let unitIndex = e.target.dataset.unitIndex;
		
		var unitTitle = `Tensor ${Number(unitIndex) + 1}`;
		var unitImageUrl;
		
		if (inputType == 'distorted') {
			unitTitle += ' (Distorted)';
			unitImageUrl = this.distortedUrls[unitIndex];
		} else {
			unitImageUrl = this.normalUrls[unitIndex];
		}
		
		// Show the enlarged image tile in a dialog
		this.$$('unit-details-dialog').open({
			model: {
				title: this.model.displayName,
				caption: `Version ${this.model.version}`
			},
			unit: {
				title: unitTitle,
				caption: this.layer
			},
			url: unitImageUrl,
			animationTarget: e.target.getBoundingClientRect()
		});
	},
	
	getImageContainerSize: function() {
		// Has to be implemented by components using this behavior
	},
	
	_updateTileSize: function() {
		// In the following, tiles of normal and distorted images will be handled 
		// in the same way since their amounts and container sizes will always be 
		// equal.
		if (this.normalUrls == null || this.normalUrls.length == 0
			|| this.$$('#container') == null) {
			return;
		}
		
		// Get the container size that we have to fill with tiles
		let containerSize = this.getImageContainerSize();
		
		// Calculate the amount of images per row such that we get as close as 
		// possible to a square arrangement
		let imagesPerRow = Math.ceil(Math.sqrt(this.normalUrls.length));
		
		// Set the size of all individual image tiles
		this.set('tileSize', (containerSize / imagesPerRow) + this._imagePadding);
		
		// Finally, update the width of the image tile container to be able to 
		// center it horizontally
		this.customStyle['--image-container-width'] = 
			((imagesPerRow + 1) * (this.tileSize + this._imagePadding)) + 'px';
		this.updateStyles();
	},
	
	_fetchNewData: function(model, layer) {
    if (this._attached) {
			this._constructNormalTileUrlList();
			
			if (this.distortion != null) {
				this._constructDistortedTileUrlList();
			} else {
				this.distortedUrls = [];
			}
    }
  },
	
	_hasValidData: function() {
		return this.model != null && this.layer != null && this.imageIndex != null;
	},
	
	_constructNormalTileUrlList: function() {
		// First of all, request some meta data about the model layer shown
		const metaUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/layer/meta'), {
			model: this.model.name,
			layer: this.layer,
			imageIndex: this.imageIndex
		});
		
		this._requestManager.request(metaUrl).then(metaData => {
			var tileUrls = []
			
			// List all available image tiles and put them into our array
			for (let i in Array.from(Array(metaData.unitCount).keys())) {
				tileUrls.push(tf_backend.addParams(tf_backend.getRouter()
					.pluginRoute('advis', '/layer/image'), {
					model: this.model.name,
					layer: this.layer,
					imageIndex: this.imageIndex,
					unitIndex: i
				}));
			}
			
			this.normalUrls = tileUrls;
			
			this._updateTileSize();
			this.urlsChanged('normal');
		});
	},
	
	_constructDistortedTileUrlList: function() {
		// First of all, request some meta data about the model layer shown
		const metaUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/layer/meta'), {
			model: this.model.name,
			layer: this.layer,
			imageIndex: this.imageIndex,
			distortion: this.distortion.name,
			imageAmount: this.distortion.imageAmount
		});
		
		this._requestManager.request(metaUrl).then(metaData => {
			var tileUrls = []
			
			// List all available image tiles and put them into our array
			for (let i in Array.from(Array(metaData.unitCount).keys())) {
				tileUrls.push(tf_backend.addParams(tf_backend.getRouter()
					.pluginRoute('advis', '/layer/image'), {
					model: this.model.name,
					layer: this.layer,
					imageIndex: this.imageIndex,
					unitIndex: i,
					distortion: this.distortion.name,
					imageAmount: this.distortion.imageAmount
				}));
			}
			
			this.distortedUrls = tileUrls;
			
			this._updateTileSize();
			this.urlsChanged('distorted');
		});
	}
};
