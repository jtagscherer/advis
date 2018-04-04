from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow as tf
import numpy as np
import six
from werkzeug import wrappers

from advis_plugin import imgutil, argutil

from tensorboard.backend import http_util
from tensorboard.plugins import base_plugin

class AdvisPlugin(base_plugin.TBPlugin):
	"""A plugin plugin for visualizing random perturbations of input data and
	their effects on deep learning models."""

	# Unique plugin identifier
	plugin_name = 'advis'

	def __init__(self, context):
		"""Instantiates an AdvisPlugin.

		Arguments:
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
			'/layer/meta': self.layer_meta_route,
			'/layer/image': self.layer_image_route
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
	
	def _get_tensor_string_value(self, run, tag):
		"""Given a request containing valid run and tag identifiers, fetch the 
		corresponding tensors and return their string value.
		
		Arguments:
			run: The run which contains the tensor.
			tag: The tag of the tensor which must be contained in the run.
		Returns:
			The corresponding tensor's string value.
		"""
		
		# Fetch all the tensor events that contain image layer data
		tensor_events = self._multiplexer.Tensors(run, tag)

		return tensor_events[0].tensor_proto.string_val[2:]

	@wrappers.Request.application
	def tags_route(self, request):
		"""A route (HTTP handler) that returns a response with tags.

		Arguments:
			request: The request for the runs and tags which may contain no actual 
				parameters since none are needed.
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
	def layer_meta_route(self, request):
		"""A route that returns meta information about a network layer of which 
		visualizations exist. These are identified by their tag which equals the 
		name of the corresponding graph node.

		Arguments:
			request: A request containing the meta information's run and tag.
		Returns:
			A JSON document containing meta information about the layer.
		"""
		# Check for missing arguments and possibly return an error
		missing_arguments = argutil.check_missing_arguments(
			request, ['run', 'tag']
		)
		
		if missing_arguments != None:
			return missing_arguments
		
		# Now that we are sure all necessary arguments are available, extract them 
		# from the request
		run = request.args.get('run')
		tag = request.args.get('tag')

		# Construct meta information using the tensor data
		response = {
			'unitCount': len(self._get_tensor_string_value(run, tag))
		}
		
		return http_util.Respond(request, response, 'application/json')
	
	@wrappers.Request.application
	def layer_image_route(self, request):
		"""A route that returns a tiled image of the activation and feature 
		visualizations of a deep learning layer.

		Arguments:
			request: A request containing the layer image's run and tag as well as 
			its unit index.
		Returns:
			A URL for the image data containing the requested visualization.
		"""
		# Check for missing arguments and possibly return an error
		missing_arguments = argutil.check_missing_arguments(
			request, ['run', 'tag', 'unitIndex']
		)
		
		if missing_arguments != None:
			return missing_arguments
		
		# Now that we are sure all necessary arguments are available, extract them 
		# from the request
		run = request.args.get('run')
		tag = request.args.get('tag')
		unit_index = int(request.args.get('unitIndex'))
		
		tensor_string_value = self._get_tensor_string_value(run, tag)
		
		# Check the index value for validity
		if unit_index >= 0 and unit_index < len(tensor_string_value):
			# Fetch the image summary tensor corresponding to the request's values
			response = tensor_string_value[unit_index]
		else:
			# Something has gone wrong, return a placeholder
			response = imgutil.get_placeholder_image()
		
		# Return the image data with proper headers set
		return http_util.Respond(
			request,
			response,
			'image/png'
			# imgutil.get_content_type(response)
		)
