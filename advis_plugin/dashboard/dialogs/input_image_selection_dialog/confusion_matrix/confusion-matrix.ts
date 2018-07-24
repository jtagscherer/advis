'use strict';

declare var chroma: any;

Polymer({
  is: 'confusion-matrix',
	properties: {
		model: {
			type: String,
			observer: 'reload'
		},
		dataset: {
			type: String,
			observer: 'reload'
		},
		distortion: {
			type: String,
			observer: 'reload'
		},
		requestManager: {
			type: Object,
			observer: 'reload'
		},
		matrixMode: {
			type: String,
			notify: true,
			observer: '_matrixModeChanged'
		},
		hoveredPixel: {
			type: Object,
			value: null
		},
		hoveredLabelPath: {
			type: String,
			value: null
		},
    verticalOffset: {
			type: Object,
			value: null,
			notify: true
		},
    horizontalOffset: {
			type: Object,
			value: null,
			notify: true
		},
    selectionRectangle: {
      type: Object,
      notify: true
    },
		_matrixData: Object,
		_labels: Array,
		_precisionData: Array,
		_recallData: Array,
		_matrixImage: String,
		_precisionImage: String,
		_recallImage: String,
		_categories: Array,
		_categoryHierarchy: Object,
		_contentSize: Number,
		_selectedTab: {
			type: Number,
			value: 1,
			observer: '_selectedTabChanged'
		}
	},
	
	listeners: {
		'label-hovered-event': '_labelHovered'
	},
	
	reload: function() {
		if (this.model != null && this.dataset != null && this.distortion != null
			&& this.matrixMode != null && this.requestManager != null) {
			this._retrieveCategories();
			this._generateMatrixImage();
		}
	},
	
	_getLabel: function(position) {
		if (this._categories != null && position != null
			&& this._categories[position] != null) {
			return this._categories[position].name;
		} else {
			return 'None';
		}
	},
	
	_getMatrixValue: function(x, y) {
    if (this._matrixData != null && this._matrixData[x] != null) {
      return this._matrixData[x][y];
    }
	},
	
	_getHoverClass: function(hoveredPixel, hoveredLabelPath) {
		if (hoveredPixel == null && hoveredLabelPath == null) {
			return 'hidden';
		} else {
			return 'shown';
		}
	},
	
	_getTabsClass: function(hoveredPixel, hoveredLabelPath) {
		if (hoveredPixel != null || hoveredLabelPath != null) {
			return 'hidden';
		} else {
			return 'shown';
		}
	},
	
	_isNotNull: function(value) {
		return value != null;
	},
	
	_clearSelection: function() {
		this.set('selectionRectangle', null);
	},
	
	_retrieveCategories: function() {
		let self = this;
		
		// Retrieve all categories as a list
		let categoryListUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/datasets/categories/list'), {
			dataset: this.dataset,
			ordering: 'hierarchical'
		});
		
		this.requestManager.request(categoryListUrl).then(result => {
			self.set('_categories', result);
		});
		
		// Retrieve the hierarchy of all categories
		let categoryHierarchyUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/datasets/categories/hierarchy'), {
			dataset: this.dataset
		});
		
		this.requestManager.request(categoryHierarchyUrl).then(result => {
			self.set('_categoryHierarchy', result);
		});
	},
	
	_generateMatrixImage: function(updateSize=true) {
		let self = this;
		
		const matrixUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/confusion/matrix/full'), {
			model: this.model,
			distortion: this.distortion,
			mode: this.matrixMode
		});
		
		this.requestManager.request(matrixUrl).then(result => {
			this.set('_matrixData', result.confusionMatrix.matrix);
			this.set('_labels', result.confusionMatrix.labels);
			self.set('_precisionData', result.precision);
			self.set('_recallData', result.recall);
			
			self.set(
				'_precisionImage',
				self._generateMetricImage(result.precision, 'horizontal')
			);
			self.set(
				'_recallImage',
				self._generateMetricImage(result.recall, 'vertical')
			);
			
			let matrixLabels = result.confusionMatrix.labels;
			let matrixSize = matrixLabels.length;
			let valueRange = result.confusionMatrix.range;
			let valueSpan = Math.abs(valueRange.maximum - valueRange.minimum);
			
			// Generate an image of the confusion matrix
			let canvas = document.createElement('canvas');
			canvas.width = matrixSize;
			canvas.height = matrixSize;
			let context = canvas.getContext('2d');
			
			var imageData = context.getImageData(0, 0, matrixSize, matrixSize);
			
			let colorScale = chroma.scale('Spectral').domain([1, 0]);
			
			for (var x = 0; x < matrixSize; x++) {
				for (var y = 0; y < matrixSize; y++) {
					let dataIndex = (y + (x * matrixSize)) * 4;
					
					let predictedLabel = matrixLabels[x];
					let actualLabel = matrixLabels[y];
					
					var value = result.confusionMatrix
						.matrix[predictedLabel][actualLabel];
					
					let cellColor = colorScale(
						(value + Math.abs(valueRange.minimum)) / valueSpan
					).get('rgba');
					
					imageData.data[dataIndex] = cellColor[0];
          imageData.data[dataIndex + 1] = cellColor[1];
          imageData.data[dataIndex + 2] = cellColor[2];
          imageData.data[dataIndex + 3] = cellColor[3] * 255;
				}
			}
      
      // Draw the image data onto the canvas
      context.putImageData(imageData, 0, 0);
			
			self.set('_matrixImage', canvas.toDataURL('image/png'));
			
			if (updateSize) {
				self.set('_contentSize', Math.round(Math.min(self.$$('#content')
					.offsetWidth, self.$$('#content').offsetHeight) * 0.5));
				this.customStyle['--matrix-size'] = `${self._contentSize}px`;
				this.updateStyles();
			}
		});
	},
	
	_matrixModeChanged: function() {
		if (this.model != null && this.dataset != null && this.distortion != null
			&& this.matrixMode != null && this.requestManager != null
			&& this._contentSize != null) {
			this._generateMatrixImage(false);
		}
	},
	
	_generateMetricImage: function(data, orientation) {
		var width = 0;
		var height = 0;
		if (orientation == 'vertical') {
			width = 1;
			height = data.length;
		} else if (orientation == 'horizontal') {
			width = data.length;
			height = 1;
		}
		
		let canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		
		let context = canvas.getContext('2d');
		var imageData = context.getImageData(0, 0, width, height);
		
		let colorScale = chroma.scale('Spectral').domain([1, 0]);
		
		for (var i = 0; i < data.length; i++) {
			let dataIndex = i * 4;
			let value = data[i];
			var cellColor;
			
			if (value != null) {
				if (this.matrixMode == 'difference') {
					cellColor = colorScale((value + 1) / 2).get('rgba');
				} else {
					cellColor = colorScale(value).get('rgba');
				}
			} else {
				cellColor = colorScale(0).get('rgba');
			}
			
			imageData.data[dataIndex] = cellColor[0];
			imageData.data[dataIndex + 1] = cellColor[1];
			imageData.data[dataIndex + 2] = cellColor[2];
			imageData.data[dataIndex + 3] = cellColor[3] * 255;
		}
		
		context.putImageData(imageData, 0, 0);
		return canvas.toDataURL('image/png');
	},
	
	_labelHovered: function(e) {
		if (e.detail.path == null) {
			this.set('hoveredLabelPath', null);
		} else {
			// Create a string from the path
			let path = e.detail.path.map(n => {
				let name = n.split(', ')[0];
				return name.charAt(0).toUpperCase() + name.slice(1);
			});
			
			this.set('hoveredLabelPath', path.join(' > '));
		}
	},
	
	_selectedTabChanged: function(value) {
		switch (value) {
			case 0:
				this.set('matrixMode', 'original');
				break;
			case 1:
				this.set('matrixMode', 'difference');
				break;
			case 2:
				this.set('matrixMode', 'distorted');
				break;
		}
	}
});
