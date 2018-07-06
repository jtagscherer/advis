import traceback
import logging
import importlib.util
import collections

from os import makedirs, path, listdir, walk
from os.path import isfile, isdir, join, splitext
from shutil import copytree, ignore_patterns

from advis_plugin.distortions import parameters

class Distortion:
	name = None
	display_name = None
	type = None
	icon = None
	_module = None
	_directory = None
	_parameters = None
	
	def __init__(self, name, module, directory):
		self._module = module
		self.name = name
		self._directory = directory
		
		self.display_name = self._module.get_display_name()
		self.icon = self._module.get_icon()
		
		if hasattr(self._module, 'get_type'):
			self.type = self._module.get_type()
		else:
			self.type = 'Custom'
		
		# Fetch and set up the module's parameters
		self._parameters = {}
		
		for parameter in self._module.get_parameters():
			self._parameters[parameter['name']] = parameters.Parameter(parameter,
				join(self._directory, '{}.json'.format(self.name)))
	
	def distort(self, image, amount=1, mode='randomized', \
		custom_parameters=None):
		distorted_images = []
		
		if custom_parameters is not None:
			_parameters = parameters.from_json(custom_parameters)
		else:
			_parameters = self._parameters
		
		# Reset the random seed for repeatable randomization
		if mode == 'randomized' or mode == 'single-randomized':
			parameters.reset_random_seed()
		
		for i in range(0, amount):
			if mode == 'sequential':
				distorted_images.append(self._module.distort(image, parameters
					.generate_configuration(_parameters,
					percentage=i / float(amount))))
			elif mode == 'randomized' or mode == 'non-repeatable-randomized':
				distorted_images.append(self._module.distort(image, parameters
					.generate_configuration(_parameters, randomize=True)))
			elif mode == 'single-randomized':
				if i == amount - 1:
					distorted_images.append(self._module.distort(image, parameters
						.generate_configuration(_parameters, randomize=True)))
				else:
					parameters.generate_configuration(_parameters, randomize=True)
					distorted_images.append(None)
		
		return distorted_images
	
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
	distortion_modules = None
	
	def __init__(self, directory):
		self.directory = path.join(directory, 'distortions')
		
		self._copy_preset_distortions()
		self._update_distortion_modules()
		
		self.distortion_modules = collections.OrderedDict(
			sorted(self.distortion_modules.items())
		)
	
	def get_distortion_modules(self):
		return self.distortion_modules
	
	def _update_distortion_modules(self):
		self.distortion_modules = {}
		
		# Retrieve a list of all directories describing distortions
		distortion_directories = next(walk(self.directory))[1]
		
		# Load each file as a module
		for name in distortion_directories:
			distortion_directory = join(self.directory, name)
			
			spec = importlib.util.spec_from_file_location(
				'distortions.{}'.format(name),
				join(distortion_directory, '{}.py'.format(name))
			)
			
			module = importlib.util.module_from_spec(spec)
			
			try:
				spec.loader.exec_module(module)
				self.distortion_modules[name] = Distortion(name, module, 
					distortion_directory)
			except Exception as e:
				logging.error('Could not import the distortion module \"{}\": {}'
					.format(name, traceback.format_exc()))
	
	def _copy_preset_distortions(self):
		if path.exists(self.directory):
			return
		else:
			makedirs(self.directory)
		
		# Extract a list of presets supplied during the build
		preset_directory = path.join(path.dirname(__file__), 'presets')
		
		presets = []
		
		for directory in listdir(preset_directory):
			_directory = join(preset_directory, directory)
			_module = join(_directory, '{}.py'.format(directory))
			
			if isdir(_directory) and isfile(_module):
				presets.append(directory)
		
		# Copy each preset to its own directory in the working directory
		for directory in presets:
			distortion_directory = join(self.directory, directory)
			
			if not path.exists(distortion_directory):
				copytree(
					join(preset_directory, directory),
					distortion_directory,
					ignore=ignore_patterns('__init__.py', '__pycache__', '*.pyc')
				)
