from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow as tf
import numpy as np
import six
from werkzeug import wrappers

from advis_plugin import imgutil, argutil
from advis_plugin.models import models
from advis_plugin.datasets import datasets
from advis_plugin.distortions import distortions

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
	dataset_manager = None
	distortion_manager = None
	
	# Data caches for easier access
	_layer_visualization_cache = {}
	_graph_structure_cache = {}

	def __init__(self, context):
		"""Instantiates an AdvisPlugin.

		Arguments:
			context: A base_plugin.TBContext instance. A magic container that
				TensorBoard uses to make objects available to the plugin.
		"""
		# Retrieve and store necessary contextual references
		self._multiplexer = context.multiplexer
		self.storage_path = context.logdir
		
		self.dataset_manager = datasets.DatasetManager(self.storage_path)
		self.distortion_manager = distortions.DistortionManager(self.storage_path)
		
		tf.logging.warn('Setting up all models. This might take a while.')
		self.model_manager = models.ModelManager(self.storage_path,
			self.dataset_manager)

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
			'/graphs': self.graphs_route,
			'/distortions': self.distortions_route,
			'/prediction': self.prediction_route,
			'/datasets': self.datasets_route,
			'/datasets/images/list': self.datasets_images_list_route,
			'/datasets/images/image': self.datasets_images_image_route,
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
	
	def _get_layer_visualization(self, model, layer):
		if model in self._layer_visualization_cache:
			if layer in self._layer_visualization_cache[model]:
				return self._layer_visualization_cache[model][layer]
		
		_model = self.model_manager.get_model_modules()[model]
		
		meta_data = {
			'run_type': 'single_activation_visualization',
			'layer': layer,
			'image': 0
		}
		
		result = _model.run(meta_data)
		
		if model not in self._layer_visualization_cache:
			self._layer_visualization_cache[model] = {}
		
		self._layer_visualization_cache[model][layer] = result
		return result
	
	def _get_graph_structure(self, model):
		if model in self._graph_structure_cache:
			return self._graph_structure_cache[model]
		
		_model = self.model_manager.get_model_modules()[model]
		result = _model.graph_structure
		
		self._graph_structure_cache[model] = result
		return result

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
	
	@wrappers.Request.application
	def graphs_route(self, request):
		"""A route that returns a response with the graph structure of a specific 
		model.

		Arguments:
			request: The request which has to contain the model's name.
		Returns:
			A response that contains the graph structure of the specified model.
		"""
		# Check for missing arguments and possibly return an error
		missing_arguments = argutil.check_missing_arguments(
			request, ['model']
		)
		
		if missing_arguments != None:
			return missing_arguments
		
		model_name = request.args.get('model')
		
		result = self._get_graph_structure(model_name)
		
		response = {'graph': result}
		
		return http_util.Respond(request, response, 'application/json')
	
	@wrappers.Request.application
	def distortions_route(self, request):
		"""A route that returns a list of all available distortion methods.

		Arguments:
			request: The request which has to contain no additional information.
		Returns:
			A response that contains a list of all available distortion methods.
		"""
		
		response = [{
			'name': name,
			'displayName': distortion.display_name,
			'parameters': list(distortion._parameters.keys())
		} for name, distortion in self.distortion_manager.get_distortion_modules()
			.items()]
		
		return http_util.Respond(request, response, 'application/json')
	
	@wrappers.Request.application
	def prediction_route(self, request):
		"""A route that returns a model's prediction of an input image.

		Arguments:
			request: The request which has to contain the model's name and an image 
				number.
		Returns:
			A response that contains information about the input image as well as the 
				model's prediction.
		"""
		# Check for missing arguments and possibly return an error
		missing_arguments = argutil.check_missing_arguments(
			request, ['model', 'imageIndex']
		)
		
		if missing_arguments != None:
			return missing_arguments
		
		model_name = request.args.get('model')
		_model = self.model_manager.get_model_modules()[model_name]
		
		meta_data = {
			'run_type': 'prediction',
			'image': int(request.args.get('imageIndex'))
		}
		
		response = _model.run(meta_data)
		
		return http_util.Respond(request, response, 'application/json')
	
	@wrappers.Request.application
	def datasets_route(self, request):
		"""A route that returns a list of all available datasets.

		Arguments:
			request: The request which has to contain no additional information.
		Returns:
			A response that contains a list of all available datasets.
		"""
		
		response = [{
			'name': name,
			'imageCount': len(dataset.images)
		} for name, dataset in self.dataset_manager.get_dataset_modules().items()]
		
		return http_util.Respond(request, response, 'application/json')
	
	@wrappers.Request.application
	def datasets_images_list_route(self, request):
		"""A route that returns a list of all input images inside a dataset.

		Arguments:
			request: The request which has to contain the dataset's name.
		Returns:
			A response that contains a list of all input images in the dataset 
				alongside meta data such as their category ID and label.
		"""
		# Check for missing arguments and possibly return an error
		missing_arguments = argutil.check_missing_arguments(
			request, ['dataset']
		)
		
		if missing_arguments != None:
			return missing_arguments
		
		dataset_name = request.args.get('dataset')
		
		images = self.dataset_manager.get_dataset_modules()[dataset_name].images
		response = [{
			'index': index,
			'id': image['id'],
			'categoryId': image['categoryId'],
			'categoryName': image['categoryName']
		} for index, image in enumerate(images)]
		
		return http_util.Respond(request, response, 'application/json')
	
	@wrappers.Request.application
	def datasets_images_image_route(self, request):
		"""A route that returns a single input image from a dataset.

		Arguments:
			request: A request containing the dataset's name and either the desired 
				image's index or ID.
		Returns:
			The desired image as retrieved from the dataset.
		"""
		# Check for missing arguments and possibly return an error
		missing_arguments = argutil.check_missing_arguments(
			request, ['dataset']
		)
		
		if missing_arguments != None:
			return missing_arguments
		
		# We always need the name of the desired dataset
		dataset_name = request.args.get('dataset')
		dataset = self.dataset_manager.get_dataset_modules()[dataset_name]
		
		# On top, we either need the desired image's index or ID
		if 'index' in request.args:
			response = dataset.load_image(int(request.args.get('index')),
				output='bytes')
		elif 'id' in request.args:
			image_id = request.args.get('id')
			image_index = None
			
			for index, image in enumerate(dataset.images):
				if image['id'] == image_id:
					image_index = index
					break
			
			if image_index != None:
				response = dataset.load_image(image_index, output='bytes')
			else:
				response = imgutil.get_placeholder_image()
		else:
			# No image has been specified, return a placeholder
			response = imgutil.get_placeholder_image()
		
		# Return the image data with proper headers set
		return http_util.Respond(request, response, 'image/png')
	
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
		
		result = self._get_layer_visualization(model_name, layer_name)
		
		# After the model has run, construct meta information using the tensor data
		if isinstance(result, np.ndarray):
			response = {'unitCount': result.shape[0] - 2}
		else:
			response = {'unitCount': 0}
		
		return http_util.Respond(request, response, 'application/json')
	
	@wrappers.Request.application
	def layer_image_route(self, request):
		"""A route that returns a tiled image of the activation and feature 
		visualizations of a deep learning layer.

		Arguments:
			request: A request containing the model name, the layer name as well as 
				the unit index.
		Returns:
			A URL for the image data containing the requested visualization.
		"""
		# Check for missing arguments and possibly return an error
		missing_arguments = argutil.check_missing_arguments(
			request, ['model', 'layer', 'unitIndex']
		)
		
		if missing_arguments != None:
			return missing_arguments
		
		# Now that we are sure all necessary arguments are available, extract them 
		# from the request
		model_name = request.args.get('model')
		layer_name = request.args.get('layer')
		unit_index = int(request.args.get('unitIndex')) + 2
		
		result = self._get_layer_visualization(model_name, layer_name)
		
		# Check the index value for validity
		if isinstance(result, np.ndarray) and unit_index >= 0 and \
			unit_index < len(result):
			# Fetch the image summary tensor corresponding to the request's values
			response = response = result[unit_index]
		else:
			# Something has gone wrong, return a placeholder
			response = imgutil.get_placeholder_image()
		
		# Return the image data with proper headers set
		return http_util.Respond(request, response, 'image/png')
