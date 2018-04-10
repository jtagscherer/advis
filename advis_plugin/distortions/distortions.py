import traceback
import logging

from os import makedirs, path, listdir
from os.path import isfile, join, splitext
from shutil import copyfile

import importlib.util

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
				self.distortion_modules[name] = module
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
