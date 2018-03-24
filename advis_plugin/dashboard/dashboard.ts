'use strict';

Polymer({
  is: 'advis-dashboard',
  properties: {
    _currentRun: String,
    _currentTag: String,
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
				this._currentRun = Object.keys(runToTag)[0];
				this._currentTag = runToTag[this._currentRun][0];
				
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
