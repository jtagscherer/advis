module advis.hierarchy.util {
	export const findLabelsForLevel = function(level, hierarchy) {
		// Iterate through the whole category tree using a stack
		var stack = [{
			node: hierarchy[0],
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
						size: advis.hierarchy.util.getLeafCount(element.node)
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
	};
	
	export const getLeafCount = function(root) {
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
	};
	
	export const getNodeByName = function(root, name) {
		var stack = [root];
		var result;
		
		while (stack.length > 0) {
			var node = stack.pop();
			
			if (node.name == name) {
				result = node;
				break;
			} else if ('children' in node && node.children != null) {
				for (var child of node.children) {
					stack.push(child);
				}
			}
		}
		
		return result;
	};
	
	export const categoryContains = function(categoryName, subCategoryName,
		hierarchy) {
		var stack = [
			advis.hierarchy.util.getNodeByName(hierarchy[0], categoryName)
		];
		var result = false;
		
		while (stack.length > 0) {
			var node = stack.pop();
			
			if (node == null) {
				continue;
			}
			
			if (node.name == subCategoryName) {
				result = true;
				break;
			} else if ('children' in node && node.children != null) {
				for (var child of node.children) {
					stack.push(child);
				}
			}
		}
		
		return result;
	};
	
	export const getMaximumDepth = function(hierarchy) {
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
	};
};
