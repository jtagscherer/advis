import os.path

from enum import Enum
import numbers
import json
import random

class ParameterType(Enum):
	'''An enumeration of all available parameter types'''
	CONSTANT = 1,
	RANGE = 2,
	ENUM = 3

class Parameter:
	name = None
	display_name = None
	type = None
	constraints = None
	options = None
	
	_value = None
	_configuration_file = None
	
	def __init__(self, content, configuration_file):
		self.name = content['name']
		self.display_name = content['display_name']
		self.type = ParameterType[content['type'].upper()]
		
		if self.type is ParameterType.ENUM:
			self.options = content['options']
		else:
			self.constraints = content['constraints']
		
		self._configuration_file = configuration_file
		
		if self._configuration_file is not None:
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
		if not _is_valid_value(value, self.type, self.options):
			raise ValueError('The value {} is invalid for the parameter {} of type {}'
				.format(value, self.name, self.type))
		
		# Clamp the value according to the constraints
		if self.type is not ParameterType.ENUM:
			min_value = self.constraints['min']
			max_value = self.constraints['max']
		
		if self.type is ParameterType.CONSTANT:
			value = max(min(value, max_value), min_value)
		elif self.type is ParameterType.RANGE:
			value['lower'] = max(min(value['lower'], max_value), min_value)
			value['upper'] = max(min(value['upper'], max_value), min_value)
		elif self.type is ParameterType.ENUM:
			for option in self.options:
				if option['name'] == value:
					value = option
		
		# Update the non-persistent representation of the value
		self._value = value
		
		if self._configuration_file is not None:
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

def _is_valid_value(value, type, options=None):
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
	elif type is ParameterType.CONSTANT:
		return isinstance(value, numbers.Number)
	elif type is ParameterType.ENUM:
		if options is not None:
			for option in options:
				if option['name'] == value:
					return True
			return False
		else:
			return False
	else:
		return False

def reset_random_seed():
	random.seed(42)

def generate_configuration(parameters, percentage=None, randomize=True):
	"""Given a set of parameters, select a valid value for each of them 
	respecting given parameter types and constraints. By default, this will 
	randomize parameters.

	Arguments:
		parameters: A valid set of configuration parameters.
		percentage: A floating point number between 0 and 1 according to which 
			values will be chosen from available ranges. Can be None if randomized 
			values should be generated.
		randomize: True if random values should be chosen instead of sequentially 
		 	choosing them from the available range.
	Returns:
		A dictionary mapping each parameter name to its chosen value.
	"""
	
	configuration = {}
	
	for parameter_name in parameters.keys():
		parameter = parameters[parameter_name]
		
		if parameter.type is ParameterType.CONSTANT:
			configuration[parameter_name] = parameter.get_value()
		elif parameter.type is ParameterType.RANGE:
			lower = parameter.get_value()['lower']
			upper = parameter.get_value()['upper']
			
			if randomize:
				configuration[parameter_name] = random.uniform(lower, upper)
			elif percentage != None:
				configuration[parameter_name] = lower + percentage * (upper - lower)
		elif parameter.type is ParameterType.ENUM:
			configuration[parameter_name] = parameter.get_value()
	
	return configuration

def from_json(data):
	"""Initialize a dictionary of parameters from JSON data.

	Arguments:
		parameters: A valid set of configuration parameters as JSON data. Each 
			parameter has to contain its name, type, and value.
	Returns:
		A dictionary containing all initialized parameters.
	"""
	
	data = json.loads(data)
	parameters = {}
	
	for _parameter in data:
		parameter = Parameter(
			{
				'name': _parameter['name'],
				'display_name': _parameter['displayName'],
				'type': _parameter['type'],
				'constraints': _parameter['constraints'],
				'options': _parameter['options']
			},
			None
		)
		parameter._value = _parameter['value']
		
		parameters[_parameter['name']] = parameter
	
	return parameters
