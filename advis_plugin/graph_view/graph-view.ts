'use strict';

Polymer({
  is: 'graph-view',
  properties: {
    stats: Object,
		
    pbtxtFileLocation: {
      type: String,
      observer: '_updateGraph'
    },
    pbtxt: {
      type: String,
      observer: '_updateGraph'
    },
      
    width: {
      type: Number,
      observer: '_updateWidth'
    },
    height: {
      type: Number,
      observer: '_updateHeight'
    },
    toolbar: {
      type: Boolean,
      observer: '_updateToolbar'
    },

    _renderHierarchy: Object,
    _progress: Object
  },
	
  _updateToolbar: function() {
    this.$$('.container').classList.toggle('no-toolbar', !this.toolbar);
  },
  _updateWidth: function() {
    this.$$('.container').style.width = this.width + 'px';
  },
  _updateHeight: function() {
    this.$$('.container').style.height = this.height + 'px';
  },
  _updateGraph: function() {
    if (this.pbtxtFileLocation) {
      // Fetch a pbtxt file. The fetching will be part of the loading sequence.
      this.$.loader.datasets = [{
        // Just name the dataset based on the file location.
        "name": this.pbtxtFileLocation,
        "path": this.pbtxtFileLocation,
      }];
      this.$.loader.set('selectedDataset', 0);
    } else if (this.pbtxt) {
      // Render the provided pbtxt.
      var blob = new Blob([this.pbtxt]);
			
      this.$.loader._parseAndConstructHierarchicalGraph(null, blob);
    }
  }
});