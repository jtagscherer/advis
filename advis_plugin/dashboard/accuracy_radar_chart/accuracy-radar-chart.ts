'use strict';

Polymer({
  is: 'accuracy-radar-chart',
	properties: {
		models: {
			type: Array,
			observer: '_updateGraph'
		},
		distortions: {
			type: Array,
			observer: '_updateGraph'
		},
		metric: {
			type: String,
			observer: '_updateGraph'
		},
		selectedDistortion: {
			type: Object,
			notify: true
		},
		accuracyCalculationFlag: {
			type: Boolean,
			observer: '_updateGraph'
		},
		data: Object
	},
	
	_updateGraph: function() {
		// Make sure our data is in a valid state
		if (this.data == null || this.data == {}) {
			this.data = {
				labels: [],
				datasets: []
			}
		}
		
		if (this.models == null || this.distortions == null
			|| this.metric == null) {
			return;
		}
		
		// Extract all models selected for statistics and with complete accuracy 
		// data for all selected distortion methods
		var selectedModels = [];
		
		modelLoop:
		for (var model of this.models) {
			if (model.selectedForStatistics) {
				for (var distortion of this.distortions) {
					if (!(distortion.name in model.metrics)) {
						continue modelLoop;
					}
				}
				
				selectedModels.push(model);
			}
		}
		
		// Create a label for each selected distortion method
		var labels = [];
		var names = [];
		
		for (var distortion of this.distortions) {
			labels.push(distortion.displayName);
			names.push(distortion.name);
		}
		
		// Assign the labels to the data
		this.data.labels = labels;
		this.data.names = names;
		
		// Update the datasets with the models we have retrieved
		this._updateDatasets(selectedModels);
		
		this.$$('chart-component').updateChart();
	},
	
	_updateDatasets: function(models) {
		// Remove any models within the dataset that are no longer selected for 
		// statistics or no longer existent
		var prunedDatasets = [];
		
		for (var currentDataset of this.data.datasets) {
			var associatedModel;
			
			for (var currentModel of this.models) {
				if (currentModel.name == currentDataset.id) {
					associatedModel = currentModel;
					break;
				}
			}
			
			if (associatedModel != null && associatedModel.selectedForStatistics) {
				prunedDatasets.push(currentDataset);
			}
		}
		
		// Loop through all selected models and adjust data accordingly
		var updatedDatasets = [];
		
		modelLoop:
		for (var model of models) {
			// Construct a list of data points
			var data = [];
			
			for (var distortion of this.distortions) {
				data.push(model.metrics[distortion.name][this.metric] * 100);
			}
			
			// Check if there is already a dataset for this model
			for (var dataset of prunedDatasets) {
				if (dataset.id == model.name && dataset.data == data) {
					// Use the old dataset if the data is the same
					updatedDatasets.push(dataset);
					continue modelLoop;
				}
			}
			
			// Derive some graph colors from the model's associated color
			let translucentColor = this._getColorFromHex(model.color, 0.2);
			let solidColor = this._getColorFromHex(model.color);
			
			// Create arrays with default point styles
			let pointBackgroundColors = Array(data.length).fill(solidColor);
			let radii = Array(data.length).fill(3);
			let hoverRadii = Array(data.length).fill(4);
			
			// If we have not skipped this model, we have to add its data
			updatedDatasets.push({
				label: model.displayName,
				id: model.name,
				backgroundColor: translucentColor,
				borderColor: solidColor,
				pointBackgroundColor: pointBackgroundColors,
				pointHoverBackgroundColor: pointBackgroundColors,
				pointRadius: radii,
				pointHoverRadius: hoverRadii,
				pointBorderWidth: 3,
				pointHoverBorderWidth: 3,
				pointBorderColor: solidColor,
				pointHoverBorderColor: solidColor,
				data: data
			});
		}
		
		this.data.datasets = updatedDatasets;
	},
	
	_getColorFromHex: function(hex, alpha) {
    var r = parseInt(hex.slice(0, 2), 16),
      	g = parseInt(hex.slice(2, 4), 16),
      	b = parseInt(hex.slice(4, 6), 16);
		
    if (alpha) {
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    } else {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
	}
});
