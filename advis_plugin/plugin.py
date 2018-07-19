from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from os.path import join

import tensorflow as tf
from tensorboard.plugins import base_plugin
from werkzeug import wrappers

from advis_plugin.models import models
from advis_plugin.datasets import datasets
from advis_plugin.distortions import distortions

from advis_plugin.routers import model_router, prediction_router, \
	confusion_matrix_router, distortion_router, dataset_router, \
	single_visualization_router, composite_visualization_router, \
	node_difference_router, cache_router

from advis_plugin.util.cache import DataCache

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
		
		DataCache().set_storage_file(join(self.storage_path, 'cache.pickle'))
		
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
			'/predictions/single': self.single_prediction_route,
			'/predictions/average': self.average_prediction_route,
			'/predictions/accuracy': self.accuracy_prediction_route,
			'/confusion/matrix/superset': self.confusion_matrix_superset_route,
			'/confusion/images': self.confusion_images_route,
			'/distortions': self.distortions_route,
			'/distortions/single': self.distortions_single_route,
			'/distortions/update': self.distortions_update_route,
			'/datasets': self.datasets_route,
			'/datasets/images/list': self.datasets_images_list_route,
			'/datasets/images/image': self.datasets_images_image_route,
			'/layer/single/meta': self.layer_single_meta_route,
			'/layer/single/image': self.layer_single_image_route,
			'/layer/composite/meta': self.layer_composite_meta_route,
			'/layer/composite/image': self.layer_composite_image_route,
			'/node': self.node_difference_route,
			'/node/list': self.node_difference_list_route,
			'/node/list/meta': self.node_difference_list_meta_route,
			'/cache': self.cache_route,
			'/cache/progress': self.cache_progress_route
		}

	def is_active(self):
		"""Determines whether this plugin is active.

		Returns:
			True if this plugin is active, false otherwise
		"""
		
		# The plugin is active if at least one model has been loaded.
		return len(self.model_manager.get_model_modules()) > 0
	
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
	def single_prediction_route(self, request):
		"""A route that returns a model's prediction of a single input image.

		Arguments:
			request: The request which has to contain the model's name and an image 
				number. It can also contain the name of a distortion that should be 
				applied to the input image before predicting its classification. On top 
				of that, you can supply a distortion index and the amount of 
				predictions you want to retrieve. If you specify this amount as -1, all 
				predictions will be retrieved. Alternatively, if you are only 
				interested in the certainty of a single category, you can supply its ID.
		Returns:
			A response that contains information about the input image as well as the 
				model's prediction.
		"""
		
		return prediction_router.single_prediction_route(request, 
			self.model_manager, self.distortion_manager)
	
	@wrappers.Request.application
	def average_prediction_route(self, request):
		"""A route that returns a model's average prediction on a set of distorted 
		versions of a single input image.

		Arguments:
			request: The request which has to contain the model's name, the input 
				image index, the name of the distortion to be used, as well as the 
				amount of distorted versions of the input image to be generated.
		Returns:
			A response that contains information about the input image as well as the 
				model's prediction, averaged over all distorted versions.
		"""
		
		return prediction_router.average_prediction_route(request, 
			self.model_manager, self.distortion_manager)
	
	@wrappers.Request.application
	def accuracy_prediction_route(self, request):
		"""A route that returns the accuracy of a model's predictions on a set of 
		input images, as well as its accuracy when these input images are distorted.
		
		Arguments:
			request: The request which has to contain the model's name and an amount
				of input images to be fetched from the input data set. Optionally, a
				distortion method can be supplied, which will be used to manipulate the 
				input image before its evaluation.
				Keep in mind that depending on your hardware, the model's complexity 
				and the amount of input images this calculation can take a while.
		Returns:
			A response that contains the top 5 and top 1 accuracy of the model's 
				predictions on the original input images as well as on each set of 
				distorted images. On top of that, a host of other performance metrics 
				such as recall, precision and the F1 score will be returned.
		"""
		
		return prediction_router.accuracy_prediction_route(request, 
			self.model_manager, self.distortion_manager)
	
	@wrappers.Request.application
	def confusion_matrix_superset_route(self, request):
		"""A route that returns a model's confusion matrix delta given a distortion 
		and a specific dataset hierarchy level.

		Arguments:
			request: The request which has to contain the model's name, the name of 
				a distortion and the name of a hierarchy superset. If no superset name 
				is supplied, the most high-level one is used. On top of that, a mode 
				has to be supplied. If it is 'original', the confusion matrix for 
				original input images will be returned. If it is 'distorted', the 
				confusion matrix for distorted input images will be returned. If it is 
				'difference', the delta between the two aforementioned confusion 
				matrices will be returned.
		Returns:
			A response that contains all rows of the confusion matrix.
		"""
		
		return confusion_matrix_router.confusion_matrix_superset_route(request, 
			self.model_manager, self.distortion_manager)
	
	@wrappers.Request.application
	def confusion_images_route(self, request):
		"""A route that returns a list of input images within a superset given a 
		model name.

		Arguments:
			request: The request which has to contain the model's name and the name 
				of a superset within the category hierarchy of the dataset that the 
				model uses. On top of that, the request has to contain the name of a 
				distortion that will be used to compare prediction certainties. 
				Moreover, a sort method has to be supplied that will be used to sort 
				the list of images. This can be either 'ascending' to sort by the 
				increasing amount of certainty change, 'descending' to do the same but 
				in reverse or 'index' to sort by image indices.
		Returns:
			A response that contains a list of all input images within the given 
				superset.
		"""
		
		return confusion_matrix_router.confusion_images_route(request, 
			self.model_manager, self.distortion_manager)
	
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
	def distortions_single_route(self, request):
		"""A route that distorts a single input image and returns the result.

		Arguments:
			request: The request which has to contain the distortion's name as well 
				as the name of the dataset and the image index of the input image. On 
				top of that, a distortion index may be supplied, allowing you to fetch 
				multiple random distortions of a single image with each distorted image 
				with the same index staying the same. Moreover, you can supply your own 
				set of parameters as JSON to preview a configuration.
		Returns:
			A response that contains the image after having been randomly distorted.
		"""
		
		return distortion_router.distortions_single_route(request,
			self.distortion_manager, self.dataset_manager)
	
	@wrappers.Request.application
	def distortions_update_route(self, request):
		"""A route that updates the parameter values of a list of distortions.

		Arguments:
			request: The request which has to contain the list of distortions whose 
				parameter values should be updated. After these values have been 
				updated, the changes will be persisted and cached data that has become 
				invalid will be removed.
		Returns:
			An empty response if everything went as expected.
		"""
		
		return distortion_router.distortions_update_route(request,
			self.distortion_manager)
	
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
	def layer_single_meta_route(self, request):
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
		
		return single_visualization_router.layer_meta_route(request,
			self.model_manager)
	
	@wrappers.Request.application
	def layer_single_image_route(self, request):
		"""A route that returns a single unit's activation visualization.

		Arguments:
			request: A request containing the model name, the layer name, the unit 
				index as well as the index of the input image as retrieved from the 
				dataset. It might also contain the name of a distortion that should be 
				applied to the input image.
		Returns:
			A URL for the image data containing the requested visualization.
		"""
		
		return single_visualization_router.layer_image_route(request,
			self.model_manager)
	
	@wrappers.Request.application
	def layer_composite_meta_route(self, request):
		"""A route that returns meta information about the composited activation 
		visualizations of all units of a single layer.

		Arguments:
			request: A request containing the model name, the layer name as well as 
				the index of the input image as retrieved from the dataset. It should 
				also contain the desired width and height of the composite image. Unit 
				visualization tiles will be scaled and positioned to fit as best as 
				possible.
		Returns:
			A JSON document containing meta information about the composite image.
				This may be used as a click map for the associated composite image.
		"""
		
		return composite_visualization_router.layer_meta_route(request,
			self.model_manager)
	
	@wrappers.Request.application
	def layer_composite_image_route(self, request):
		"""A route that returns a stitched composition of the activation 
		visualizations of all units of a single layer.

		Arguments:
			request: A request containing the model name, the layer name as well as 
				the index of the input image as retrieved from the dataset. It should 
				also contain the desired width and height of the composite image. Unit 
				visualization tiles will be scaled and positioned to fit as best as 
				possible.
		Returns:
			A composite image of all unit's activation visualizations.
		"""
		
		return composite_visualization_router.layer_image_route(request,
			self.model_manager)
	
	@wrappers.Request.application
	def node_difference_route(self, request):
		"""A route that returns the average difference in activation of a layer 
		between a set of original input images and distorted input images.

		Arguments:
			request: The request which has to contain the model's name and an amount
				of input images to be fetched from the input data set. Moreover, a
				distortion method has to be supplied, which will be used to manipulate 
				each input image before its evaluation.
		Returns:
			A response that contains the average activation difference between each 
				original input image and its distorted version, calculated using the 
				Frobenius tensor norm.
		"""
		
		return node_difference_router.node_difference_route(request,
			self.model_manager, self.distortion_manager)
	
	@wrappers.Request.application
	def node_difference_list_route(self, request):
		"""A route that returns the percentual average difference in activation of 
		all layers in a graph between a set of original input images and distorted 
		input images. A list of distortions to be applied has to be supplied as 
		well as a method of accumulating activation differences in higher-level 
		nodes.

		Arguments:
			request: The request which has to contain the model's name and an amount
				of input images to be fetched from the input data set. Moreover, a list 
				of distortion method has to be supplied, which will be used to 
				manipulate each input image before its evaluation. On top of that, the 
				request must specify a method of accumulating activation differences in 
				higher-level nodes.
				Optionally, the output can be retrieved as a simple node name to value 
				mapping (default) or as a graph. Percentual values can be computed 
				relatively (default) or absolutely to the full range.
		Returns:
			A response that contains the percentual average activation difference 
				between original and distorted images for all nodes in the model.
		"""
		
		return node_difference_router.node_difference_list_route(request,
			self.model_manager, self.distortion_manager)
	
	@wrappers.Request.application
	def node_difference_list_meta_route(self, request):
		"""A route that returns meta information about the percentual average
		difference in activation of all layers in a graph between a set of original 
		input images and distorted input images. All available distortions will 
		be used to generate this meta information. A method of accumulating 
		activation differences in higher-level nodes has to be supplied.

		Arguments:
			request: The request which has to contain the model's name and an amount
				of input images to be fetched from the input data set. Moreover, the 
				request must specify a method of accumulating activation differences in 
				higher-level nodes.
		Returns:
			A response that contains meta information about the activation
				differences.
		"""
		
		return node_difference_router.node_difference_list_meta_route(request,
			self.model_manager, self.distortion_manager)
	
	@wrappers.Request.application
	def cache_route(self, request):
		"""A route that caches all relevant data to ensure a fast and seamless 
		interaction.

		Arguments:
			request: The request which has to contain the image amounts used for 
				calculating model accuracies, activation visualizations, and node 
				activations.
		Returns:
			A response with the time taken after the caching has been completed.
		"""
		
		routers = {
			'model': model_router,
			'prediction': prediction_router,
			'confusionMatrix': confusion_matrix_router,
			'distortion': distortion_router,
			'dataset': dataset_router,
			'singleVisualization': single_visualization_router,
			'compositeVisualization': composite_visualization_router,
			'nodeDifference': node_difference_router
		}
		
		managers = {
			'model': self.model_manager,
			'dataset': self.dataset_manager,
			'distortion': self.distortion_manager
		}
		
		return cache_router.cache_route(request, routers, managers)
	
	@wrappers.Request.application
	def cache_progress_route(self, request):
		"""A route that retrieves the current progress of the caching process.

		Arguments:
			request: The request which does not have to contain any parameters.
		Returns:
			A response with the current progress and status of the caching progress.
		"""
		
		return cache_router.cache_progress_route(request)
