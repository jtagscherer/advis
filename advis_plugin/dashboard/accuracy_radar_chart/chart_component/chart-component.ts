'use strict';

declare var Chart: any;

Polymer({
	is: 'chart-component',
	
	properties: {
    chart: {
			type: Object,
      notify: true
    },
    data: {
      type: Object,
      value: {}
    },
		availableDistortions: Array,
		selectedDistortion: {
			type: Object,
			observer: '_selectionChanged',
			notify: true
		},
		availableModels: Array,
		selectedModel: {
			type: Object,
			observer: '_selectionChanged',
			notify: true
		},
		_selectedDataPoint: {
			type: Object,
			observer: '_selectedDataPointChanged'
		},
		_context: Object
  },
	
	updateChart: function() {
		this._selectionChanged();
		
    this.async(function() {
      if (this.chart) {
				// If the chart has already been initialized, update its data
        this.chart.stop();
        this.mixin(this.chart.data, this.data);
        this.chart.update();
      } else {
				// If the chart has not been initialized yet, create a new one
        this.async(function() {
          if (this._hasData()) {
            this.chart = new Chart(this._context, {
              type: 'radar',
              data: this.data,
              options: {
								legend: {
				        	display: false
				        },
								scale: {
									ticks: {
										min: 0,
										max: 100,
										stepSize: 20,
										callback: function(tick) {
											return tick.toString() + '%';
										}
									}
								},
								tooltips: {
									callbacks: {
										label: function(tooltipItem, data) {
											let modelName = data.datasets[tooltipItem.datasetIndex]
												.label;
											let percentage = tooltipItem.yLabel.toString();
											
											return `${modelName}: ${Number(percentage).toFixed(2)}%`;
										}
									}
								},
								onClick: function(event, data) {
									document.dispatchEvent(
										new CustomEvent('point-clicked', {detail: data})
									);
								}
							}
            });
          }
        }, null, 0);
      }
    }, null, 0);
  },
	
	resize: function() {
    if (this.chart) {
      this.chart.resize();
      this.chart.render(true);
    }
  },
	
	attached: function() {
    this._context = this.$.canvas.getContext('2d');
		
		let self = this;
		document.addEventListener('point-clicked', function(e) {
			let data = e['detail'];
			
			if (data.length > 0) {
				self.set('_selectedDataPoint', {
					pointIndex: data[0]._index,
					datasetIndex: data[0]._datasetIndex
				});
				
				self.set(
					'selectedModel', self.availableModels[data[0]._datasetIndex]
				);
				
				self.set(
					'selectedDistortion', self.availableDistortions[data[0]._index]
				);
			}
		});
		
		this.updateChart();
  },
	
	_selectionChanged: function(newValue) {
		if (this.data == null || !('datasets' in this.data)
			|| this.data.datasets.length == 0 || this.selectedDistortion == null
			|| this.selectedModel == null || this.availableModels == null) {
			this.set('_selectedDataPoint', null);
			return;
		}
		
		var datasetIndex = 0;
		
		this.availableModels.forEach((model, index) => {
			if (model.name == this.selectedModel.name) {
				datasetIndex = index;
			}
		});
		
		var pointIndex = 0;
		
		this.data.names.forEach((name, index) => {
			if (name == this.selectedDistortion.name) {
				pointIndex = index;
			}
		});
		
		this.set('_selectedDataPoint', {
			pointIndex: pointIndex,
			datasetIndex: datasetIndex
		});
	},
	
	_selectedDataPointChanged: function(newValue, oldValue) {
		if (this.chart == null) {
			return;
		}
		
		// Revert the now deselected data point to its previous appearance
		if (oldValue != null) {
			let defaultSolidColor = this.chart.data.datasets[oldValue.datasetIndex]
				.borderColor;
			
			this.chart.data.datasets[oldValue.datasetIndex]
				.pointBackgroundColor[oldValue.pointIndex] = defaultSolidColor;
			this.chart.data.datasets[oldValue.datasetIndex]
				.pointHoverBackgroundColor[oldValue.pointIndex] = defaultSolidColor;
			this.chart.data.datasets[oldValue.datasetIndex]
				.pointRadius[oldValue.pointIndex] = 3;
			this.chart.data.datasets[oldValue.datasetIndex]
				.pointHoverRadius[oldValue.pointIndex] = 4;
		}
		
		// Highlight the newly selected data point
		if (newValue != null) {
			this.chart.data.datasets[newValue.datasetIndex]
				.pointBackgroundColor[newValue.pointIndex] = '#FFFFFF';
			this.chart.data.datasets[newValue.datasetIndex]
				.pointHoverBackgroundColor[newValue.pointIndex] = '#FFFFFF';
			this.chart.data.datasets[newValue.datasetIndex]
				.pointRadius[newValue.pointIndex] = 6;
			this.chart.data.datasets[newValue.datasetIndex]
				.pointHoverRadius[newValue.pointIndex] = 7;
		}
		
		this.chart.update();
	},
	
	_hasData: function() {
		return this.data != null && this.data.labels != null;
	},
	
  _onIronResize: function() {
		this.resize();
  }
});
