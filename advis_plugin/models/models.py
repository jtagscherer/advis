import tensorflow as tf

import traceback
import logging
import importlib.util

from os import makedirs, path, listdir, walk
from os.path import isfile, join, dirname, splitext
from shutil import copyfile, rmtree

import json

from advis_plugin.models import util
from data.checkpoints import checkpoints

# True if models annotated with visualization nodes should be cached
USE_MODEL_CACHING = False

class Model:
	# Common variables describing the model and its module
	name = None
	display_name = None
	version = None
	graph_structure = None
	
	# The loaded Python module and its directory
	_module = None
	_directory = None
	
	# Tensorflow structures retained throughout the whole lifecycle
	_graph = None
	_session = None
	_saver = None
	
	# A dictionary mapping node names to their image tensor annotations
	_image_tensors = {}
	
	def __init__(self, name, module, directory):
		# Initialize common variables
		self._module = module
		self.name = name
		self._directory = directory
		
		self.display_name = self._module.get_display_name()
		self.version = self._module.get_version()
		
		tf.logging.warn('Setting up \"{}\", version {}...'
			.format(self.display_name, self.version))
		
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
							self.graph_structure = meta_data['graph_structure']
							
							for node, image_tensor in meta_data['image_tensors'].items():
								self._image_tensors[node] = self._graph.get_tensor_by_name(
									image_tensor)
							
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
			self.graph_structure = str(self._graph.as_graph_def())
			
			tf.logging.warn('Adding visualization nodes...')
			
			# Annotate all viable nodes with image tensor operations
			for n in self._graph.as_graph_def().node:
				if self._module.annotate_node(n):
					image_node = util.generate_image_from_tensor(
						'{}/LayerVisualization'.format(n.name),
						self._graph.get_tensor_by_name('{}:0'.format(n.name))
					)
					
					self._image_tensors[n.name] = image_node
			
			if USE_MODEL_CACHING:
				# Cache the annotated graph for later use
				self._saver.save(self._session, join(cached_model_directory, self.name))
				
				# Save a meta file describing the cached graph
				cache_meta_data = {
					'version': self.version,
					'image_tensors': {name: tensor.name for name, tensor \
						in self._image_tensors.items()},
					'graph_structure': self.graph_structure
				}
				
				with open(join(cached_model_directory, 'meta.json'), 'w') as meta_file:
					json.dump(cache_meta_data, meta_file)
	
	def run(self, input, meta_data):
		with self._graph.as_default():
			if meta_data['run_type'] == 'single_activation_visualization':
				layer_name = meta_data['layer']
				
				if layer_name in self._image_tensors:
					result = self._session.run(self._image_tensors[layer_name],
						feed_dict={'input:0': input})
				else:
					result = None
		
		return result

class ModelManager:
	directory = None
	model_modules = None
	
	def __init__(self, directory):
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
				self.model_modules[name] = Model(name, module, model_directory)
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
