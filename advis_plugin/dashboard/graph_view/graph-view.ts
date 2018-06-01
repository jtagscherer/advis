'use strict';

Polymer({
  is: 'graph-view',
  properties: {
    stats: Object,
		
		selectedModel: {
			type: Object,
			observer: '_updateGraph'
		},
		
		selectedNode: {
			type: String,
			observer: '_updateNodeSelection'
		},
		
		displayMode: {
			type: String,
			value: 'simplified',
			observer: '_updateGraph'
		},
		displayNodeInformation: {
			type: Boolean,
			value: false
		},
		displayMinimap: {
			type: Boolean,
			value: false
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
		
		requestManager: Object,
    _renderHierarchy: Object,
    _progress: Object,
		_graphAvailable: {
			type: Boolean,
			value: false
		}
  },
	
	listeners: {
    'dialogReturnedEvent': '_handleDialogReturnedEvent'
  },
	
	update: function() {
		this._updateGraph();
	},
	
	openSettingsDialog: function() {
		this.$$('graph-settings-dialog').open({
			displayMode: this.displayMode,
			displayNodeInformation: this.displayNodeInformation,
			displayMinimap: this.displayMinimap,
			animationTarget: this.$$('#settings-button').getBoundingClientRect()
		});
	},
	
	_handleDialogReturnedEvent: function(e) {
		if (e.detail.eventId === 'graph-settings-dialog') {
			let content = e.detail.content;
			
			this.set('displayMode', content.displayMode);
			this.set('displayNodeInformation', content.displayNodeInformation);
			this.set('displayMinimap', content.displayMinimap);
		}
	},
	
	_getContainerClass: function(graphAvailable) {
		if (graphAvailable) {
			return 'visible';
		} else {
			return 'invisible';
		}
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
		// Use a more compact horizontal layouting when displaying a simplified 
		// graph and the traditional vertical layouting otherwise
		if (this.displayMode == 'simplified') {
			advis.graph.layout.direction = 'horizontal';
		} else {
			advis.graph.layout.direction = 'vertical';
		}
		
		if (this.requestManager == null || this.selectedModel == null) {
			this.set('_graphAvailable', false);
			return;
		}
		
		// Construct a URL for the graph structure
		const url = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/graphs'), {
			model: this.selectedModel.name,
			mode: this.displayMode
		});
		
		// Fetch the graph structure and update the displayed graph
		this.requestManager.request(url).then(data => {
			var blob = new Blob([data.graph]);
			this.set('_graphAvailable', true);
      this.$.loader._parseAndConstructHierarchicalGraph(null, blob);
		});
  }
});
