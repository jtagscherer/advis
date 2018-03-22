from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow as tf

# DEBUG: Urllib is only needed for testing purposes
try:
	import urllib2 as urllib
except ImportError:
	import urllib.request as urllib

PLUGIN_NAME = 'advis'

def op(name, data, display_name=None, description=None, collections=None):
	"""Create a TensorFlow summary op that collects activation and feature 
	visualization data of a deep learning layer and outputs them as tiled 
	image maps.

	Arguments:
		name: A name for this summary operation.
		data: A rank-4 `Tensor` containing all image data.
		display_name: If set, will be used as the display name
			in TensorBoard. Defaults to `name`.
		description: A longform readable description of the summary data.
		collections: Which TensorFlow graph collections to add the summary
			op to. Defaults to `['summaries']`. Can usually be ignored.
	"""
	
	if display_name is None:
		display_name = name

	# The plugin name in the metadata allows us to keep track of the data
	summary_metadata = tf.SummaryMetadata(
		display_name=display_name,
		summary_description=description,
		plugin_data=tf.SummaryMetadata.PluginData(plugin_name=PLUGIN_NAME)
	)
	
	# DEBUG: Replace actual data with a cute golden retriever for testing purposes
	url = 'https://upload.wikimedia.org/wikipedia/commons/9/93/Golden_Retriever_Carlos_%2810581910556%29.jpg'
	test_image = tf.image.decode_jpeg(urllib.urlopen(url).read(), channels=3)
	
	images = [tf.cast(test_image, tf.float32) / 255.0]
	
	with tf.name_scope('convert_to_uint8'):
		images = tf.stack(
			[tf.cast(255 * tf.clip_by_value(image_, 0.0, 1.0), tf.uint8)
			for image_ in images]
		)
	
	with tf.name_scope(name):
		encoded_images = tf.map_fn(
			tf.image.encode_png,
			images,
			dtype=tf.string,
			name='encode_each_image'
		)

		image_shape = tf.shape(images)
		dimensions = tf.stack(
			[tf.as_string(image_shape[1], name='width'),
			tf.as_string(image_shape[2], name='height')],
			name='dimensions'
		)

		tensor = tf.concat([dimensions, encoded_images], axis=0)

	# Return a summary op that is properly configured.
	return tf.summary.tensor_summary(
		name=name,
		tensor=tensor,
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
