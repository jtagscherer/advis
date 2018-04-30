import tensorflow as tf

# Tensorflow structures that will be kept throughout the whole lifecycle
graph = tf.Graph()
session = tf.Session(graph=graph)
saver = None

# All nodes with this operation type will be annotated for visualization
image_visualization_nodes = ['Conv2D', 'Relu', 'MaxPool', 'AvgPool', \
	'ConcatV2']

# A dictionary mapping node names to their image tensor annotations
image_tensors = {}

def initialize(meta_file, data_file):
	with graph.as_default():
		# Load the graph's structure
		saver = tf.train.import_meta_graph(meta_file)
		
		# Initialize all variable values, e.g. weights
		saver.restore(session, data_file)
		
		# Store the graph structure before adding visualization nodes
		graph_structure = str(graph.as_graph_def())
		
		# Annotate all viable nodes with image tensor operations
		for n in graph.as_graph_def().node:
			if n.op in image_visualization_nodes:
				image_node = _generate_image_from_tensor(graph.get_tensor_by_name(
					'{}:0'.format(n.name)))
				image_tensors[n.name] = image_node
	
	return graph_structure

def get_display_name():
	return 'Inception V3'

def get_version():
	return 1.0

def run(input, meta_data):
	with graph.as_default():
		if meta_data['run_type'] == 'single_activation_visualization':
			layer_name = meta_data['layer']
			
			if layer_name in image_tensors:
				result = session.run(image_tensors[layer_name],
					feed_dict={'input:0': input})
			else:
				result = None
	
	return result

def _generate_image_from_tensor(tensor, name_scope=None):
	"""Transform an input tensor as obtained from the graph into a tensor that 
	describes all appropriate image visualizations of each unit's activation in 
	the layer.

	Arguments:
		tensor: An input tensor of shape [1, width, height, index]`.
		name_scope: Optional name scope for all tensor operations
	"""
	
	with tf.name_scope(name_scope):
		# Unstack the data to get rid of the first dimension
		tensor = tf.unstack(tensor)[0]
		
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
		image_tensor = tf.concat([dimensions, encoded_images], axis=0)
	
	return image_tensor
