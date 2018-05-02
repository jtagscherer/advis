import tensorflow as tf

def generate_image_from_tensor(name, tensor, name_scope=None):
	"""Transform an input tensor as obtained from the graph into a tensor that 
	describes all appropriate image visualizations of each unit's activation in 
	the layer.

	Arguments:
		name: The name of the final image tensor node. Should be unique in the 
			graph.
		tensor: An input tensor of shape `[1, width, height, index]`.
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
		image_tensor = tf.concat([dimensions, encoded_images], axis=0, name=name)
	
	return image_tensor
