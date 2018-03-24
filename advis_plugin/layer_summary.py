from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow as tf

import json

PLUGIN_NAME = 'advis'

def op(name, parent_node_name, data, description=None, collections=None):
	"""Create a TensorFlow summary op that collects activation and feature 
	visualization data of a deep learning layer and outputs them as tiled 
	image maps.

	Arguments:
		name: A name for this summary operation.
		parent_node_name: The name of the graph node that is being visualized by 
			this summary. This is used to connect the visualization and the model 
			node.
		data: A rank-4 `Tensor` containing all image data.
		description: A longform readable description of the summary data.
		collections: Which TensorFlow graph collections to add the summary
			op to. Defaults to `['summaries']`. Can usually be ignored.
	"""
	
	plugin_metadata = {
		'nodeName': name,
		'parentNodeName': parent_node_name
	}

	# The plugin name in the metadata allows us to keep track of the data
	summary_metadata = tf.SummaryMetadata(
		display_name=name,
		summary_description=description,
		plugin_data=tf.SummaryMetadata.PluginData(
			plugin_name=PLUGIN_NAME,
			content=json.dumps(plugin_metadata).encode('utf-8')
		)
	)
	
	images = _generate_image_from_tensor(data, name_scope=name)

	# Return a summary op that is properly configured.
	return tf.summary.tensor_summary(
		name='{}/LayerImage'.format(parent_node_name),
		tensor=images,
		summary_metadata=summary_metadata,
		collections=collections
	)

# TODO: Adapt direct protobuf implementation
def pb(tag, data, display_name=None, description=None):
	"""Directly create a summary protobuf.

	Arguments:
		tag: The string tag associated with the summary.
		data: The string data used to test the plugin.
		display_name: If set, will be used as the display name in
			TensorBoard. Defaults to `tag`.
		description: A longform readable description of the summary data.
			Markdown is supported.
	"""
	tensor = tf.make_tensor_proto(data, dtype=tf.string)

	# We have no metadata to store, but we do need to add a plugin_data entry
	# so that we know this summary is associated with the Advis plugin.
	summary_metadata = tf.SummaryMetadata(
			display_name=display_name,
			summary_description=description,
			plugin_data=tf.SummaryMetadata.PluginData(
					plugin_name=PLUGIN_NAME))

	summary = tf.Summary()
	summary.value.add(tag=tag,
										metadata=summary_metadata,
										tensor=tensor)
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
