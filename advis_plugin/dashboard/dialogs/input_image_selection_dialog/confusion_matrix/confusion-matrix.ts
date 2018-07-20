'use strict';

declare var chroma: any;

Polymer({
  is: 'confusion-matrix',
	properties: {
		model: {
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
		_matrixImage: String,
		_contentSize: Number
	},
	
	reload: function() {
		if (this.model != null && this.distortion != null
			&& this.requestManager != null) {
			this._generateMatrixImage();
		}
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
