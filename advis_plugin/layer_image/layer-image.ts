'use strict';

Polymer({
  is: 'layer-image',
  properties: {
    run: String,
    tag: String,
		url: String,
		
    requestManager: Object,
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
    this._fetchNewData(this.run, this.tag);
  },
	
  _fetchNewData(run, tag) {
    if (this._attached) {
			// Update the URL of the current image shown
      this.url = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layerImage'), {
        tag: this.tag,
        run: this.run
      });
    }
  }
});
