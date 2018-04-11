import traceback
import logging
import importlib.util

from os import makedirs, path, listdir
from os.path import isfile, join, splitext
from shutil import copyfile

from distortions import parameters

class Distortion:
	name = None
	display_name = None
	_module = None
	_directory = None
	_parameters = {}
	
	def __init__(self, name, module, directory):
		self._module = module
		self.name = name
		self._directory = directory
		
		self.display_name = self._module.get_display_name()
		
		# Fetch and set up the module's parameters
		for parameter in self._module.get_parameters():
			self._parameters[parameter['name']] = parameters.Parameter(parameter,
				join(self._directory, '{}.json'.format(self.name)))
	
	def distort(self, image):
		# TODO: Randomize parameters and call the module's distortion function with 
		# the right configuration
		return None
	
	def get_parameters(self):
		return self.module.get_parameters()
	
	def get_parameter_value(self, name):
		if name not in self._parameters.keys():
			raise ValueError('No parameter with name {} found.'.format(name))
		
		return self._parameters[name].get_value()
	
	def set_parameter_value(self, name, value):
		if name not in self._parameters.keys():
			raise ValueError('No parameter with name {} found.'.format(name))
		
		self._parameters[name].set_value(value)

class DistortionManager:
	directory = None
	distortion_modules = {}
	
	def __init__(self, directory):
		self.directory = path.join(directory, 'distortions')
		
		if not path.exists(self.directory):
			makedirs(self.directory)
		
		self._copy_preset_distortions()
		self._update_distortion_modules()
	
	def is_setup(self):
		return self.directory != None
	
	def get_distortion_modules(self):
		return self.distortion_modules
	
	def _update_distortion_modules(self):
		self.distortion_modules = {}
		
		# Retrieve a list of all Python files describing distortions
		distortion_files = [f for f in listdir(self.directory) \
			if isfile(join(self.directory, f)) \
			and splitext(join(self.directory, f))[1] == '.py']
		
		# Load each file as a module
		for f in distortion_files:
			name = splitext(f)[0]
			
			spec = importlib.util.spec_from_file_location(
				'distortions.{}'.format(name),
				join(self.directory, f)
			)
			
			module = importlib.util.module_from_spec(spec)
			
			try:
				spec.loader.exec_module(module)
				self.distortion_modules[name] = Distortion(name, module, self.directory)
			except Exception as e:
				logging.error('Could not import the distortion module "{}": {}'
					.format(name, traceback.format_exc()))
	
	def _copy_preset_distortions(self):
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
