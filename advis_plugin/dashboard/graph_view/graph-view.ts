'use strict';

declare var chroma: any;

Polymer({
  is: 'graph-view',
  properties: {
    stats: Object,
		
		selectedModel: {
			type: Object,
			observer: '_updateGraph'
		},
		
		distortions: {
			type: Array,
			observer: '_updateNodeColors'
		},
		
		selectedNode: {
			type: String,
			observer: '_updateNodeSelection'
		},
		
		nodeColors: {
			type: Object,
			notify: true
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
		accumulationMethod: {
			type: String,
			value: 'maximum',
			observer: '_updateNodeColors'
		},
		percentageMode: {
			type: String,
			value: 'relative',
			observer: '_updateNodeColors'
		},
		colorScaleName: {
			type: String,
			value: 'spectral',
			observer: '_updateColorScale'
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
		_colorScale: Object,
		_valueRange: Object,
    _nodeValues: Object,
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
		this._updateNodeColors();
	},
	
	openSettingsDialog: function() {
		this.$$('graph-settings-dialog').open({
			displayMode: this.displayMode,
			displayNodeInformation: this.displayNodeInformation,
			displayMinimap: this.displayMinimap,
			accumulationMethod: this.accumulationMethod,
			colorScaleName: this.colorScaleName,
			animationTarget: this.$$('#settings-button').getBoundingClientRect()
		});
	},
	
	_handleDialogReturnedEvent: function(e) {
		if (e.detail.eventId === 'graph-settings-dialog') {
			let content = e.detail.content;
			
			this.set('displayMode', content.displayMode);
			this.set('displayNodeInformation', content.displayNodeInformation);
			this.set('displayMinimap', content.displayMinimap);
			this.set('accumulationMethod', content.accumulationMethod);
			this.set('colorScaleName', content.colorScaleName);
		}
	},
	
	_getContainerClass: function(graphAvailable) {
		if (graphAvailable) {
			return 'visible';
		} else {
			return 'invisible';
		}
	},
  
  _getSelectedNodeValue: function(selectedNode, nodeValues) {
    if (selectedNode == null || nodeValues == null) {
      return NaN;
    }
    
    if (selectedNode in nodeValues) {
      return nodeValues[selectedNode];
    } else {
      return NaN;
    }
  },
	
	_updateNodeSelection: function() {
		this.fire('nodeSelectedEvent', {
      selectedNode: this.selectedNode
    });
	},
	_updateColorScale: function(value) {
		// Initialize a new color scale depending on the chosen name
		switch (value) {
			case 'monochrome':
				this.set('_colorScale', chroma.scale());
				break;
			case 'ylgn':
				this.set('_colorScale', chroma.scale('YlGn'));
				break;
			case 'ylorrd':
				this.set('_colorScale', chroma.scale('YlOrRd'));
				break;
			case 'hot':
				this.set('_colorScale', chroma.scale(['black', 'red', 'yellow']));
				break;
			case 'spectral':
				this.set('_colorScale', chroma.scale('Spectral').domain([1, 0]));
				break;
		}
		
		this._updateNodeColors();
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
		this.set('nodeColors', null);
		this.$$('color-legend').state = 'empty';
		
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
  },
	_updateNodeColors: function() {
		if (this.requestManager == null || this.selectedModel == null) {
			this.$$('color-legend').state = 'empty';
			return;
		}
		
		// Do not visualize anything if no distortions have been selected
		if (this.distortions.length == 0) {
			this.set('nodeColors', null);
			this.$$('color-legend').state = 'empty';
			return;
		}
		
		this.$$('color-legend').state = 'loading';
		
		// Construct a URL for the node activation list
		const url = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/node/list'), {
			model: this.selectedModel.name,
			distortion: this.distortions.map(d => d.name).join(','),
			inputImageAmount: '10',
			accumulationMethod: this.accumulationMethod,
			percentageMode: this.percentageMode,
			outputMode: 'mapping'
		});
		
		// Fetch the node activations and calculate node colors
		this.requestManager.request(url).then(data => {
			var nodeColors = {};
			let nodes = data.data;
      
      this.set('_nodeValues', nodes);
			
			for (let node in nodes) {
				nodeColors[node] = this._colorScale(nodes[node].percentual).hex();
			}
			
			this.set('nodeColors', nodeColors);
			this.set('_valueRange', data.meta.range);
			
			this.$$('color-legend').state = 'loaded';
		});
	}
});
