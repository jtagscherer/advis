'use strict';

Polymer({
  is: 'side-by-side',
  properties: {
    model: Object,
    layer: String,
		imageIndex: Number,
		distortion: {
			type: Object,
			observer: 'reload'
		},
		_urls: Array,
		_requestManager: {
      type: Object,
      value: () => new tf_backend.RequestManager()
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
	
	tileTapped: function(e) {
		var unitTitle = `Tensor ${Number(e.target.dataset.args) + 1}`;
		
		if (this.distortion != null) {
			unitTitle += ' (Distorted)'
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
			url: this._urls[e.target.dataset.args],
			animationTarget: e.target.getBoundingClientRect()
		});
	},
	
  _fetchNewData: function(model, layer) {
    if (this._attached) {
			this._constructTileUrlList();
    }
  },
	_hasValidData: function() {
		return this.model != null && this.layer != null && this.imageIndex != null;
	},
	_constructTileUrlList: function() {
		// First of all, request some meta data about the model layer shown
		const metaUrl = this._getMetaUrl();
		
		this._requestManager.request(metaUrl).then(metaData => {
			var tileUrls = []
			
			// List all available image tiles and put them into our array
			for (let i in Array.from(Array(metaData.unitCount).keys())) {
				tileUrls.push(this._getImageUrl(i));
			}
			
			this._urls = tileUrls;
		});
	},
	
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
	}
});
