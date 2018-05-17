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
		accuracyCalculationFlag: {
			type: Boolean,
			observer: '_updateGraph'
		},
		data: Object
	},
	
	_updateGraph() {
		// Make sure our data is in a valid state
		if (this.data == null || this.data == {}) {
			this.data = {
				labels: [],
				datasets: []
			}
		}
		
		if (this.models == null || this.distortions == null) {
			return;
		}
		
		// Extract all models selected for statistics and with complete accuracy 
		// data for all selected distortion methods
		var selectedModels = [];
		
		modelLoop:
		for (var model of this.models) {
			if (model.selectedForStatistics) {
				for (var distortion of this.distortions) {
					if (!(distortion.name in model.accuracy)) {
						continue modelLoop;
					}
				}
				
				selectedModels.push(model);
			}
		}
		
		// Create a label for each selected distortion method
		var labels = [];
		
		for (var distortion of this.distortions) {
			labels.push(distortion.displayName);
		}
		
		// Assign the labels to the data
		this.data.labels = labels;
		
		// Update the datasets with the models we have retrieved
		this._updateDatasets(selectedModels);
		
		this.$$('chart-component').updateChart();
	},
	
	_updateDatasets(models) {
		// Remove any models within the dataset that are no longer selected for 
		// statistics or no longer existent
		for (var datasetIndex in this.data.datasets) {
			let currentDataset = this.data.datasets[datasetIndex];
			var associatedModel;
			
			for (var currentModel of this.models) {
				if (currentModel.name == currentDataset.id) {
					associatedModel = currentModel;
					break;
				}
			}
			
			if (associatedModel == null || !associatedModel.selectedForStatistics) {
				this.splice('data.datasets', datasetIndex, 1);
			}
		}
		
		// Loop through all selected models and adjust data accordingly
		modelLoop:
		for (var model of models) {
			// Construct a list of data points
			var data = [];
			
			for (var distortion of this.distortions) {
				data.push(model.accuracy[distortion.name].top5 * 100);
			}
			
			// Check if there is already a dataset for this model
			for (var index in this.data.datasets) {
				let dataset = this.data.datasets[index];
				
				if (dataset.id == model.name) {
					if (dataset.data == data) {
						// Skip if the data is the same
						continue modelLoop;
					} else {
						// Remove the old dataset if it is not the same
						this.splice('data.datasets', index, 1);
					}
				}
			}
			
			// If we have not skipped this model, we have to add its data
			this.push('data.datasets', {
				label: model.displayName,
				id: model.name,
				backgroundColor: "rgba(179,181,198,0.2)",
				borderColor: "rgba(179,181,198,1)",
				pointBackgroundColor: "rgba(179,181,198,1)",
				pointBorderColor: "#fff",
				pointHoverBackgroundColor: "#fff",
				pointHoverBorderColor: "rgba(179,181,198,1)",
				data: data
			});
		}
	}
});
