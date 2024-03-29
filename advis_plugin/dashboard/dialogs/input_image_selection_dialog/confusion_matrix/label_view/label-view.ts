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
		categoryList: {
			type: Array,
			observer: 'reload'
		},
		hoveredPixel: {
			type: Object,
			observer: 'redraw'
		},
		offset: {
			type: Object,
			observer: '_offsetUpdated'
		},
		zoomLevel: {
			type: Number,
			observer: 'redraw'
		},
		_context: Object,
		_maximumHierarchyDepth: Number,
		_labelCache: Array,
		_labelClickMap: Array,
		_fontSize: {
			type: Number,
			value: 12,
			observer: 'reload'
		},
    _textPadding: {
      type: Number,
      value: 3,
      observer: 'redraw'
    },
		_strokeColor: {
			type: String,
			value: '#5B5C5C'
		},
		_textColor: {
			type: String,
			value: '#1B1C1D'
		},
		_highlightColor: {
			type: String,
			value: '#E0E0E0'
		},
		_backgroundColor: {
			type: String,
			value: '#FFFFFF'
		},
    _encompassingHierarchy: {
      type: String,
      value: null
    },
    _encompassingHierarchyHeight: {
      type: Number,
      value: 20
    }
	},
	
	reload: function() {
		if (this.width == null || this.height == null || this.orientation == null
      || this.categoryHierarchy == null || this.categoryList == null) {
			return;
		}
		
		this._maximumHierarchyDepth = advis.hierarchy.util
			.getMaximumDepth(this.categoryHierarchy);
		
		// Cache labels of all levels
		this._labelCache = [];
		for (var i = 0; i <= this._maximumHierarchyDepth; i++) {
			this._labelCache.push(advis.hierarchy.util.findLabelsForLevel(
				i, this.categoryHierarchy
			));
		}
		
		let canvas = this.$$('canvas');
    
    // Scale the canvas for sharp rendering on screens with a high pixel density
    let scale = window.devicePixelRatio;
		canvas.width = this.width * scale;
		canvas.height = this.height * scale;
		canvas.style.width = `${this.width}px`;
		canvas.style.height = `${this.height}px`;
		
		this._context = canvas.getContext('2d');
		this._context.scale(scale, scale);
		this._context.strokeStyle = this._strokeColor;
		this._context.font = `${this._fontSize}px Roboto Condensed`;
		this._context.textAlign = 'center';
		this._context.textBaseline = 'middle';
	},
	
	redraw: function() {
		if (this._context == null || this.categoryHierarchy == null
			|| this.offset == null) {
			return;
		}
		
		this._context.clearRect(0, 0, this.width, this.height);
		this.set('_labelClickMap', []);
		
		// Choose an appropriate zoom level
		var levelFloat = 0;
		
		if (this.zoomLevel == null) {
			let zoomPercentage = (this.offset.end - this.offset.start)
				/ this.categoryList.length;
			levelFloat = this._maximumHierarchyDepth * zoomPercentage * 20;
		} else {
			levelFloat = this.zoomLevel;
		}
		
		levelFloat = this._maximumHierarchyDepth
			- Math.max(0, Math.min(this._maximumHierarchyDepth, levelFloat));
		this._updateEncompassingLevels(levelFloat);
		
		// Draw three label rows at once
		for (var i = 0; i < 3; i++) {
			this._drawNestedLabels(levelFloat, i);
		}
		
		// Draw the encompassing hierarchy label at the very edge
		var currentHoverPosition;
		if (this.hoveredPixel != null) {
			if (this.orientation == 'vertical') {
				currentHoverPosition = this.hoveredPixel.y;
			} else if (this.orientation == 'horizontal') {
				currentHoverPosition = this.hoveredPixel.x;
			}
		}
		
		let hovered = currentHoverPosition != null && currentHoverPosition >= 0
			&& currentHoverPosition < this.categoryList.length;
		
		if (hovered && this._encompassingHierarchy != null) {
			this._context.fillStyle = this._highlightColor;
		} else {
			this._context.fillStyle = this._backgroundColor;
		}
		
		if (this.orientation == 'vertical') {
			this._context.fillRect(
				0, 0, this._encompassingHierarchyHeight, this.height
			);
			
			if (this._encompassingHierarchy != null) {
				this._context.strokeRect(
					0, 0, this._encompassingHierarchyHeight, this.height
				);
				this._drawTextInRectangle(
					this._encompassingHierarchy,
					0, 0,
					this._encompassingHierarchyHeight, this.height,
					true
				);
			}
		} else if (this.orientation == 'horizontal') {
			this._context.fillRect(
				0, 0, this.width, this._encompassingHierarchyHeight
			);
			
			if (this._encompassingHierarchy != null) {
				this._context.strokeRect(
					0, 0, this.width, this._encompassingHierarchyHeight
				);
				this._drawTextInRectangle(
					this._encompassingHierarchy,
					0, 0,
					this.width, this._encompassingHierarchyHeight,
					false
				);
			}
		}
	},
	
	getLabelsForLevel: function(level) {
		return this._labelCache[level];
	},
	
	_offsetUpdated: function() {
		this.zoomLevel = null;
		this.redraw();
	},
	
	_updateEncompassingLevels: function(levelFloat) {
		if (this.offset == null) {
			return;
		}
		
		// Retrieve all visible labels on the current level
		let level = Math.floor(levelFloat);
		let limitedLevel = Math.min(level, this._maximumHierarchyDepth);
		let labels = this.getLabelsForLevel(level);
		
		var visibleLabels = [];
		var currentOffset = 0;
		for (let label of labels) {
			if (currentOffset <= this.offset.end
				&& currentOffset + label.size >= this.offset.start) {
				visibleLabels.push(label.name);
			}
			
			currentOffset += label.size;
		}
		
		if (visibleLabels.length == 0 || limitedLevel == 0) {
			this.set('_encompassingHierarchy', null);
			return;
		}
		
		// Retrieve hierarchy paths for all visible labels
		var paths = [];
		for (let label of visibleLabels) {
			paths.push(
				advis.hierarchy.util.findNodePath(this.categoryHierarchy, label)
			);
		}
		
		// Find all common predecessors that all visible labels share
		var common_path = [];
		
		outer:
		for (var i = 0; i < paths[0].length; i++) {
			let level_name = paths[0][i];
			
			for (let path of paths) {
				if (i + 1 > path.length || path[i] != level_name) {
					break outer;
				}
			}
			
			common_path.push(level_name);
		}
		
		// Create a string from the path
		let hierarchy_path = common_path.map(n => {
			let name = n.split(', ')[0];
			return name.charAt(0).toUpperCase() + name.slice(1);
		});
		
		this.set('_encompassingHierarchy', hierarchy_path.join(' > '));
	},
	
	_drawNestedLabels: function(levelFloat, offset) {
		let level = Math.floor(levelFloat);
		let limitedLevel = Math.min(level + offset, this._maximumHierarchyDepth);
		
		if (this.orientation == 'vertical') {
			this._drawLabelRow(
				limitedLevel, (offset - (levelFloat - level)) * 0.5 
				* (this.width - this._encompassingHierarchyHeight),
				(this.width - this._encompassingHierarchyHeight) / 2
			);
		} else if (this.orientation == 'horizontal') {
			this._drawLabelRow(
				limitedLevel, (offset - (levelFloat - level)) * 0.5
				* (this.height - this._encompassingHierarchyHeight),
				(this.height - this._encompassingHierarchyHeight) / 2
			);
		}
	},
	
	_drawLabelRow: function(level, offset, size) {
		this._context.save();
		
		if (this.orientation == 'vertical') {
			this._context.translate(offset + this._encompassingHierarchyHeight, 0);
		} else if (this.orientation == 'horizontal') {
			this._context.translate(0, offset + this._encompassingHierarchyHeight);
		}
		
		// Retrieve labels for the current zoom level
		let labels = this.getLabelsForLevel(level);
		
		let offsetRange = this.offset.end - this.offset.start;
		
		var labelViewLength = 0;
		if (this.orientation == 'vertical') {
			labelViewLength = this.height;
		} else if (this.orientation == 'horizontal') {
			labelViewLength = this.width;
		}
    
    var categorySize = labelViewLength / offsetRange;
		
		// Draw a rectangle around the bounds of the label row
		if (this.orientation == 'vertical') {
			// Vertical line
			this._context.beginPath();
			this._context.moveTo(0, 0);
			this._context.lineTo(0, this.height);
			this._context.stroke();
			
			// Top side line
			this._context.beginPath();
			this._context.moveTo(0, 0);
			this._context.lineTo(size, 0);
			this._context.stroke();
			
			// Bottom side line
			this._context.beginPath();
			this._context.moveTo(0, this.height);
			this._context.lineTo(size, this.height);
			this._context.stroke();
		} else if (this.orientation == 'horizontal') {
			// Horizontal line
			this._context.beginPath();
			this._context.moveTo(0, 0);
			this._context.lineTo(this.width, 0);
			this._context.stroke();
			
			// Left side line
			this._context.beginPath();
			this._context.moveTo(0, 0);
			this._context.lineTo(0, size);
			this._context.stroke();
			
			// Right side line
			this._context.beginPath();
			this._context.moveTo(this.width, 0);
			this._context.lineTo(this.width, size);
			this._context.stroke();
		}
		
		// Draw labels for the current offset
		var currentOffset = 0;
		for (var label of labels) {
			let labelStart = (currentOffset - this.offset.start) * categorySize;
			let labelEnd = labelStart + (label.size * categorySize);
			
			// Skip labels that are currently not on screen
			if (currentOffset > this.offset.end
				|| (currentOffset + label.size) < this.offset.start) {
				currentOffset += label.size;
				continue;
			}
			
			// If the category we are currently drawing is represented by this label 
			// or its parents, we highlight the label
			var currentHoverPosition;
			if (this.hoveredPixel != null) {
				if (this.orientation == 'vertical') {
					currentHoverPosition = this.hoveredPixel.y;
				} else if (this.orientation == 'horizontal') {
					currentHoverPosition = this.hoveredPixel.x;
				}
			}
			
			var highlighted = false;
			if (currentHoverPosition != null && currentHoverPosition >= 0
				&& currentHoverPosition < this.categoryList.length) {
				let hoveredCategory = this.categoryList[currentHoverPosition].name;
				
				if (advis.hierarchy.util.categoryContains(label.name, hoveredCategory,
					this.categoryHierarchy)) {
					highlighted = true;
				}
			}
			
			if (this.orientation == 'vertical') {
				// Highlight the label if desired
				if (highlighted) {
					this._context.fillStyle = this._highlightColor;
					this._context.fillRect(
						0, labelStart, size, label.size * categorySize
					);
				}
				
				// Save position of this label
				this.push('_labelClickMap', {
					name: label.name,
					bounds: {
						horizontalStart: offset,
						horizontalEnd: offset + size,
						verticalStart: labelStart,
						verticalEnd: labelStart + (label.size * categorySize)
					}
				});
				
				// Draw a line for the rectangle encompassing the category
				this._context.beginPath();
				this._context.moveTo(0, labelStart);
				this._context.lineTo(size, labelStart);
				this._context.stroke();
				
				// Write the label's name inside the rectangle
				this._drawTextInRectangle(
					this._getCondensedLabel(label.name),
          0 + this._textPadding,
					Math.max(labelStart, 0) + this._textPadding,
          size - (this._textPadding * 2),
					(Math.min(labelEnd, labelViewLength) - Math.max(labelStart, 0))
            - (this._textPadding * 2),
					false
				);
			} else if (this.orientation == 'horizontal') {
				// Highlight the label if desired
				if (highlighted) {
					this._context.fillStyle = this._highlightColor;
					this._context.fillRect(
						labelStart, 0, label.size * categorySize, size
					);
				}
				
				// Save position of this label
				this.push('_labelClickMap', {
					name: label.name,
					bounds: {
						horizontalStart: labelStart,
						horizontalEnd: labelStart + (label.size * categorySize),
						verticalStart: offset,
						verticalEnd: offset + size
					}
				});
				
				// Draw a line for the rectangle encompassing the category
				this._context.beginPath();
				this._context.moveTo(labelStart, 0);
				this._context.lineTo(labelStart, size);
				this._context.stroke();
				
				// Write the label's name inside the rectangle
				this._drawTextInRectangle(
					this._getCondensedLabel(label.name),
					Math.max(labelStart, 0) + this._textPadding,
          0 + this._textPadding,
          (Math.min(labelEnd, labelViewLength) - Math.max(labelStart, 0))
            - (this._textPadding * 2),
          size - (this._textPadding * 2),
					true
				);
			}
			
			currentOffset += label.size;
		}
		
		this._context.restore();
	},
	
	_drawTextInRectangle: function(text, x, y, width, height, rotated) {
		this._context.fillStyle = this._textColor;
		
    var lineWidth = 0;
    if (rotated) {
      lineWidth = height;
    } else {
      lineWidth = width;
    }
		
		// Write all lines to the screen as far as space permits
    var blockWidth = 0;
    if (rotated) {
      blockWidth = width;
    } else {
      blockWidth = height;
    }
    
    // If there is no space for at least one line, we lower the font size
		var textHeight = 0;
    if (blockWidth < this._fontSize) {
			textHeight = Math.max(0, blockWidth);
    } else {
			textHeight = this._fontSize;
		}
		
		this._context.font = `${textHeight}px Roboto Condensed`;
		
		// Wrap the text into lines until we run out of text
		var lines = [];
    var remainingText = text;
    
    while (remainingText.length > 0) {
      // First of all, try wrapping the text at spaces
      let words = remainingText.split(' ');
      
      if (this._context.measureText(words[0]).width > lineWidth) {
        // The first word is already too long, we have to break at a character
        var line = '';
        
        for (let character of remainingText.split('')) {
          if (this._context.measureText(line + character).width <= lineWidth) {
            line += character;
          } else {
            break;
          }
        }
      } else {
        // Collect the maximum amount of words until the line is full
        var line = '';
        
        for (let word of words) {
          var appendedLine = line;
          if (appendedLine == '') {
            appendedLine += word;
          } else {
            appendedLine += ` ${word}`;
          }
          
          if (this._context.measureText(appendedLine).width <= lineWidth) {
            line = appendedLine;
          } else {
            break;
          }
        }
      }
      
      lines.push(line);
      remainingText = remainingText.substring(line.length).trim();
    }
    
    let lineCount = Math.floor(blockWidth / textHeight);
    let slicedLines = lines.slice(0, lineCount);
    
    this._context.save();
		
		var textOffset = 0;
		if (rotated) {
			textOffset = (width / 2) - (((slicedLines.length - 1) 
				* textHeight) / 2);
			this._context.translate(x, y + (height / 2));
			this._context.rotate(-Math.PI / 2);
		} else {
			textOffset = (height / 2) - (((slicedLines.length - 1)
        * textHeight) / 2);
      this._context.translate(x + (width / 2), y);
		}
		
		for (var lineIndex = 0; lineIndex < slicedLines.length; lineIndex++) {
			var lineText = slicedLines[lineIndex];
			
			// If we are drawing the last line that fits and it is not the last 
			// line that exists, add an ellipsis
			if (lineIndex == slicedLines.length - 1
				&& slicedLines.length < lines.length) {
				if (this._context.measureText(lineText + '…').width > lineWidth) {
					lineText = lineText.substring(0, lineText.length - 2) + '…';
				} else {
					lineText += '…';
				}
			}
			
			this._context.fillText(
				lineText, 0, (lineIndex * textHeight) + textOffset
			);
		}
    
    this._context.restore();
	},
	
	_getCondensedLabel: function(label) {
		let text = label.split(', ')[0];
		return text.charAt(0).toUpperCase() + text.substr(1);
	},
	
	_canvasHovered: function(e) {
		let x = e.offsetX;
		let y = e.offsetY;
		
		// Retrieve the label that has been hovered over from the click map
		for (let label of this._labelClickMap) {
			if (x > label.bounds.horizontalStart && x < label.bounds.horizontalEnd
				&& y > label.bounds.verticalStart && y < label.bounds.verticalEnd) {
				this.fire('label-hovered-event', {
		      name: label.name,
					path: advis.hierarchy.util.findNodePath(
						this.categoryHierarchy, label.name
					)
		    });
				
				break;
			}
		}
	},
	
	_canvasLeft: function(e) {
		this.fire('label-hovered-event', {
			name: null,
			path: null
		});
	}
});
