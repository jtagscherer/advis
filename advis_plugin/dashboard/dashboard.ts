'use strict';

declare var palette: any;

Polymer({
  is: 'advis-dashboard',
	listeners: {
    'nodeSelectedEvent': '_nodeSelected',
		'iron-select': '_itemSelected',
		'iron-deselect': '_itemDeselected'
  },
  properties: {
    selectedModel: {
			type: String,
			observer: '_reloadModels'
		},
		selectedLayer: String,
		_availableModels: Array,
		_availableDistortions: Array,
		_selectedDistortions: Array,
		_graphStructure: String,
    _dataNotFound: Boolean,
		_graphNotFound: Boolean,
    _requestManager: {
      type: Object,
      value: () => new tf_backend.RequestManager()
    }
  },
	
  ready() {
		this._reloadDistortions();
    this._reloadModels();
  },
	
  _reloadModels() {
		var self = this;
		
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
	
	_reloadDistortions() {
		var self = this;
		
		// Update the list of available distortions
		const distortionUrl = tf_backend.getRouter()
			.pluginRoute('advis', '/distortions');
		
		this._requestManager.request(distortionUrl).then(distortions => {
			var newDistortions = []
			
			distortions.forEach((distortion, index) => {
				// The image amount is hardcoded for now, this can be changed when 
				// configuring distortions is possible
				distortion.imageAmount = 10;
				distortion.index = index;
				newDistortions.push(distortion);
			});
			
			self._availableDistortions = newDistortions;
			
			// Select all available distortions
			for (var distortion of self._availableDistortions) {
				self.$$('#distortion-selector').select(distortion.index);
			}
			
			this._selectedDistortions = this._availableDistortions;
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
		
		// Find out which kind of list item this event originated from
		if (item.classList.contains('list-item')) {
			if (item.classList.contains('models')) {
				// Extract the index of the selected model
				let modelIndex = Number(e.detail.item.dataset.args);
				
				// Select the associated model
				this.selectedModel = this._availableModels[modelIndex];
			} else if (item.classList.contains('distortions')) {
				this._updateDistortionSelection();
			}
		}
	},
	
	_itemDeselected(e) {
		let item = e.detail.item;
		
		if (item.classList.contains('list-item') 
			&& item.classList.contains('distortions')) {
			this._updateDistortionSelection();
		}
	},
	
	_updateDistortionSelection() {
		if (this._availableDistortions != null) {
			var newSelectedDistortions = [];
			
			for (var index of this.$$('#distortion-selector').selectedValues) {
				newSelectedDistortions.push(this._availableDistortions[index]);
			}
			
			this._selectedDistortions = newSelectedDistortions;
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
				let colorPalette = palette('mpn65', Math.min(models.length, 65));
				
				for (let index in models) {
					let model = models[index];
					
					availableModels.push({
						name: model['name'],
						displayName: model['displayName'],
						index: index,
						version: model['version'],
						color: colorPalette[Number(index) % 65]
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
