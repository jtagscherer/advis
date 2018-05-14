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
		_availableDistortions: Array,
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
		var self = this;
		
		// Update the list of available distortions
		const distortionUrl = tf_backend.getRouter()
			.pluginRoute('advis', '/distortions');
		
		this._requestManager.request(distortionUrl).then(distortions => {
			var newDistortions = []
			
			for (var distortion of distortions) {
				// The image amount is hardcoded for now, this can be changed when 
				// configuring distortions is possible
				distortion.imageAmount = 10;
				newDistortions.push(distortion);
			}
			
			self._availableDistortions = newDistortions;
		});
		
		if (this.selectedModel != null) {
			// Update the graph
			const url = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/graphs'), {
				model: this.selectedModel.name
			});
			
			this._requestManager.request(url).then(data => {
				self._graphStructure = data.graph;
				self._graphNotFound = false;
			});
		}
		
		// Update the layer visualization
		this._fetchModels().then(() => {
			this.$$('layer-visualization').reload();
		});
  },
	
	_nodeSelected(e) {
		if (this.selectedModel != null) {
			this.selectedLayer = e.detail.selectedNode;
			this.$$('layer-visualization').reload();
		}
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
