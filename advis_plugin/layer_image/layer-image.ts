'use strict';

Polymer({
  is: 'layer-image',
  properties: {
    run: Object,
    tag: String,
		urls: Array,
		_requestManager: {
      type: Object,
      value: () => new tf_backend.RequestManager()
    },
		
    _canceller: {
      type: Object,
      value: () => new tf_backend.Canceller(),
    }
  },

  observers: [
		'_fetchNewData(run.name, tag)'
	],
	
  attached() {
    this._attached = true;
    this.reload();
  },
  reload() {
		if (this._hasValidData()) {
			this._fetchNewData(this.run.name, this.tag);
		}
  },
	
	tileTapped(e) {
		// Show the enlarged image tile in a dialog
		this.$$('unit-details-dialog').open({
			model: {
				title: this.run.name,
				caption: `Run ${this.run.index + 1}`
			},
			unit: {
				title: `Tensor ${Number(e.target.dataset.args) + 1}`,
				caption: this.tag.slice(0, -11)
			},
			url: this.urls[e.target.dataset.args]
		});
	},
	
  _fetchNewData(run, tag) {
    if (this._attached) {
			this._constructTileUrlList();
    }
  },
	_hasValidData() {
		return this.run != null && this.tag != null;
	},
	_constructTileUrlList() {
		// First of all, request some meta data about the model layer shown
		const metaUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/layer/meta'), {
			tag: this.tag,
			run: this.run.name
		});
		
		this._requestManager.request(metaUrl).then(metaData => {
			var tileUrls = []
			
			// List all available image tiles and put them into our array
			for (let i in Array.from(Array(metaData.unitCount).keys())) {
				tileUrls.push(tf_backend.addParams(tf_backend.getRouter()
					.pluginRoute('advis', '/layer/image'), {
	        tag: this.tag,
	        run: this.run.name,
					unitIndex: String(i)
	      }));
			}
			
			this.urls = tileUrls;
		});
	}
});
