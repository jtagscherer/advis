import tensorflow as tf

import traceback
import logging
import importlib.util

from os import makedirs, path, listdir
from os.path import isfile, join, dirname, splitext
from shutil import copyfile

class Model:
	name = None
	display_name = None
	version = None
	graph_structure = None
	_module = None
	_directory = None
	
	def __init__(self, name, module, directory):
		self._module = module
		self.name = name
		self._directory = directory
		
		self.display_name = self._module.get_display_name()
		self.version = self._module.get_version()
		
		tf.logging.warn('Setting up \"{}\", version {}...'
			.format(self.display_name, self.version))
		
		# Initialize the model
		# TODO: Include checkpoint files from a separate repository
		self.graph_structure = self._module.initialize(
			'/Users/jan/Desktop/inception_v3/inception_v3_checkpoint.meta',
			'/Users/jan/Desktop/inception_v3/inception_v3_checkpoint'
		)
	
	def run(self, input, meta_data):
		return self._module.run(input, meta_data)

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
