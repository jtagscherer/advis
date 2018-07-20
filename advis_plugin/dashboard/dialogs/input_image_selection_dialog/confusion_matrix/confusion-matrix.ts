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
			value: 'original',
			observer: 'reload'
		},
		hoveredPixel: {
			type: Object,
			value: null
		},
		_matrixData: Object,
		_matrixImage: String,
		_categories: Array,
		_categoryHierarchy: Object,
		_contentSize: Number
	},
	
	reload: function() {
		if (this.model != null && this.dataset != null && this.distortion != null
			&& this.requestManager != null) {
			this._retrieveCategories();
			this._generateMatrixImage();
		}
	},
	
	_getLabel: function(position) {
		if (this._categories != null && position != null) {
			return this._categories[position].name;
		} else {
			return 'None';
		}
	},
	
	_getMatrixValue: function(x, y) {
		return this._matrixData[x][y];
	},
	
	_getHoverClass: function(hoveredPixel) {
		if (hoveredPixel == null) {
			return 'hidden';
		} else {
			return 'shown';
		}
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
	
	_generateMatrixImage: function() {
		let self = this;
		
		const matrixUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/confusion/matrix/full'), {
			model: this.model,
			distortion: this.distortion,
			mode: this.matrixMode
		});
		
		this.requestManager.request(matrixUrl).then(result => {
			self.set('_matrixData', result.confusionMatrix.matrix);
			
			let matrixLabels = Object.keys(result.confusionMatrix.matrix);
			let matrixSize = matrixLabels.length;
			let valueRange = result.confusionMatrix.range;
			let valueSpan = Math.abs(valueRange.maximum - valueRange.minimum);
			
			let canvas = document.createElement('canvas');
			canvas.width = matrixSize;
			canvas.height = matrixSize;
			let context = canvas.getContext('2d');
			
			var imageData = context.getImageData(0, 0, matrixSize, matrixSize);
			
			let colorScale = chroma.scale('Spectral').domain([1, 0]);
			
			for (var x = 0; x < matrixSize; x++) {
				for (var y = 0; y < matrixSize; y++) {
					let dataIndex = (x + (y * matrixSize)) * 4;
					
					let predictedLabel = matrixLabels[x];
					let actualLabel = matrixLabels[y];
					let value = result.confusionMatrix
						.matrix[actualLabel][predictedLabel];
					
					let cellColor = colorScale(
						(value + valueRange.minimum) / valueSpan
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
			self.set('_contentSize', Math.round(Math.min(self.$$('#content')
				.offsetWidth, self.$$('#content').offsetHeight) * 0.6));
			
			this.customStyle['--matrix-size'] = `${self._contentSize}px`;
			this.updateStyles();
		});
	}
});
