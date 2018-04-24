import tensorflow as tf
from tensorflow.python.ops import control_flow_ops
from tensorflow.contrib.slim.python.slim.nets import inception
slim = tf.contrib.slim

from advis_plugin import layer_summary

def get_display_name():
	return 'Inception V3'

def get_version():
	return 1.0

def get_checkpoint_file():
	return 'model_inception_v3/inception_v3.ckpt'

def run(input, writer, checkpoint_path, meta_data):
	color_channels = 3
	num_classes = 1001
	
	# Make a batch of only one image by inserting a new dimension
	input_images = tf.expand_dims(input, 0)

	# Create the model, use the default arg scope to configure the batch norm
	# parameters.
	with slim.arg_scope(inception.inception_v3_arg_scope()):
		logits, _ = inception.inception_v3(input_images,
			num_classes=num_classes, is_training=False)
		probabilities = tf.nn.softmax(logits)

		init_fn = slim.assign_from_checkpoint_fn(
			checkpoint_path,
			slim.get_model_variables('InceptionV3')
		)

		with tf.Session() as sess:
			init_fn(sess)
			graph = tf.get_default_graph()
			nodes = graph.as_graph_def().node
			
			logged_node = None
			
			if meta_data['run_type'] == 'single_activation_visualization':
				# Only annotate the node whose visualization has been requested
				for n in nodes:
					if n.name == meta_data['layer'] and \
						n.op in ['Conv2D', 'Relu', 'MaxPool', 'AvgPool', 'ConcatV2', \
						'Identity']:
						
						summary_op = _generate_image_from_tensor(tf.get_default_graph().get_tensor_by_name('{}:0'.format(n.name)))
						break
			
			# Run the session and log all output data
			summary = sess.run(summary_op)
			# writer.add_summary(summary)
	
	return summary

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

def preprocess_input(image):
	central_fraction = 0.875
	scope = None
	
	image_size = inception.inception_v3.default_image_size

	with tf.name_scope(scope, 'eval_image', [image, image_size, image_size]):
		if image.dtype != tf.float32:
			image = tf.image.convert_image_dtype(image, dtype=tf.float32)
			# Crop the central region of the image with an area containing 87.5% of
			# the original image.
			if central_fraction:
				image = tf.image.central_crop(image, central_fraction=central_fraction)

		# Resize the image to the specified height and width.
		image = tf.expand_dims(image, 0)
		image = tf.image.resize_bilinear(image, [image_size, image_size],
			align_corners=False)
		image = tf.squeeze(image, [0])

		image = tf.subtract(image, 0.5)
		image = tf.multiply(image, 2.0)

		return image
