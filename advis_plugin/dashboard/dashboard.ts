'use strict';

Polymer({
  is: 'advis-dashboard',
	listeners: {
    'nodeSelectedEvent': '_nodeSelected'
  },
  properties: {
    currentRun: Object,
    currentTag: String,
		_availableTags: Array,
		_graphUrl: String,
    _dataNotFound: Boolean,
		_graphNotFound: Boolean,
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
			const graphUrl = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('graphs', '/graph'), {
				run: this.currentRun.name
			});
			
			// Check whether graph data is available
			var request = new XMLHttpRequest();
			request.open('GET', graphUrl, true);
			
			var self = this;
			request.onload = function(e) {
				if (request.status === 200) {
					// Update the graph URL which will trigger the graph view to update
					self._graphUrl = graphUrl;
					self._graphNotFound = false;
				} else {
					// Show an error message within the UI
					self._graphNotFound = true;
				}
			};
			
			request.send(null);
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
				const runIndex = 0;
				
				this.currentRun = {
					name: Object.keys(runToTag)[runIndex],
					index: runIndex
				}
				
				this._availableTags = runToTag[this.currentRun.name];
				
				// DEBUG: Statically use the first tag for faster testing
				this.currentTag = this._availableTags[0];
				
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
