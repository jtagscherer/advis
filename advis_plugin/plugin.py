from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow as tf
from tensorboard.plugins import base_plugin
from werkzeug import wrappers

from advis_plugin.models import models
from advis_plugin.datasets import datasets
from advis_plugin.distortions import distortions

from advis_plugin.routers import \
	model_router, distortion_router, dataset_router, visualization_router

class AdvisPlugin(base_plugin.TBPlugin):
	"""A plugin for visualizing random perturbations of input data and their 
	effects on deep learning models."""
	
	# Unique plugin identifier
	plugin_name = 'advis'
	
	# Path where all data will be stored, should be the same as the logdir
	storage_path = None
	
	# Manager objects to keep track of resources
	model_manager = None
	dataset_manager = None
	distortion_manager = None

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
			self.dataset_manager, self.distortion_manager)

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
			'/prediction': self.prediction_route,
			'/distortions': self.distortions_route,
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
		
		return model_router.models_route(request, self.model_manager)
	
	@wrappers.Request.application
	def graphs_route(self, request):
		"""A route that returns a response with the graph structure of a specific 
		model.

		Arguments:
			request: The request which has to contain the model's name.
		Returns:
			A response that contains the graph structure of the specified model.
		"""
		
		return model_router.graphs_route(request, self.model_manager)
	
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
		
		return model_router.prediction_route(request, self.model_manager)
	
	@wrappers.Request.application
	def distortions_route(self, request):
		"""A route that returns a list of all available distortion methods.

		Arguments:
			request: The request which has to contain no additional information.
		Returns:
			A response that contains a list of all available distortion methods.
		"""
		
		return distortion_router.distortions_route(request, self.distortion_manager)
	
	@wrappers.Request.application
	def datasets_route(self, request):
		"""A route that returns a list of all available datasets.

		Arguments:
			request: The request which has to contain no additional information.
		Returns:
			A response that contains a list of all available datasets.
		"""
		
		return dataset_router.datasets_route(request, self.dataset_manager)
	
	@wrappers.Request.application
	def datasets_images_list_route(self, request):
		"""A route that returns a list of all input images inside a dataset.

		Arguments:
			request: The request which has to contain the dataset's name.
		Returns:
			A response that contains a list of all input images in the dataset 
				alongside meta data such as their category ID and label.
		"""
		
		return dataset_router.datasets_images_list_route(request,
			self.dataset_manager)
	
	@wrappers.Request.application
	def datasets_images_image_route(self, request):
		"""A route that returns a single input image from a dataset.

		Arguments:
			request: A request containing the dataset's name and either the desired 
				image's index or ID.
		Returns:
			The desired image as retrieved from the dataset.
		"""
		
		return dataset_router.datasets_images_image_route(request,
			self.dataset_manager)
	
	@wrappers.Request.application
	def layer_meta_route(self, request):
		"""A route that returns meta information about a network layer of which 
		visualizations exist.

		Arguments:
			request: A request containing the model name, the layer name as well as 
				the index of the input image as retrieved from the dataset. It might 
				also contain the name of a distortion that should be applied to the 
				input image.
		Returns:
			A JSON document containing meta information about the layer.
		"""
		
		return visualization_router.layer_meta_route(request, self.model_manager)
	
	@wrappers.Request.application
	def layer_image_route(self, request):
		"""A route that returns a tiled image of the activation and feature 
		visualizations of a deep learning layer.

		Arguments:
			request: A request containing the model name, the layer name, the unit 
				index as well as the index of the input image as retrieved from the 
				dataset. It might also contain the name of a distortion that should be 
				applied to the input image.
		Returns:
			A URL for the image data containing the requested visualization.
		"""
		
		return visualization_router.layer_image_route(request, self.model_manager)
