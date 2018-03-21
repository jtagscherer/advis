'use strict';

Polymer({
  is: 'layer-image',
  properties: {
    run: String,
    tag: String,
		
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
			this._canceller.cancelAll();
			
			// TODO: Retrieve image data from our plugin
      const url = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('images', '/images'), {
        tag: this.tag,
        run: this.run
      });
			
	    const updateData = this._canceller.cancellable(result => {
				console.log(result)
				
	      if (!result.cancelled) {
					// TODO: Load the image into our container
					const backendData = result.value;
	      }
	    });
			
	    this.requestManager.request(url).then(updateData);
    }
  }
});
