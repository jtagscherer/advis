from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from os import path, makedirs
from shutil import rmtree

import tensorflow as tf
import numpy as np
import six
from werkzeug import wrappers

from advis_plugin import imgutil, argutil
from advis_plugin.models import models

from data import demo_data

from tensorboard.backend import http_util
from tensorboard.plugins import base_plugin

class AdvisPlugin(base_plugin.TBPlugin):
	"""A plugin plugin for visualizing random perturbations of input data and
	their effects on deep learning models."""

	# Unique plugin identifier
	plugin_name = 'advis'
	
	# Path where all data will be stored, should be the same as the logdir
	storage_path = None
	
	# Manager objects to keep track of resources
	model_manager = None

	def __init__(self, context):
		"""Instantiates an AdvisPlugin.

		Arguments:
			context: A base_plugin.TBContext instance. A magic container that
				TensorBoard uses to make objects available to the plugin.
		"""
		# Retrieve and store necessary contextual references
		self._multiplexer = context.multiplexer
		self.storage_path = context.logdir
		self.model_manager = models.ModelManager(self.storage_path)
		
		# Setup the log directory
		for model in self.model_manager.get_model_modules().keys():
			model_path = path.join(self.storage_path, model)
			
			if not path.exists(model_path):
				makedirs(model_path)

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
			'/models': self.models_route,
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
	
	def _clear_model_logs(self, model_name):
		rmtree(path.join(self.storage_path, model_name))

	@wrappers.Request.application
	def models_route(self, request):
		"""A route that returns a response with all models.

		Arguments:
			request: The request which may contain no actual parameters since none 
				are needed.
		Returns:
			A response that contains a JSON object with a list of all available 
				models.
		"""
		
		response = []
		
		for name, model in self.model_manager.get_model_modules().items():
			response.append({
				'name': name,
				'displayName': model.display_name,
				'version': model.version
			})
		
		return http_util.Respond(request, response, 'application/json')
		
		'''# This is a dictionary mapping from run to (tag to string content).
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

		return http_util.Respond(request, response, 'application/json')'''
	
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
			request, ['model', 'layer']
		)
		
		if missing_arguments != None:
			return missing_arguments
		
		# Now that we are sure all necessary arguments are available, extract them 
		# from the request
		model_name = request.args.get('model')
		layer_name = request.args.get('layer')
		
		# Gather meta data for our model run
		meta_data = {
			'run_type': 'single_activation_visualization',
			'layer': layer_name
		}
		
		model = self.model_manager.get_model_modules()[model_name]
		
		with tf.Graph().as_default():
			# Retrieve a test image
			image = demo_data.get_demo_image()
			
			# Run the model on our input data
			result = model.run(image, meta_data)
		
		# After the model has run, construct meta information using the tensor data
		response = {'unitCount': result.shape[0] - 2}
		
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
		)
