'use strict';

declare var palette: any;

Polymer({
  is: 'advis-dashboard',
	listeners: {
    'nodeSelectedEvent': '_nodeSelected',
		'iron-select': '_itemSelected',
		'iron-deselect': '_itemDeselected',
		'model-statistics-selection-changed': '_modelStatisticsSelectionChanged',
    'dialogReturnedEvent': '_dialogReturned',
    'open-detailed-performance-dialog': 'openDetailedPerformanceDialog',
    'open-detailed-predictions-dialog': 'openDetailedPredictionsDialog',
    'open-distorted-image-prediction-dialog': 'openDistortedImagePredictionDialog'
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
			observer: '_calculateModelMetrics'
		},
		_accuracyCalculationFlag: Boolean,
		_selectedRadarChartMetric: {
			type: String,
			value: 'top5'
		},
		_selectedModelListMetrics: {
			type: Array,
			value: ['f1', 'top5']
		},
		_availableMetrics: {
			type: Array,
			value: ['top1', 'top5', 'f1', 'precision', 'recall']
		},
		_modelSelected: {
			type: Boolean,
			value: false
		},
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
  
  openSettingsDialog: function() {
		var availableMetrics = [];
		for (const metric of this._availableMetrics) {
			availableMetrics.push({
				name: metric,
				description: this._getMetricDescription(metric)
			});
		}
		
    this.$$('sidebar-settings-dialog').open({
      selectedRadarChartMetric: this._selectedRadarChartMetric,
      selectedModelListMetrics: this._selectedModelListMetrics,
			availableMetrics: availableMetrics,
			animationTarget: this.$$('#sidebar-settings-button')
				.getBoundingClientRect()
		});
  },
	
	openDetailedPerformanceDialog: function(e) {
    // Compile a list of available metrics and display names
    var availableMetrics = [];
    for (let metric of this._availableMetrics) {
      availableMetrics.push({
        name: metric,
        displayName: this._getMetricDescription(metric),
				percent: metric == 'top1' || metric == 'top5'
      });
    }
    
		this.$$('detailed-performance-dialog').open({
      model: e.detail.model,
      availableMetrics: availableMetrics,
			availableDistortions: this._availableDistortions,
			animationTarget: e.detail.animationTarget
		});
	},
  
  openDetailedPredictionsDialog: function(e) {
		if (this.selectedModel != null
			&& this._selectedVisualizationDistortion != null) {
			var invariantDistortion = true;
			for (const parameter in this._selectedVisualizationDistortion
				.parameters) {
				const _parameter = this._selectedVisualizationDistortion
					.parameters[parameter];
				
				if (_parameter.type == 'range') {
					invariantDistortion = false;
					break;
				}
			}
			
			this.$$('detailed-predictions-dialog').open({
				model: this.selectedModel.name,
				associatedDataset: e.detail.associatedDataset,
				imageIndex: e.detail.imageIndex,
				distortion: this._selectedVisualizationDistortion.name,
				invariantDistortion: invariantDistortion,
				requestManager: this._requestManager,
				animationTarget: e.detail.animationTarget
			});
		}
  },
	
	openDistortedImagePredictionDialog: function(e) {
		this.$$('distorted-image-prediction-dialog').open({
			model: e.detail.model,
			associatedDataset: e.detail.associatedDataset,
			imageIndex: e.detail.imageIndex,
			distortion: e.detail.distortion,
      distortionIndex: e.detail.distortionIndex,
      groundTruthCategory: e.detail.groundTruthCategory,
			requestManager: this._requestManager,
			animationTarget: e.detail.animationTarget
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
			this._calculateModelMetrics();
		} else if (e.detail.eventId == 'sidebar-settings-dialog') {
			this.set(
				'_selectedRadarChartMetric',
				e.detail.content.selectedRadarChartMetric
			);
			this.set(
				'_selectedModelListMetrics',
				e.detail.content.selectedModelListMetrics
			);
		} else if (e.detail.eventId == 'distorted-image-prediction-dialog') {
			this.$$('detailed-predictions-dialog').setDistortionIndex(e.detail
				.content.index);
		}
	},
	
  _reloadModels: function() {
		if (this.selectedModel != null) {
			this.set('_modelSelected', true);
		} else {
			this.set('_modelSelected', false);
		}
		
		if (this.selectedModel != null && this.$$('graph-view') != null) {
			this.$$('graph-view').update();
		}
		
		// Update the layer visualization
		this._fetchModels().then(() => {
			if (this.selectedModel != null) {
				this.$$('layer-visualization').reload();
			}
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
    // Update the model's selection state
		for (var model of this._availableModels) {
			if (model.name == e.detail.model.name) {
				model.selectedForStatistics = e.detail.selected;
				this.set('_accuracyCalculationFlag', !this._accuracyCalculationFlag);
				break;
			}
		}
    
    // Check whether at least one model is selected
    var modelSelected = false;
    for (var model of this._availableModels) {
      if (model.selectedForStatistics) {
        modelSelected = true;
        break;
      }
    }
		
		// Hide or show the empty state depending on whether at least one model has 
		// been selected
		if (modelSelected) {
			this.customStyle['--radar-chart-empty-state-opacity'] = '0';
		} else {
			this.customStyle['--radar-chart-empty-state-opacity'] = '1';
		}
		this.updateStyles();
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
			this._calculateModelMetrics();
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
	
	_getMetricDescription: function(metric) {
		switch (metric) {
			case 'top1':
				return 'Top 1 Accuracy';
			case 'top5':
				return 'Top 5 Accuracy';
			case 'f1':
				return 'F1 Score';
			case 'precision':
				return 'Precision';
			case 'recall':
				return 'Recall';
		}
	},
	
	_getRadarChartMetricTitle: function(metric) {
		return `Model ${this._getMetricDescription(metric)}`;
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
						metrics: {}
					}
					
					// If the model existed beforehand, remember its statistics selection
					var selectedForStatistics = false;
					
					if (this._availableModels != null) {
						for (var oldModel of this._availableModels) {
							if (oldModel.name == model['name']) {
								newModel.selectedForStatistics = oldModel.selectedForStatistics;
								
								// If the old model's metrics had already been calculated, 
								// remember it
								if ('metrics' in oldModel) {
									newModel.metrics = oldModel.metrics;
								}
								
								break;
							}
						}
					}
					
					// Add the current model to the list of available models
					availableModels.push(newModel);
				}
				
				this._availableModels = availableModels;
				this._calculateModelMetrics();
				
				this._dataNotFound = false;
			} else {
				this._dataNotFound = true;
			}
    });
  },
	
	_calculateModelMetrics: function() {
		if (this._selectedDistortions == null || this._requestManager == null
			|| this._availableModels == null) {
			return;
		}
		
		let self = this;
		
		// Store the metrics of the model on the original or a distorted dataset
		let storeMetrics = async function(modelName, distortionName, top1, top5,
			f1, precision, recall) {
			for (var model of self._availableModels) {
				if (model.name == modelName) {
					model.metrics[distortionName] = {
						'top1': top1,
						'top5': top5,
						'f1': f1,
						'precision': precision,
						'recall': recall
					}
				}
			}
			
			// Force Polymer to update data bindings
			self.set('_accuracyCalculationFlag', !self._accuracyCalculationFlag);
		}
		
		// Loop through all models and request their accuracies
		for (var model of this._availableModels) {
			// First of all, request the metrics of non-distorted input images
			var originalUrl = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/predictions/accuracy'), {
				model: model.name,
				inputImageAmount: this._inputImageAmount
			});
			
			this._requestManager.request(originalUrl).then(data => {
				storeMetrics(
					data.model.name,
					'original',
					data.accuracy.top1,
					data.accuracy.top5,
					data.metrics.f1,
					data.metrics.precision,
					data.metrics.recall
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
					storeMetrics(
						data.model.name,
						data.input.distortion,
						data.accuracy.top1,
						data.accuracy.top5,
						data.metrics.f1,
						data.metrics.precision,
						data.metrics.recall
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
