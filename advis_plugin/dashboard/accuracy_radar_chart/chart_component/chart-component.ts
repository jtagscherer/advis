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
		_context: Object
  },
	
	updateChart: function() {
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
		this.updateChart();
  },
	
	_hasData: function() {
		return this.data != null && this.data.labels != null;
	},
	
  _onIronResize: function() {
		this.resize();
  }
});
