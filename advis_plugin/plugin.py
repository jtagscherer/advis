from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow as tf
import numpy as np
import six
from werkzeug import wrappers

from advis_plugin import imgutil

from tensorboard.backend import http_util
from tensorboard.plugins import base_plugin

class AdvisPlugin(base_plugin.TBPlugin):
	"""A plugin plugin for visualizing random perturbations of input data and
	their effects on deep learning models."""

	# Unique plugin identifier
	plugin_name = 'advis'

	def __init__(self, context):
		"""Instantiates an AdvisPlugin.

		Args:
			context: A base_plugin.TBContext instance. A magic container that
				TensorBoard uses to make objects available to the plugin.
		"""
		# Retrieve and store necessary contextual references
		self._multiplexer = context.multiplexer

	def get_plugin_apps(self):
		"""Gets all routes offered by the plugin.

		This method is called by TensorBoard when retrieving all the
		routes offered by the plugin.

		Returns:
			A dictionary mapping URL path to route that handles it.
		"""
		# Note that the methods handling routes are decorated with
		# @wrappers.Request.application.
		return {
				'/tags': self.tags_route,
				'/test': self.test_route,
				'/layerImage': self.layer_image_route
		}

	def is_active(self):
		"""Determines whether this plugin is active.

		This plugin is only active if TensorBoard sampled any summaries
		relevant to the advis plugin.

		Returns:
			Whether this plugin is active.
		"""
		all_runs = self._multiplexer.PluginRunToTagToContent(
				AdvisPlugin.plugin_name)

		# The plugin is active if any of the runs has a tag relevant
		# to the plugin.
		return bool(self._multiplexer and any(six.itervalues(all_runs)))

	def _process_string_tensor_event(self, event):
		"""Convert a TensorEvent into a JSON-compatible response."""
		string_arr = tf.make_ndarray(event.tensor_proto)
		text = string_arr.astype(np.dtype(str)).tostring()
		return {
				'wall_time': event.wall_time,
				'step': event.step,
				'text': text
		}

	@wrappers.Request.application
	def tags_route(self, request):
		"""A route (HTTP handler) that returns a response with tags.

		Returns:
			A response that contains a JSON object. The keys of the object
			are all the runs. Each run is mapped to a (potentially empty)
			list of all tags that are relevant to this plugin.
		"""
		# This is a dictionary mapping from run to (tag to string content).
		# To be clear, the values of the dictionary are dictionaries.
		all_runs = self._multiplexer.PluginRunToTagToContent(
				AdvisPlugin.plugin_name)

		# tagToContent is itself a dictionary mapping tag name to string
		# content. We retrieve the keys of that dictionary to obtain a
		# list of tags associated with each run.
		response = {
				run: list(tagToContent.keys())
				for (run, tagToContent) in all_runs.items()
		}

		return http_util.Respond(request, response, 'application/json')

	@wrappers.Request.application
	def test_route(self, request):
		"""A route that returns some test data to verify that everything is working.

		Returns:
			A JSON list with some test data associated with the run and tag
			combination.
		"""
		run = request.args.get('run')
		tag = request.args.get('tag')

		# We fetch all the tensor events that contain test data.
		tensor_events = self._multiplexer.Tensors(run, tag)

		# We convert the tensor data to text.
		response = [self._process_string_tensor_event(ev) for
								ev in tensor_events]
		return http_util.Respond(request, response, 'application/json')
	
	@wrappers.Request.application
	def layer_image_route(self, request):
		"""A route that returns a tiled image of the activation and feature 
		visualizations of a deep learning layer.

		Returns:
			A JSON list with some test data associated with the run and tag
			combination.
		"""
		run = request.args.get('run')
		tag = request.args.get('tag')

		# Fetch all the tensor events that contain image layer data
		tensor_events = self._multiplexer.Tensors(run, tag)

		# Extract images from the tensor data
		response = tensor_events[0].tensor_proto.string_val[2:][0]
		
		# Return the image data with proper headers set
		return http_util.Respond(
			request,
			response,
			imgutil.get_content_type(response)
		)
