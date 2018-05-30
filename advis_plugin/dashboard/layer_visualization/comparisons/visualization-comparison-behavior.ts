'use strict';

const VisualizationComparisonBehavior = {
	properties: {
		model: {
			type: Object,
			observer: 'reload'
		},
		layer: {
			type: String,
			observer: 'reload'
		},
		imageIndex: {
			type: Number,
			observer: 'reload'
		},
		distortion: {
			type: Object,
			observer: 'reload'
		},
		_originalImageUrl: String,
		_distortedImageUrl: String,
		_originalMetaData: Object,
		_distortedMetaData: Object,
		_originalImageLoaded: Boolean,
		_distortedImageLoaded: Boolean,
		state: {
			type: String,
			value: 'empty',
			observer: 'stateChanged'
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
	
  attached: function() {
    this.reload();
  },
	
	reload: function() {
		if (this._requestManager == null || !this._hasValidData()) {
			return;
		}
		
		this.set('state', 'loading');
		
		this._loadMetaData();
		this._updateImageUrls();
	},
	
	getImageContainerSize: function() {
		// Has to be implemented by components using this behavior
	},
	
	sizeChanged: function() {
		// Can be implemented by components using this behavior
	},
	
	stateChanged: function() {
		// Can be implemented by components using this behavior
	},
	
	_updateState: function() {
		if (this._originalMetaData == null || this._distortedMetaData == null) {
			this.set('state', 'loading');
		} else if (Object.keys(this._originalMetaData).length == 0
			|| Object.keys(this._distortedMetaData).length == 0) {
			this.set('state', 'empty');
		} else if (!this._originalImageLoaded || !this._distortedImageLoaded) {
			this.set('state', 'loading');
		} else {
			this.set('state', 'loaded');
		}
	},
	
	_originalImageCallback: function() {
		this.set('_originalImageLoaded', true);
		this._updateState();
	},
	
	_distortedImageCallback: function() {
		this.set('_distortedImageLoaded', true);
		this._updateState();
	},
	
	_imageClicked: function(e) {
		if (this.state != 'loaded') {
			return;
		}
		
		// Retrieve necessary information from the event
		let visualizationType = e.target.dataset['visualizationType'];
		let imageContainer = e.target.getBoundingClientRect();
		
		let click = {
			x: e.detail.x - imageContainer.left,
			y: e.detail.y - imageContainer.top
		};
		
		var selectedTileIndex = null;
		
		// Simply use the non-distorted tile map since they will always have the 
		// same size
		let tileMap = this._originalMetaData.tileMap;
		
		// Find the image tile the user has clicked on
		for (var tile of tileMap) {
			let bounds = tile.bounds;
			
			if (click.x >= bounds.left && click.x <= bounds.right
				&& click.y >= bounds.top && click.y <= bounds.bottom) {
				selectedTileIndex = tile.index;
				break;
			}
		}
		
		// If a tile has been clicked on, open it in a new dialog
		if (selectedTileIndex != null) {
			// TODO: Open dialog
			console.log(visualizationType);
			console.log(selectedTileIndex);
		}
	},
	
	_updateImageUrls: function() {
		let containerSize = this.getImageContainerSize();
		
		// Construct the URL for the composite image of activations from the
		// original input
		this.set('_originalImageLoaded', false);
		this.set('_originalImageUrl', null);
		this._originalImageUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/layer/composite/image'), {
			model: this.model.name,
			layer: this.layer,
			imageIndex: this.imageIndex,
			width: String(Math.round(containerSize.width)),
			height: String(Math.round(containerSize.height))
		});
		
		// Construct the URL for the composite image of activations from the
		// distorted input
		this.set('_distortedImageLoaded', false);
		this.set('_distortedImageUrl', null);
		this._distortedImageUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/layer/composite/image'), {
			model: this.model.name,
			layer: this.layer,
			imageIndex: this.imageIndex,
			width: String(Math.round(containerSize.width)),
			height: String(Math.round(containerSize.height)),
			distortion: this.distortion.name,
			imageAmount: this.distortion.imageAmount
		});
	},
	
	_loadMetaData: function() {
		let self = this;
		let containerSize = this.getImageContainerSize();
		
		// Load meta data for activations from the original input
		const originalMetaUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/layer/composite/meta'), {
			model: this.model.name,
			layer: this.layer,
			imageIndex: this.imageIndex,
			width: String(Math.round(containerSize.width)),
			height: String(Math.round(containerSize.height))
		});
		
		this._originalMetaData = null;
		this._requestManager.request(originalMetaUrl).then(originalMetaData => {
			self._originalMetaData = originalMetaData;
			self._updateState();
		});
		
		// Load meta data for activations from the distorted input
		const distortedMetaUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/layer/composite/meta'), {
			model: this.model.name,
			layer: this.layer,
			imageIndex: this.imageIndex,
			width: String(Math.round(containerSize.width)),
			height: String(Math.round(containerSize.height)),
			distortion: this.distortion.name,
			imageAmount: this.distortion.imageAmount
		});
		
		this._distortedMetaData = null;
		this._requestManager.request(distortedMetaUrl).then(distortedMetaData => {
			self._distortedMetaData = distortedMetaData;
			self._updateState();
		});
		
		this._updateState();
	},
	
	_hasValidData: function() {
		return this.model != null && this.layer != null && this.imageIndex != null
			&& this.distortion != null;
	},
	
	_sizeChanged: function() {
		this._updateTileSize();
		this.sizeChanged();
	},
	
  /*
	getDialogInputUrl: function(inputType, unitIndex) {
		// Can be implemented by components using this behavior
		if (inputType == 'normal') {
			return this.normalUrls[unitIndex];
		} else if (inputType == 'distorted') {
			return this.distortedUrls[unitIndex];
		}
	},
	
	getDialogTitle: function(inputType, unitTitle) {
		// Can be implemented by components using this behavior
		if (inputType == 'normal') {
			return unitTitle;
		} else if (inputType == 'distorted') {
			return unitTitle + ' (Distorted)';
		}
	},
	
	openUnitDialog: function(e) {
		let inputType = e.target.dataset.inputType;
		let unitIndex = e.target.dataset.unitIndex;
		
		let unitTitle = this.getDialogTitle(inputType, 
			`Tensor ${Number(unitIndex) + 1}`);
		let unitImageUrl = this.getDialogInputUrl(inputType, unitIndex);
		
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
	*/
};
