'use strict';

Polymer({
  is: 'layer-image',
  properties: {
    run: String,
    tag: String,
		_url: String,
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
		'_fetchNewData(run, tag)'
	],
	
  attached() {
    this._attached = true;
    this.reload();
  },
  reload() {
		if (this._hasValidData()) {
			this._fetchNewData(this.run, this.tag);
		}
  },
	
  _fetchNewData(run, tag) {
    if (this._attached) {
			// Update the URL of the current image shown
      this._url = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layer/image'), {
        tag: this.tag,
        run: this.run,
				unitIndex: '0'
      });
			
			this._testMetaRoute(run, tag);
    }
  },
	_hasValidData() {
		return this.run != null && this.tag != null;
	},
	
	// DEBUG: Remove after finishing testing
	_testMetaRoute(run, tag) {
		const testUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/layer/meta'), {
			tag: this.tag,
			run: this.run
		});
		
		this._requestManager.request(testUrl).then(metaData => {
			console.log(metaData);
		});
	}
});
