import tensorflow as tf
import numpy as np

import traceback
import logging
import importlib.util

from os import makedirs, path, listdir, walk
from os.path import isfile, join, dirname, splitext
from shutil import copyfile, rmtree

import json

from advis_plugin.models import util
from advis_plugin.util import imgutil
from checkpoints import checkpoints

# True if models annotated with visualization nodes should be cached
USE_MODEL_CACHING = True

class Model:
	# Common variables describing the model and its module
	name = None
	display_name = None
	version = None
	
	# Proto buffers describing the model's graph structure
	full_graph_structure = None
	simplified_graph_structure = None
	
	# Internal references
	_dataset = None
	_distortions = None
	
	# The loaded Python module and its directory
	_module = None
	_directory = None
	
	# Tensorflow structures retained throughout the whole lifecycle
	_graph = None
	_session = None
	_saver = None
	
	# A dictionary mapping node names to their tensor annotations
	_image_tensors = {}
	_activation_tensors = {}
	
	# The node containing the model's final output
	_output_node = None
	
	def __init__(self, name, module, directory, dataset, distortions):
		# Initialize common variables
		self._module = module
		self.name = name
		self._directory = directory
		self._dataset = dataset
		self._distortions = distortions
		
		self.display_name = self._module.get_display_name()
		self.version = self._module.get_version()
		
		tf.logging.warn('Setting up \"{}\", version {}...'
			.format(self.display_name, self.version))
		
		tf.logging.info('Initialized with {} images from the dataset \"{}\".'
			.format(len(self._dataset.images), self._dataset.display_name))
		
		# Retrieve the checkpoint directory as declared by the model module
		declared_directory = self._module.get_checkpoint_directory()
		checkpoint_directory = None
		
		if declared_directory['type'] == 'preset':
			checkpoint_directory = checkpoints.get_checkpoint_directory(
				declared_directory['directory'])
		else:
			tf.logging.error('Invalid checkpoint directory type {} for model \"{}\"!'
				.format(declared_directory['type'], self.display_name))
		
		# Initialize the model using its declared checkpoint directory
		if checkpoint_directory != None:
			self._initialize_graph(checkpoint_directory)
	
	def _initialize_graph(self, checkpoint_directory):
		self._graph = tf.Graph()
		self._session = tf.Session(graph=self._graph)
		
		with self._graph.as_default():
			# Load a cached pre-annotated model if it exists
			cached_model_directory = join(self._directory, 'cached')
			
			if USE_MODEL_CACHING:
				if path.exists(cached_model_directory):
					# Check if a file with meta information exists
					meta_file_name = join(cached_model_directory, 'meta.json')
					
					if isfile(meta_file_name):
						# If a meta file exists, open it and extract its data
						with open(meta_file_name, 'r') as meta_file:
							meta_data = json.load(meta_file)
						
						if meta_data['version'] == self.version:
							# The cached file is recent. Use it instead of recreating it.
							tf.logging.warn('Using cached model...')
							
							# Load the graph's structure
							self._saver = tf.train.import_meta_graph(join(
								cached_model_directory, '{}.meta'.format(self.name)))
							
							# Initialize all variable values, e.g. weights
							self._saver.restore(self._session, join(cached_model_directory, 
								self.name))
							
							# Extract all meta information
							self.full_graph_structure = meta_data['full_graph_structure']
							self.simplified_graph_structure = \
								meta_data['simplified_graph_structure']
							
							for node, image_tensor in meta_data['image_tensors'].items():
								self._image_tensors[node] = self._graph.get_tensor_by_name(
									image_tensor)
							
							for node, activation_tensor in meta_data['activation_tensors'] \
								.items():
								self._activation_tensors[node] = self._graph.get_tensor_by_name(
									activation_tensor)
							
							# Store the tensor containing the model's prediction
							self._output_node = self._graph.get_tensor_by_name('{}:0'
								.format(self._module.get_output_node()))
							
							# Everything has been restored, we can skip the graph creation
							return
						else:
							# The cached file is not recent. Clear the cache directory and 
							# recreate the model.
							rmtree(cached_model_directory)
				else:
					makedirs(cached_model_directory)
			
			# Load the graph's structure
			self._saver = tf.train.import_meta_graph('{}.meta'.format(
				checkpoint_directory))
			
			# Initialize all variable values, e.g. weights
			self._saver.restore(self._session, checkpoint_directory)
			
			# Store the graph structure before adding visualization nodes
			graph_def = self._graph.as_graph_def()
			
			self.full_graph_structure = str(graph_def)
			
			tf.logging.warn('Simplifying graph structure...')
			self.simplified_graph_structure = str(
				util.simplify_graph(graph_def, self._module.annotate_node)
			)
			
			tf.logging.warn('Adding visualization nodes...')
			
			node_index = 0
			
			# Annotate all viable nodes with image tensor and operations and 
			# operations that can be used for comparing multiple node's outputs
			for n in self._graph.as_graph_def().node:
				if self._module.annotate_node(n):
					image_tensor, activation_tensor = util.annotate_tensor(
						'{}/LayerVisualization'.format(n.name),
						self._graph.get_tensor_by_name('{}:0'.format(n.name))
					)
					
					self._image_tensors[n.name] = image_tensor
					self._activation_tensors[n.name] = activation_tensor
					
					# DEBUG: Only annotate the first three nodes for now,
					# allowing faster testing
					if node_index > 1:
						break
					
					node_index += 1
			
			if USE_MODEL_CACHING:
				# Cache the annotated graph for later use
				self._saver.save(self._session, join(cached_model_directory, self.name))
				
				# Save a meta file describing the cached graph
				cache_meta_data = {
					'version': self.version,
					'image_tensors': {name: tensor.name for name, tensor \
						in self._image_tensors.items()},
					'activation_tensors': {name: tensor.name for name, tensor \
						in self._activation_tensors.items()},
					'full_graph_structure': self.full_graph_structure,
					'simplified_graph_structure': self.simplified_graph_structure
				}
				
				with open(join(cached_model_directory, 'meta.json'), 'w') as meta_file:
					json.dump(cache_meta_data, meta_file)
			
			# Store the tensor containing the model's prediction
			self._output_node = self._graph.get_tensor_by_name('{}:0'
				.format(self._module.get_output_node()))
	
	def run(self, meta_data):
		with self._graph.as_default():
			if meta_data['run_type'] == 'single_activation_visualization':
				# Create a simple activation visualization of one layer with one input
				# image
				
				layer_name = meta_data['layer']
				
				# Do nothing if the desired layer has no visualization annotation
				if layer_name not in self._image_tensors:
					return None
				
				return self._session.run(
					self._image_tensors[layer_name],
					feed_dict={'input:0': self._dataset.load_image(meta_data['image'])}
				)[2:]
			elif meta_data['run_type'] == 'distorted_activation_visualization':
				# Get one input image, distort it multiple times, run all distorted 
				# images through the network and blend all activation visualizations
				
				layer_name = meta_data['layer']
				distortion_name = meta_data['distortion'][0]
				image_amount = meta_data['distortion'][1]
				
				# Do nothing if the desired layer has now visualization annotation or if
				# the visualization does not exist
				if layer_name not in self._image_tensors \
					or distortion_name not in self._distortions:
					return None
				
				# Distort the input image multiple times
				distorted_images = self._distortions[distortion_name].distort(
					self._dataset.load_image(meta_data['image']),
					amount=image_amount
				)
				
				# Visualize the activation that each distorted image causes in the layer
				# we are interested in
				visualizations = []
				
				for image in distorted_images:
					visualizations.append(
						self._session.run(
							self._image_tensors[layer_name],
							feed_dict={'input:0': image}
						)[2:]
					)
				
				# Blend the visualizations of each unit
				blended_visualizations = np.array([])
				
				for unit_index in range(0, len(visualizations[0])):
					unit_visualizations = []
					
					for visualization in visualizations:
						unit_visualizations.append(visualization[unit_index])
					
					blended_visualizations = np.append(
						blended_visualizations,
						imgutil.blend_images(unit_visualizations)
					)
				
				return blended_visualizations
			elif meta_data['run_type'] == 'node_activation':
				# Run an input image through the model and record a node's activation
				
				layer_name = meta_data['layer']
				
				# Do nothing if the desired layer has no activation annotation
				if layer_name not in self._activation_tensors:
					return None
				
				# Retrieve the supplied input data
				if 'input_image_data' in meta_data:
					input_data = meta_data['input_image_data']
				else:
					input_data = self._dataset.load_image(meta_data['image'])
				
				return self._session.run(
					self._activation_tensors[layer_name],
					feed_dict={'input:0': input_data}
				)
			elif meta_data['run_type'] == 'prediction':
				# Predict the class of an input image
				
				input_image = self._dataset.images[meta_data['image']]
				
				if 'input_image_data' in meta_data:
					input_data = meta_data['input_image_data']
				else:
					input_data = self._dataset.load_image(meta_data['image'])
				
				model_output = self._session.run(
					self._output_node,
					feed_dict={'input:0': input_data}
				)[0]
				
				top_5_predictions = [{
					'categoryId': int(index),
					'categoryName': self._dataset.categories[int(index) - 1],
					'certainty': float(model_output[index])
				} for index in model_output.argsort()[-5:][::-1]]
				
				return {
					'input': input_image,
					'predictions': top_5_predictions
				}

class ModelManager:
	directory = None
	model_modules = None
	_dataset_manager = None
	_distortion_manager = None
	
	def __init__(self, directory, dataset_manager, distortion_manager):
		self._dataset_manager = dataset_manager
		self._distortion_manager = distortion_manager
		
		self.directory = path.join(directory, 'models')
		
		if not path.exists(self.directory):
			makedirs(self.directory)
		
		self._copy_preset_models()
		self._update_model_modules()
		
		tf.logging.warn('Model setup finished!')
	
	def is_setup(self):
		return self.directory != None
	
	def get_model_modules(self):
		return self.model_modules
	
	def _update_model_modules(self):
		self.model_modules = {}
		
		# Retrieve a list of all directories describing models
		model_directories = next(walk(self.directory))[1]
		
		# Load each file as a module
		for name in model_directories:
			model_directory = join(self.directory, name)
			
			spec = importlib.util.spec_from_file_location(
				'models.{}'.format(name),
				join(model_directory, '{}.py'.format(name))
			)
			
			module = importlib.util.module_from_spec(spec)
			
			try:
				spec.loader.exec_module(module)
				
				dataset = self._dataset_manager.get_dataset_modules()[module
					.get_dataset()]
				distortions = self._distortion_manager.get_distortion_modules()
				
				self.model_modules[name] = Model(
					name, module, model_directory,
					dataset, distortions
				)
			except Exception as e:
				logging.error('Could not import the model module \"{}\": {}'
					.format(name, traceback.format_exc()))
	
	def _copy_preset_models(self):
		if not self.is_setup():
			return
		
		# Extract a list of presets supplied during the build
		preset_directory = path.join(path.dirname(__file__), 'presets')
		presets = [f for f in listdir(preset_directory) \
			if isfile(join(preset_directory, f)) \
			and splitext(join(preset_directory, f))[1] == '.py' \
			and f != '__init__.py']
		
		# Copy each preset to its own directory in the working directory
		for file in presets:
			model_directory = join(self.directory, splitext(file)[0])
			
			if not path.exists(model_directory):
				makedirs(model_directory)
			
			copyfile(
				join(preset_directory, file),
				join(model_directory, file)
			)
