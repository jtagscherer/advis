'use strict';

Polymer({
  is: 'advis-dashboard',
	listeners: {
    'nodeSelectedEvent': '_nodeSelected',
		'iron-select': '_itemSelected'
  },
  properties: {
    currentModel: {
			type: String,
			observer: 'reload'
		},
		_availableModels: Array,
		_graphUrl: String,
    _dataNotFound: Boolean,
		_graphNotFound: Boolean,
    _requestManager: {
      type: Object,
      value: () => new tf_backend.RequestManager(1)
    }
  },
	
  ready() {
    this.reload();
  },
  reload() {
		/*if (this.currentModel != null) {
			// TODO: Update the graph
			const graphUrl = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('graphs', '/graph'), {
				run: this.currentModel
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
		}*/
		
		// Update the layer visualization
		this._fetchModels().then(() => {
			this.$$('layer-image').reload();
		});
  },
	
	_nodeSelected(e) {
		if (this.currentModel == null) {
			return;
		}
		
		const visualizationNode = e.detail.selectedNode + '/LayerImage';
		
		// TODO: If we have a visualization for the selected node, show it
		/*if (this.currentRun.tags.includes(visualizationNode)) {
			this.currentTag = visualizationNode;
		}*/
	},
	_itemSelected(e) {
		let item = e.detail.item;
		
		// Make sure this event came from a model list item
		if (item.classList.contains('list-item')
			&& item.classList.contains('models')) {
			// Extract the index of the selected model
			let modelIndex = Number(e.detail.item.dataset.args);
			
			// Select the associated model
			this.currentModel = this._availableModels[modelIndex];
			
			// DEBUG: Run a route
			const url = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layer/meta'), {
				model: this.currentModel.name,
				layer: 'InceptionV3/InceptionV3/Conv2d_1a_3x3/Conv2D'
			});
			
	    this._requestManager.request(url).then(data => {
				console.log(data);
			});
			
			const url2 = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layer/meta'), {
				model: this.currentModel.name,
				layer: 'InceptionV3/InceptionV3/Conv2d_4a_3x3/Conv2D'
			});
			
	    this._requestManager.request(url2).then(data => {
				console.log(data);
			});
		}
	},
	
	_isLastModelItem(index) {
		if (this._availableModels == null) {
			return false;
		} else {
			return (index + 1) == this._availableModels.length;
		}
	},
	
  _fetchModels() {
    const url = tf_backend.getRouter().pluginRoute('advis', '/models');
		
    return this._requestManager.request(url).then(models => {
			if (models.length > 0) {
				var availableModels = [];
				
				for (let index in models) {
					let model = models[index];
					
					availableModels.push({
						name: model['name'],
						displayName: model['displayName'],
						index: index,
						version: model['version']
					});
				}
				
				this._availableModels = availableModels;
				this._dataNotFound = false;
			} else {
				this._dataNotFound = true;
			}
			
			// Check for data availability before assigning variables
			/*if (Object.keys(runToTag).length > 0) {
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
			}*/
    });
  }
});

tf_tensorboard.registerDashboard({
  plugin: 'advis',
  elementName: 'advis-dashboard',
  tabName: 'Advis',
  isReloadDisabled: false
});
