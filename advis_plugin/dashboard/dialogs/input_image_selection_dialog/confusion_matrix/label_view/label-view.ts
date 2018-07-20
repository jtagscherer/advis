'use strict';

Polymer({
  is: 'label-view',
	properties: {
		width: {
			type: Number,
			observer: 'reload'
		},
		height: {
			type: Number,
			observer: 'reload'
		},
		orientation: {
			type: String,
			observer: 'reload'
		},
		categoryHierarchy: {
      type: Object,
      observer: 'reload'
    },
		categoryCount: {
			type: Number,
			observer: 'reload'
		},
		offset: {
			type: Object,
			observer: 'redraw'
		},
		_context: Object,
		_maximumHierarchyDepth: Number,
		_labelCache: Array
	},
	
	reload: function() {
		if (this.width == null || this.height == null || this.orientation == null
      || this.categoryHierarchy == null || this.categoryCount == null) {
			return;
		}
		
		this._maximumHierarchyDepth = this._getMaximumDepth(this.categoryHierarchy);
		
		// Cache labels of all levels
		this._labelCache = [];
		for (var i = 0; i <= this._maximumHierarchyDepth; i++) {
			this._labelCache.push(this._findLabelsForLevel(i));
		}
		
		let canvas = this.$$('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		
		this._context = canvas.getContext('2d');
		this._context.font = '12px Roboto Condensed';
		this._context.textAlign = 'center';
		this._context.textBaseline = 'middle';
	},
	
	redraw: function() {
		if (this._context == null || this.categoryHierarchy == null
			|| this.offset == null) {
			return;
		}
		
		this._context.clearRect(0, 0, this.width, this.height);
		
		let offsetRange = this.offset.end - this.offset.start;
		
		var categorySize = 0;
		if (this.orientation == 'vertical') {
			categorySize = this.height / offsetRange;
		} else if (this.orientation == 'horizontal') {
			categorySize = this.width / offsetRange;
		}
		
		// Choose an appropriate zoom level
		let zoomPercentage = offsetRange / this.categoryCount;
		var level = this._maximumHierarchyDepth * zoomPercentage * 20;
		level = this._maximumHierarchyDepth
			- Math.max(0, Math.min(this._maximumHierarchyDepth, level));
		
		// Retrieve labels for the current zoom level
		let labels = this.getLabelsForLevel(Math.round(level));
		
		// Draw labels for the current offset
		var currentOffset = 0;
		for (var label of labels) {
			let labelStart = (currentOffset - this.offset.start) * categorySize;
			let labelEnd = labelStart + (label.size * categorySize);
			
			if (this.orientation == 'vertical') {
				// TODO
			} else if (this.orientation == 'horizontal') {
				// Draw a rectangle encompassing the category
				this._context.strokeRect(
					labelStart, 0,
					label.size * categorySize, this.height
				);
				
				// Write the label's name inside the rectangle
				// TODO: Measure text, try wrapping it, and add ellipsis if that fails
				this._context.save();
				this._context.translate(
					labelEnd - ((label.size * categorySize) / 2),
					this.height / 2
				);
				this._context.rotate(-Math.PI / 2);
				this._context.fillText(this._getCondensedLabel(label.name), 0, 0);
				this._context.restore();
			}
			
			currentOffset += label.size;
		}
	},
	
	getLabelsForLevel: function(level) {
		return this._labelCache[level];
	},
	
	_getCondensedLabel: function(label) {
		let text = label.split(', ')[0];
		return text.charAt(0).toUpperCase() + text.substr(1);
	},
	
	_findLabelsForLevel: function(level) {
		if (this.categoryHierarchy == null || level == null) {
			return;
		}
		
		// Iterate through the whole category tree using a stack
		var stack = [{
			node: this.categoryHierarchy[0],
			level: 0
		}];
		var labels = [];
		
		while (stack.length > 0) {
			var element = stack.pop();
			
			if ('category' in element.node && element.level <= level) {
				// If the current node has a category, it is a leave node. We append it 
				// if its level does not exceed the specified level.
				labels.push({
					name: element.node.name,
					size: 1
				});
			} else if ('children' in element.node && element.node.children != null) {
				// If the current node has children, it is an intermediate node.
				if (element.level == level) {
					// If the node's level matches the specified level, append it
					labels.push({
						name: element.node.name,
						size: this._getLeafCount(element.node)
					});
				} else if (element.level < level) {
					// If the node's level is lower than the specified level, continue 
					// searching through its children
					for (var child of element.node.children) {
						stack.push({
							node: child,
							level: element.level + 1
						});
					}
				}
			}
		}
		
		return labels.reverse();
	},
	
	_getLeafCount: function(root) {
		var stack = [root];
		var leafCount = 0;
		
		while (stack.length > 0) {
			var node = stack.pop();
			
			if ('category' in node) {
				leafCount += 1;
			} else if ('children' in node && node.children != null) {
				for (var child of node.children) {
					stack.push(child);
				}
			}
		}
		
		return leafCount;
	},
	
	_getMaximumDepth: function(hierarchy) {
		var stack = [{
			node: hierarchy[0],
			level: 0
		}];
		var depth = 0;
		
		while (stack.length > 0) {
			var element = stack.pop();
			
			if (element.level > depth) {
				depth = element.level;
			}
			
			if ('children' in element.node && element.node.children != null) {
				for (var child of element.node.children) {
					stack.push({
						node: child,
						level: element.level + 1
					});
				}
			}
		}
		
		return depth;
	}
});
