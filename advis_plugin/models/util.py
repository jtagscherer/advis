import tensorflow as tf

from copy import deepcopy

def annotate_tensor(name, tensor, name_scope=None):
	"""Transform an input tensor as obtained from the graph into a tensor that 
	describes all appropriate image visualizations of each unit's activation in 
	the layer. On top of that, another operation will be returned that contains 
	the layer's activations and can be used for comparisons.

	Arguments:
		name: The name of the final image tensor node. Should be unique in the 
			graph.
		tensor: An input tensor of shape `[1, width, height, index]`.
		name_scope: Optional name scope for all tensor operations
	"""
	
	with tf.name_scope(name_scope):
		# Unstack the data to get rid of the first dimension
		tensor = tf.unstack(tensor)[0]
		
		# Transpose axes so that images indices are first to create the activation 
		# tensor
		activation_tensor = tf.transpose(tensor, [2, 0, 1])
		
		# Fill in RGB channels for each image tensor
		tensor = tf.map_fn(lambda x: tf.stack([x, x, x]), tensor)
		
		# Transpose axes so that image indices are first and RGB channels last
		tensor = tf.transpose(tensor, [3, 0, 2, 1])
		
		# Stack tensors and clip and multiply values of the RGB channels
		tensors = tf.stack(
			tf.map_fn(
				lambda x: tf.cast(255 * tf.clip_by_value(x, 0.0, 1.0), tf.uint8),
				tensor,
				dtype=tf.uint8
			)
		)
		
		# Encode all images
		encoded_images = tf.map_fn(tf.image.encode_png, tensors, dtype=tf.string)
		
		# Calculate dimensions
		image_shape = tf.shape(tensors)
		dimensions = tf.stack(
			[tf.as_string(image_shape[1], name='width'),
			tf.as_string(image_shape[2], name='height')],
			name='dimensions'
		)
		
		# Concatenate dimensions and encoded images for the final image tensor
		image_tensor = tf.concat([dimensions, encoded_images], axis=0, name=name)
	
	return image_tensor, activation_tensor

def simplify_graph(graph, is_important):
	"""Simplify a graph definition by removing nodes that are not deemed
	important. Edges to and from removed nodes will be re-routed accordingly.

	Arguments:
		graph: The original graph definition as a protocoll buffer object.
		is_important: A function that will be used to evaluate whether a node is 
			important and should be kept in the graph or not. Given a single node, 
			this function should return `True` if the node is important and `False` 
			otherwise.
	"""
	
	# Generate a list with the names of all nodes that need to be removed
	unneeded_nodes = []
	
	for node in graph.node:
		if not is_important(node):
			unneeded_nodes.append(node.name)
	
	# Copy the graph definition so we can delete some of its nodes without 
	# affecting the original graph
	simplified_graph = deepcopy(graph)
	
	# Simplify the graph by removing all unneeded nodes one by one and adjusting 
	# edges when needed
	for node in unneeded_nodes:
		node_def, index = _find_node_by_name(simplified_graph, node)
		
		node_inputs = node_def.input
		node_outputs = _find_nodes_by_input(simplified_graph, node)
		
		for output_node_index in node_outputs:
			simplified_graph.node[output_node_index].input.extend(node_inputs)
		
		del simplified_graph.node[index]
	
	# Remove unneeded nodes in inputs of nodes that have been kept
	for node in simplified_graph.node:
		pruned_node_inputs = set()
		
		for input in node.input:
			if input not in unneeded_nodes:
				pruned_node_inputs.add(input)
		
		node.input[:] = list(pruned_node_inputs)
	
	return simplified_graph

def _find_nodes_by_input(graph, input):
	nodes = set()
	index = 0
	
	for node in graph.node:
		if input in node.input:
			nodes.add(index)
		
		index += 1
	
	return nodes

def _find_node_by_name(graph, node_name):
	index = 0
	
	for node in graph.node:
		if node.name == node_name:
			return node, index
		
		index += 1
