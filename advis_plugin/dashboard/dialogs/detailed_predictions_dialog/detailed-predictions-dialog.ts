'use strict';

Polymer({
  is: 'detailed-predictions-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		model: String,
		associatedDataset: String,
		imageIndex: Number,
		distortion: String,
		invariantDistortion: Boolean,
		requestManager: Object,
		
		_loadingLeftPredictions: Boolean,
		_loadingRightPredictions: Boolean,
		_allLeftPredictionsShown: Boolean,
		_allRightPredictionsShown: Boolean,
		
		_predictionAmount: {
			type: Number,
			value: 10
		},
		_distortionIndex: {
			type: Number,
			value: null
		},
		
		eventId: {
			type: String,
			value: 'detailed-predictions-dialog'
		}
  },
	
	reload: function() {
		// Clean up potential old values and reload both prediction views
		this.set('_predictionAmount', 10);
		
		this.$$('#left-predictions').reload();
		this.$$('#right-predictions').reload();
	},
	
	setContent: function(content) {
		this.model = content.model;
		this.associatedDataset = content.associatedDataset;
		this.imageIndex = content.imageIndex;
		this.distortion = content.distortion;
		this.invariantDistortion = content.invariantDistortion;
		this.requestManager = content.requestManager;
		
		this.reload();
	},
	
	loadMorePredictions: function() {
		if (!this._allPredictionsShown(this._allLeftPredictionsShown,
			this._allRightPredictionsShown)) {
			this.set('_predictionAmount', this._predictionAmount + 10);
		}
	},
	
	_allPredictionsShown: function(_allLeftPredictionsShown,
	_allRightPredictionsShown) {
		return _allLeftPredictionsShown && _allRightPredictionsShown;
	},
	
	_loadMoreButtonDisabled: function(_loadingLeftPredictions,
		_loadingRightPredictions, _allLeftPredictionsShown,
		_allRightPredictionsShown) {
		return this._allPredictionsShown(_allLeftPredictionsShown, 
			_allRightPredictionsShown) || _loadingLeftPredictions ||
			_loadingRightPredictions;
	},
	
	_getRightPredictionsTitle: function(distortionIndex) {
		if (distortionIndex == null) {
			return 'Average Distorted';
		} else {
			return 'Distorted';
		}
	}
});
