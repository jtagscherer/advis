'use strict';

Polymer({
  is: 'layer-image',
  properties: {
    model: Object,
    layer: String,
		_urls: Array,
		_requestManager: {
      type: Object,
      value: () => new tf_backend.RequestManager(1, 1)
    },
		
    _canceller: {
      type: Object,
      value: () => new tf_backend.Canceller(),
    }
  },

  observers: [
		'_fetchNewData(model.name, layer)'
	],
	
  attached() {
    this._attached = true;
    this.reload();
  },
  reload() {
		if (this._hasValidData()) {
			this._fetchNewData(this.model.name, this.layer);
		}
  },
	
	tileTapped(e) {
		// Show the enlarged image tile in a dialog
		this.$$('unit-details-dialog').open({
			model: {
				title: this.model.name,
				caption: `Version ${this.model.version}`
			},
			unit: {
				title: `Tensor ${Number(e.target.dataset.args) + 1}`,
				caption: this.layer
			},
			url: this._urls[e.target.dataset.args],
			animationTarget: e.target.getBoundingClientRect()
		});
	},
	
  _fetchNewData(model, layer) {
    if (this._attached) {
			this._constructTileUrlList();
    }
  },
	_hasValidData() {
		return this.model != null && this.layer != null;
	},
	_constructTileUrlList() {
		// First of all, request some meta data about the model layer shown
		const metaUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/layer/meta'), {
			model: this.model.name,
			layer: this.layer
		});
		
		console.log('Fetching ' + metaUrl + '...');
		
		this._requestManager.request(metaUrl).then(metaData => {
			console.log(metaUrl + ' finished.');
			
			var tileUrls = []
			
			// List all available image tiles and put them into our array
			for (let i in Array.from(Array(metaData.unitCount).keys())) {
				tileUrls.push(tf_backend.addParams(tf_backend.getRouter()
					.pluginRoute('advis', '/layer/image'), {
					model: this.model.name,
					layer: this.layer,
					unitIndex: String(i)
	      }));
			}
			
			this._urls = tileUrls;
			console.log(this._urls);
		});
	}
});
