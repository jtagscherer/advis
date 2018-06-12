module advis.config {
	export const requests = {
		imageAmounts: {
			modelAccuracy: 100,
			activationVisualization: 10,
			nodeActivation: 10
		}
	};
	
	export const models = {
		colorPalette: 'mpn65'
	};
	
	export const graphView = {
		defaults: {
			displayMode: 'simplified',
			displayNodeInformation: false,
			displayMinimap: false,
			displayLegend: true,
			accumulationMethod: 'maximum',
			percentageMode: 'relative',
			colorScaleName: 'spectral'
		}
	};
	
	export const activationVisualization = {
		defaults: {
			difference: {
				colorScaleName: 'spectral'
			}
		}
	};
};
