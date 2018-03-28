'use strict';

Polymer({
  is: 'advis-dashboard',
  properties: {
    currentRun: String,
    currentTag: String,
		_graphUrl: String,
    _dataNotFound: Boolean,
    _requestManager: {
      type: Object,
      value: () => new tf_backend.RequestManager()
    }
  },
	
  ready() {
    this.reload();
  },
  reload() {
		if (this.currentRun != null) {
			// Update the graph
			this._graphUrl = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('graphs', '/graph'), {
				run: this.currentRun
			});
		}
		
		// Update the layer visualization
		this._fetchTags().then(() => {
			this.$$('layer-image').reload();
		});
  },
	
  _fetchTags() {
    const url = tf_backend.getRouter().pluginRoute('advis', '/tags');
		
    return this._requestManager.request(url).then(runToTag => {
			// Check for data availability before assigning variables
			if (Object.keys(runToTag).length > 0) {
				// Statically use both the first run and the first tag for now
				this.currentRun = Object.keys(runToTag)[0];
				this.currentTag = runToTag[this.currentRun][0];
				
				this._dataNotFound = false;
			} else {
				this._dataNotFound = true;
			}
    });
  }
});

tf_tensorboard.registerDashboard({
  plugin: 'advis',
  elementName: 'advis-dashboard',
  tabName: 'Advis',
  isReloadDisabled: false
});
