"""
This module provides summaries for the Advis plugin.
"""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow as tf

PLUGIN_NAME = 'advis'

def op(name,
			 data,
			 display_name=None,
			 description=None,
			 collections=None):
	"""Create a TensorFlow summary op to generate some test data.

	Arguments:
		name: A name for this summary operation.
		data: A rank-0 string `Tensor`.
		display_name: If set, will be used as the display name
			in TensorBoard. Defaults to `name`.
		description: A longform readable description of the summary data.
			Markdown is supported.
		collections: Which TensorFlow graph collections to add the summary
			op to. Defaults to `['summaries']`. Can usually be ignored.
	"""

	# The `name` argument is used to generate the summary op node name.
	# That node name will also involve the TensorFlow name scope.
	# By having the display_name default to the name argument, we make
	# the TensorBoard display clearer.
	if display_name is None:
		display_name = name

	# We could put additional metadata other than the PLUGIN_NAME,
	# but we don't need any metadata for this simple example.
	summary_metadata = tf.SummaryMetadata(
			display_name=display_name,
			summary_description=description,
			plugin_data=tf.SummaryMetadata.PluginData(
					plugin_name=PLUGIN_NAME))

	# Return a summary op that is properly configured.
	return tf.summary.tensor_summary(
			name,
			data,
			summary_metadata=summary_metadata,
			collections=collections)

def pb(tag, data, display_name=None, description=None):
	"""Create a summary for the test data.

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
