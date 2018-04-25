'use strict';

Polymer({
  is: 'advis-dashboard',
	listeners: {
    'nodeSelectedEvent': '_nodeSelected',
		'iron-select': '_itemSelected'
  },
  properties: {
    selectedModel: {
			type: String,
			observer: 'reload'
		},
		selectedLayer: String,
		_availableModels: Array,
		_graphStructure: String,
    _dataNotFound: Boolean,
		_graphNotFound: Boolean,
    _requestManager: {
      type: Object,
      value: () => new tf_backend.RequestManager(1, 1)
    }
  },
	
  ready() {
    this.reload();
  },
  reload() {
		if (this.selectedModel != null) {
			// Update the graph
			const url = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/graphs'), {
				model: this.selectedModel.name
			});
			
			var self = this;
			this._requestManager.request(url).then(data => {
				self._graphStructure = data.graph;
				self._graphNotFound = false;
			});
		}
		
		// Update the layer visualization
		this._fetchModels().then(() => {
			this.$$('layer-image').reload();
		});
  },
	
	_nodeSelected(e) {
		if (this.selectedModel != null) {
			this.selectedLayer = e.detail.selectedNode;
		}
		
		// const visualizationNode = e.detail.selectedNode + '/LayerImage';
		
		// Try showing a visualization for the selected node
		
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
			this.selectedModel = this._availableModels[modelIndex];
			
			// TODO: Remove after testing
			// DEBUG: Run a route
			const url = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/layer/meta'), {
				model: this.selectedModel.name,
				layer: 'InceptionV3/InceptionV3/Conv2d_1a_3x3/Conv2D'
			});
			
	    /*this._requestManager.request(url).then(data => {
				console.log(data);
			});*/
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
    });
  }
});

tf_tensorboard.registerDashboard({
  plugin: 'advis',
  elementName: 'advis-dashboard',
  tabName: 'Advis',
  isReloadDisabled: false
});
