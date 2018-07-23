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
			observer: '_stateChanged'
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
	
	_stateChanged: function(state) {
		this.fire('state-changed-event', {
			element: this.is,
			state: this.state
		});
		
		this.stateChanged();
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
	
	_getSpinnerClass: function(condition, state) {
		if (condition && state != 'empty') {
			return 'hidden';
		} else {
			return 'shown';
		}
	},
	
	_getSpinnerClassByState: function(state) {
		if (state == 'loading') {
			return 'shown';
		} else {
			return 'hidden';
		}
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
		
		var selectedTile = null;
		
		// Simply use the non-distorted tile map since they will always have the 
		// same size
		let tileMap = this._originalMetaData.tileMap;
		let tileSize = this._originalMetaData.configuration.tileSize;
		
		// Find the image tile the user has clicked on
		for (var tile of tileMap) {
			let bounds = tile.bounds;
			
			if (click.x >= bounds.left && click.x <= bounds.right
				&& click.y >= bounds.top && click.y <= bounds.bottom) {
				selectedTile = {
					index: tile.index,
					bounds: {
						left: bounds.left + imageContainer.left,
						right: bounds.right + imageContainer.left,
						top: bounds.top + imageContainer.top,
						bottom: bounds.bottom + imageContainer.top,
						width: tileSize,
						height: tileSize
					}
				};
				break;
			}
		}
		
		// If a tile has been clicked on, open it in a new dialog
		if (selectedTile != null) {
			this._openUnitDialog({
				visualizationType: visualizationType,
				selectedTile: selectedTile,
				clickCoordinates: click
			});
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
	
	getSingleTileImageUrl: function(visualizationType, tileIndex) {
		if (visualizationType == 'original') {
			return tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layer/single/image'), {
				model: this.model.name,
				layer: this.layer,
				imageIndex: this.imageIndex,
				unitIndex: tileIndex
			});
		} else if (visualizationType == 'distorted') {
			return tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layer/single/image'), {
				model: this.model.name,
				layer: this.layer,
				imageIndex: this.imageIndex,
				distortion: this.distortion.name,
				imageAmount: this.distortion.imageAmount,
				unitIndex: tileIndex
			});
		}
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
	
	getDialogImageSource: function(data, callback) {
		// Has to be implemented by components using this behavior
	},
	
	getDialogTitle: function(data) {
		// Has to be implemented by components using this behavior
	},
	
	_openUnitDialog: function(data) {
		let unitDialog = this.$$('unit-details-dialog');
		
		// Open the bare unit dialog
		unitDialog.open({
			model: {
				title: this.model.displayName,
				caption: `Version ${this.model.version}`
			},
			unit: {
				title: this.getDialogTitle(data),
				caption: this.layer
			},
			animationTarget: data.selectedTile.bounds
		});
		
		// Asynchronously construct and set the source of the image to be shown
		this.getDialogImageSource(data, function(source) {
			unitDialog.updateImageSource(source);
		});
	}
};
