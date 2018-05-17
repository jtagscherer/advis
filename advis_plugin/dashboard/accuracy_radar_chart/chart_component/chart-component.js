'use strict';

Polymer({
	is: 'chart-component',
	
	properties: {
    chart: {
      notify: true
    },
    data: {
      type: Object,
      value: {}
    },
    options: {
      type: Object,
      value: {}
    },
		_context: Object
  },
	
	behaviors: [
		Polymer.IronResizableBehavior
	],
  observers: [
    '_configurationChanged(data.*, options.*)'
  ],
	listeners: {
    'iron-resize': '_onIronResize'
  },
	
	updateChart: function () {
    this.async(function () {
      if (this.chart) {
				// If the chart has already been initialized, update its data
        this.chart.stop();
        this.mixin(this.chart.data, this.data);
        this.chart.update();
      } else {
				// If the chart has not been initialized yet, create a new one
        this.async(function () {
          if (this.hasData) {
            this.chart = new Chart(this._context, {
              type: 'radar',
              data: this.data,
              options: {
								legend: {
				        	display: false
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
    this._queue();
  },
	
  _configurationChanged: function(dataRecord, optionsRecord) {
		this.hasData = (dataRecord.base.labels && dataRecord.base.datasets);
		
    if (this.hasData && this.isAttached) {
      this._queue();
    }
  },
	
	_measure: function(callback) {
    function measure() {
			callback(this.offsetHeight != undefined);
    }
		
    requestAnimationFrame(measure.bind(this));
  },
	
  _queue: function() {
    if (this.hasData) {
      this._measure(function(hasHeight) {
        if (hasHeight) {
          this.updateChart();
        }
      }.bind(this));
    }
  },
	
  _onIronResize: function() {
    this._queue();
  }
});
