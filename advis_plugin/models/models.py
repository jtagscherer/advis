import tensorflow as tf

import traceback
import logging
import importlib.util

from os import makedirs, path, listdir
from os.path import isfile, join, dirname, splitext
from shutil import copyfile

from advis_plugin.models import util
from data.checkpoints import checkpoints

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
			# Load the graph's structure
			saver = tf.train.import_meta_graph('{}.meta'.format(checkpoint_directory))
			
			# Initialize all variable values, e.g. weights
			saver.restore(self._session, checkpoint_directory)
			
			# Store the graph structure before adding visualization nodes
			self.graph_structure = str(self._graph.as_graph_def())
			
			# Annotate all viable nodes with image tensor operations
			for n in self._graph.as_graph_def().node:
				if self._module.annotate_node(n):
					image_node = util.generate_image_from_tensor(
						self._graph.get_tensor_by_name('{}:0'.format(n.name))
					)
					
					self._image_tensors[n.name] = image_node
	
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
		self.model_modules = {}
		
		if not path.exists(self.directory):
			makedirs(self.directory)
		
		self._copy_preset_models()
		self._update_model_modules()
	
	def is_setup(self):
		return self.directory != None
	
	def get_model_modules(self):
		return self.model_modules
	
	def _update_model_modules(self):
		self.model_modules = {}
		
		# Retrieve a list of all Python files describing models
		model_files = [f for f in listdir(self.directory) \
			if isfile(join(self.directory, f)) \
			and splitext(join(self.directory, f))[1] == '.py' \
			and f != '__init__.py']
		
		# Load each file as a module
		for f in model_files:
			name = splitext(f)[0]
			
			spec = importlib.util.spec_from_file_location(
				'models.{}'.format(name),
				join(self.directory, f)
			)
			
			module = importlib.util.module_from_spec(spec)
			
			try:
				spec.loader.exec_module(module)
				self.model_modules[name] = Model(name, module, self.directory)
			except Exception as e:
				logging.error('Could not import the model module "{}": {}'
					.format(name, traceback.format_exc()))
	
	def _copy_preset_models(self):
		if not self.is_setup():
			return
		
		# Extract a list of presets supplied during the build
		preset_directory = path.join(path.dirname(__file__), 'presets')
		presets = [f for f in listdir(preset_directory) \
			if isfile(join(preset_directory, f)) \
			and splitext(join(preset_directory, f))[1] == '.py']
		
		# Copy each preset to the working directory
		for file in presets:
			copyfile(join(preset_directory, file), join(self.directory, file))
