'use strict';

declare var palette: any;

Polymer({
  is: 'advis-dashboard',
	listeners: {
    'nodeSelectedEvent': '_nodeSelected',
		'iron-select': '_itemSelected',
		'iron-deselect': '_itemDeselected',
		'model-statistics-selection-changed': '_modelStatisticsSelectionChanged',
    'dialogReturnedEvent': '_dialogReturned'
  },
  properties: {
    selectedModel: {
			type: Object,
			observer: '_reloadModels'
		},
		selectedLayer: String,
		_availableModels: Array,
		_availableDistortions: Array,
		_selectedDistortions: Array,
		_selectedVisualizationDistortion: Object,
    _dataNotFound: Boolean,
		_inputImageAmount: {
			type: Number,
			value: advis.config.requests.imageAmounts.modelAccuracy,
			observer: '_calculateModelAccuracy'
		},
		_accuracyCalculationFlag: Boolean,
    _requestManager: {
      type: Object,
      value: () => new tf_backend.RequestManager()
    }
  },
	
  ready: function() {
		this.reload();
  },
	
	reload: function() {
		if (this._selectedDistortions == null
			|| this._selectedDistortions.length == 0) {
			this._reloadDistortions();
		}
		
    this._reloadModels();
	},
  
  openDistortionConfigurationDialog: function() {
    this.$$('distortion-configuration-dialog').open({
      distortions: this._availableDistortions,
      requestManager: this._requestManager,
			animationTarget: this.$$('#distortion-configuration-button')
				.getBoundingClientRect()
		});
  },
	
	_dialogReturned: function(e) {
		if (e.detail.eventId == 'distortion-configuration-dialog') {
			this.$$('distortion-update-confirmation-dialog').open({
	      changedDistortions: e.detail.content,
	      requestManager: this._requestManager
			});
		} else if (e.detail.eventId == 'distortion-update-confirmation-dialog') {
			this._reloadDistortions(false);
			this._calculateModelAccuracy();
		}
	},
	
  _reloadModels: function() {
		if (this.selectedModel != null) {
			this.$$('graph-view').update();
		}
		
		// Update the layer visualization
		this._fetchModels().then(() => {
			this.$$('layer-visualization').reload();
		});
  },
	
	_reloadDistortions: function(selectAll: Boolean = true) {
		var self = this;
		
		// Update the list of available distortions
		const distortionUrl = tf_backend.getRouter()
			.pluginRoute('advis', '/distortions');
		
		this._requestManager.request(distortionUrl).then(distortions => {
			var newDistortions = []
			
			distortions.forEach((distortion, index) => {
				distortion.imageAmount = advis.config.requests.imageAmounts
					.activationVisualization;
				distortion.index = index;
				newDistortions.push(distortion);
			});
			
			self._availableDistortions = newDistortions;
			
			if (selectAll) {
				// Select all available distortions
				for (var distortion of self._availableDistortions) {
					self.$$('#distortion-selector').select(distortion.index);
				}
				
				this._selectedDistortions = this._availableDistortions;
			}
		});
	},
	
	_modelStatisticsSelectionChanged: function(e) {
		for (var model of this._availableModels) {
			if (model.name == e.detail.model.name) {
				model.selectedForStatistics = e.detail.selected;
				this.set('_accuracyCalculationFlag', !this._accuracyCalculationFlag);
				break;
			}
		}
	},
	
	_nodeSelected: function(e) {
		if (this.selectedModel != null) {
			this.selectedLayer = e.detail.selectedNode;
			this.$$('layer-visualization').reload();
		}
	},
	
	_itemSelected: function(e) {
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
	
	_itemDeselected: function(e) {
		let item = e.detail.item;
		
		if (item.classList.contains('list-item') 
			&& item.classList.contains('distortions')) {
			this._updateDistortionSelection();
		}
	},
	
	_updateDistortionSelection: function() {
		if (this._availableDistortions != null) {
			var newSelectedDistortions = [];
			
			for (var index of this.$$('#distortion-selector').selectedValues) {
				newSelectedDistortions.push(this._availableDistortions[index]);
			}
			
			newSelectedDistortions.sort(this._compareByName)
			
			this._selectedDistortions = newSelectedDistortions;
			this._calculateModelAccuracy();
		}
	},
	
	_getNodeVisualizationDistortions: function(distortion) {
		// Display the node visualization only for the currently selected distortion
		return [distortion];
	},
	
	_compareByName: function(a, b) {
		if (a.name < b.name) {
			return -1;
		} else if (a.name > b.name) {
			return 1;
		} else {
			return 0;
		}
	},
	
	_isLastModelItem: function(index) {
		if (this._availableModels == null) {
			return false;
		} else {
			return (index + 1) == this._availableModels.length;
		}
	},
	
  _fetchModels: function() {
    const url = tf_backend.getRouter().pluginRoute('advis', '/models');
		
    return this._requestManager.request(url).then(models => {
			if (models.length > 0) {
				var availableModels = [];
				
				// Generate a color palette used to assign a color to each model
				let maximumAmountOfColors = 64;
				let colorPalette = palette(
					advis.config.models.colorPalette,
					Math.min(models.length, maximumAmountOfColors)
				);
				
				for (let index in models) {
					let model = models[index];
					
					var newModel = {
						name: model['name'],
						displayName: model['displayName'],
						index: index,
						version: model['version'],
						color: colorPalette[Number(index) % maximumAmountOfColors],
						selectedForStatistics: false,
						accuracy: {}
					}
					
					// If the model existed beforehand, remember its statistics selection
					var selectedForStatistics = false;
					
					if (this._availableModels != null) {
						for (var oldModel of this._availableModels) {
							if (oldModel.name == model['name']) {
								newModel.selectedForStatistics = oldModel.selectedForStatistics;
								
								// If the old model's accuracy had already been calculated, 
								// remember it
								if ('accuracy' in oldModel) {
									newModel.accuracy = oldModel.accuracy;
								}
								
								break;
							}
						}
					}
					
					// Add the current model to the list of available models
					availableModels.push(newModel);
				}
				
				this._availableModels = availableModels;
				this._calculateModelAccuracy();
				
				this._dataNotFound = false;
			} else {
				this._dataNotFound = true;
			}
    });
  },
	
	_calculateModelAccuracy: function() {
		if (this._selectedDistortions == null || this._requestManager == null
			|| this._availableModels == null) {
			return;
		}
		
		let self = this;
		
		// Store the accuracy of the model on the original or a distorted dataset
		let storeAccuracy = async function(modelName, distortionName, top1, top5,
			metrics) {
			for (var model of self._availableModels) {
				if (model.name == modelName) {
					model.accuracy[distortionName] = {
						'top1': top1,
						'top5': top5,
						'metrics': metrics
					}
				}
			}
			
			// Force Polymer to update data bindings
			self.set('_accuracyCalculationFlag', !self._accuracyCalculationFlag);
		}
		
		// Loop through all models and request their accuracies
		for (var model of this._availableModels) {
			// First of all, request the accuracy of non-distorted input images
			var originalUrl = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/predictions/accuracy'), {
				model: model.name,
				inputImageAmount: this._inputImageAmount
			});
			
			this._requestManager.request(originalUrl).then(data => {
				storeAccuracy(
					data.model.name,
					'original',
					data.accuracy.top1,
					data.accuracy.top5,
					data.metrics
				);
			});
			
			// Asynchronously retrieve accuracies of the model on input data that has 
			// been manipulated with all selected distortions
			for (var distortion of this._selectedDistortions) {
				var url = tf_backend.addParams(tf_backend.getRouter()
					.pluginRoute('advis', '/predictions/accuracy'), {
					model: model.name,
					inputImageAmount: this._inputImageAmount,
					distortion: distortion.name
				});
				
				this._requestManager.request(url).then(data => {
					storeAccuracy(
						data.model.name,
						data.input.distortion,
						data.accuracy.top1,
						data.accuracy.top5,
						data.metrics
					);
				});
			}
		}
	}
});

tf_tensorboard.registerDashboard({
  plugin: 'advis',
  elementName: 'advis-dashboard',
  tabName: 'Advis',
  isReloadDisabled: true
});
