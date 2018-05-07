from __future__ import division
from skimage.io import imread
import numpy as np

import traceback
import logging
import importlib.util

from os import makedirs, path, listdir, walk
from os.path import isdir, join, dirname
from shutil import copytree

class Dataset:
	# Common variables describing the model and its module
	name = None
	display_name = None
	images = None
	categories = None
	
	# The loaded Python module and its directory
	_module = None
	_directory = None
	
	def __init__(self, name, module, directory):
		# Initialize common variables
		self._module = module
		self.name = name
		self._directory = directory
		
		# Retrieve all other data from within the module
		self.display_name = self._module.get_display_name()
		self.images = self._module.get_all_images()
		self.categories = self._module.get_categories()
	
	def load_image(self, index):
		return imread(self.images[index]['path']) / 255

class DatasetManager:
	directory = None
	dataset_modules = None
	
	def __init__(self, directory):
		self.directory = path.join(directory, 'datasets')
		self.dataset_modules = {}
		
		if not path.exists(self.directory):
			makedirs(self.directory)
		
		self._copy_preset_datasets()
		self._update_dataset_modules()
	
	def is_setup(self):
		return self.directory != None
	
	def get_dataset_modules(self):
		return self.dataset_modules
	
	def _update_dataset_modules(self):
		self.dataset_modules = {}
		
		# Retrieve a list of all directories describing datasets
		dataset_directories = next(walk(self.directory))[1]
		
		# Load each file as a module
		for name in dataset_directories:
			dataset_directory = join(self.directory, name)
			
			spec = importlib.util.spec_from_file_location(
				'datasets.{}'.format(name),
				join(dataset_directory, '{}.py'.format(name))
			)
			
			module = importlib.util.module_from_spec(spec)
			
			try:
				spec.loader.exec_module(module)
				self.dataset_modules[name] = Dataset(name, module, dataset_directory)
			except Exception as e:
				logging.error('Could not import the dataset module \"{}\": {}'
					.format(name, traceback.format_exc()))
	
	def _copy_preset_datasets(self):
		if not self.is_setup():
			return
		
		# Extract a list of presets supplied during the build
		preset_root = path.join(path.dirname(__file__), 'presets')
		preset_directories = [d for d in listdir(preset_root) \
			if isdir(join(preset_root, d))]
		
		# Copy over each preset directory to the working directory
		for preset_directory in preset_directories:
			model_directory = join(self.directory, preset_directory)
			
			if not path.exists(model_directory):
				copytree(
					join(preset_root, preset_directory),
					model_directory
				)