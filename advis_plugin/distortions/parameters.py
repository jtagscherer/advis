import os.path

from enum import Enum
import numbers
import json

class ParameterType(Enum):
  '''An enumeration of all available parameter types'''
  RANGE = 1

class Parameter:
	name = None
	display_name = None
	type = None
	constraints = None
	
	_value = None
	_configuration_file = None
	
	def __init__(self, content, configuration_file):
		self.name = content['name']
		self.display_name = content['display_name']
		self.type = ParameterType[content['type'].upper()]
		self.constraints = content['constraints']
		self._configuration_file = configuration_file
		
		# Fetch the current value from the configuration file or use the default 
		# one if none exists
		configuration = self._get_configuration()
		
		if self.name in configuration.keys():
			self._value = configuration[self.name]
		else:
			self.set_value(content['default'])
	
	def get_value(self):
		return self._value
	
	def set_value(self, value):
		# Check whether the new value is valid given the parameter type
		if not _is_valid_value(value, self.type):
			raise ValueError('The value {} is invalid for the parameter {} of type {}'
				.format(value, self.name, self.type))
		
		self._value = value
		
		# Write the new value to the configuration file for persistent storage
		configuration = self._get_configuration()
		
		with open(self._configuration_file, 'w+') as f:
			configuration[self.name] = value
			f.write(json.dumps(configuration))
	
	def _get_configuration(self):
		configuration = {}
		
		if os.path.isfile(self._configuration_file):
			with open(self._configuration_file, 'r') as f:
				file_content = f.read()
				
				if len(file_content) > 0:
					configuration = json.loads(file_content)
		
		with open(self._configuration_file, 'w+') as f:	
			f.write(json.dumps(configuration))
		
		return configuration

def _is_valid_value(value, type):
	"""Given a value and a parameter type, check whether the value is a valid one.

	Arguments:
		value: An arbitrary value to be checked.
		type: A `ParameterType` enum signifying the type of the parameter.
	Returns:
		True if the value is valid, false otherwise.
	"""
	
	if type is ParameterType.RANGE:
		return 'lower' in value and 'upper' in value \
		 	and isinstance(value['lower'], numbers.Number) \
			and isinstance(value['upper'], numbers.Number) \
			and value['lower'] <= value['upper']
	else:
		return False

def randomize(parameters):
	"""Given a set of parameters, select a random valid value for each of them 
	respecting given parameter types and constraints.

	Arguments:
		parameters: A valid set of configuration parameters.
	Returns:
		A dictionary mapping each parameter name to its chosen value.
	"""
	
	# TODO: Randomize parameters
	
	return {'rotation_range': 45}
