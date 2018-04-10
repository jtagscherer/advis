'use strict';

Polymer({
  is: 'graph-view',
  properties: {
    stats: Object,
		
		selectedNode: {
			type: String,
			observer: '_updateNodeSelection'
		},
		
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
	
	_updateNodeSelection: function() {
		this.fire('nodeSelectedEvent', {
      selectedNode: this.selectedNode
    });
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
      this.$.loader.datasets = [{
        'name': this.pbtxtFileLocation,
        'path': this.pbtxtFileLocation
      }];
      this.$.loader.set('selectedDataset', 0);
    } else if (this.pbtxt) {
      var blob = new Blob([this.pbtxt]);
      this.$.loader._parseAndConstructHierarchicalGraph(null, blob);
    }
  }
});
