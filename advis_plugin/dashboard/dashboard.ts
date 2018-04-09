'use strict';

Polymer({
  is: 'advis-dashboard',
	listeners: {
    'nodeSelectedEvent': '_nodeSelected',
		'iron-select': '_itemSelected'
  },
  properties: {
    currentRun: {
			type: Object,
			observer: 'reload'
		},
    currentTag: String,
		_availableRuns: Array,
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
		if (this.currentRun == null) {
			return;
		}
		
		const visualizationNode = e.detail.selectedNode + '/LayerImage';
		
		// If we have a visualization for the selected node, show it
		if (this.currentRun.tags.includes(visualizationNode)) {
			this.currentTag = visualizationNode;
		}
	},
	_itemSelected(e) {
		let item = e.detail.item;
		
		// Make sure this event came from a model list item
		if (item.classList.contains('list-item')
			&& item.classList.contains('models')) {
			// Extract the index of the selected run
			let runIndex = Number(e.detail.item.dataset.args);
			
			// Select the associated run
			this.currentRun = this._availableRuns[runIndex];
		}
	},
	
	_isLastModelItem(index) {
		if (this._availableRuns == null) {
			return false;
		} else {
			return (index + 1) == this._availableRuns.length;
		}
	},
	
  _fetchTags() {
    const url = tf_backend.getRouter().pluginRoute('advis', '/tags');
		
    return this._requestManager.request(url).then(runToTag => {
			// Check for data availability before assigning variables
			if (Object.keys(runToTag).length > 0) {
				var availableRuns = [];
				
				for (let runIndex in Object.keys(runToTag)) {
					let runName = Object.keys(runToTag)[runIndex];
					
					availableRuns.push({
						name: runName,
						index: runIndex,
						tags: runToTag[runName]
					});
				}
				
				this._availableRuns = availableRuns;
				
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
