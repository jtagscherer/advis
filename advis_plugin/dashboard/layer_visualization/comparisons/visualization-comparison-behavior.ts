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
		}
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
		});
	}/*,
	
	_getMetaUrl: function() {
		if (this.distortion != null) {
			return tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layer/meta'), {
				model: this.model.name,
				layer: this.layer,
				imageIndex: this.imageIndex,
				distortion: this.distortion.name,
				imageAmount: this.distortion.imageAmount
			});
		} else {
			return tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layer/meta'), {
				model: this.model.name,
				layer: this.layer,
				imageIndex: this.imageIndex
			});
		}
	},
	
	_getImageUrl: function(unitIndex) {
		if (this.distortion != null) {
			return tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layer/image'), {
				model: this.model.name,
				layer: this.layer,
				imageIndex: this.imageIndex,
				unitIndex: unitIndex,
				distortion: this.distortion.name,
				imageAmount: this.distortion.imageAmount
			});
		} else {
			return tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layer/image'), {
				model: this.model.name,
				layer: this.layer,
				imageIndex: this.imageIndex,
				unitIndex: unitIndex
			});
		}
	}*/
};
