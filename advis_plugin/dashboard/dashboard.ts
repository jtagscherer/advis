'use strict';

Polymer({
  is: 'advis-dashboard',
	listeners: {
    'nodeSelectedEvent': '_nodeSelected'
  },
  properties: {
    currentRun: String,
    currentTag: String,
		_availableTags: Array,
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
	
	_nodeSelected(e) {
		const visualizationNode = e.detail.selectedNode + '/LayerImage';
		
		// If we have a visualization for the selected node, show it
		if (this._availableTags.includes(visualizationNode)) {
			this.currentTag = visualizationNode;
		}
	},
  _fetchTags() {
    const url = tf_backend.getRouter().pluginRoute('advis', '/tags');
		
    return this._requestManager.request(url).then(runToTag => {
			// Check for data availability before assigning variables
			if (Object.keys(runToTag).length > 0) {
				// Statically use the first run for now
				this.currentRun = Object.keys(runToTag)[0];
				this._availableTags = runToTag[this.currentRun];
				
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
