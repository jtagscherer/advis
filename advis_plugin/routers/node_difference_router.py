from tensorboard.backend import http_util
from advis_plugin.util import argutil
from advis_plugin.util.cache import DataCache

import math
from random import randrange
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def node_difference_list_route(request, model_manager, distortion_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request,
		['model', 'distortion', 'inputImageAmount', 'accumulationMethod',
		'percentageMode']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	# Extract all parameters
	model_name = request.args.get('model')
	distortions = request.args.get('distortion').split(',')
	input_image_amount = int(request.args.get('inputImageAmount'))
	accumulation_method = request.args.get('accumulationMethod')
	percentage_mode = request.args.get('percentageMode')
	if 'outputMode' not in request.args:
		output_mode = 'mapping'
	else:
		output_mode = request.args['outputMode']
	
	# Check parameter validity
	if percentage_mode not in ['relative', 'absolute']:
		return http_util.Respond(
			request,
			'The output mode \"{}\" is invalid. Possible values are \"relative\" ' \
			'and \"absolute\".'.format(percentage_mode),
			'text/plain',
			code=400
		)
	
	if output_mode not in ['mapping', 'graph']:
		return http_util.Respond(
			request,
			'The output mode \"{}\" is invalid. Possible values are \"mapping\" ' \
			'and \"graph\".'.format(output_mode),
			'text/plain',
			code=400
		)
	
	response = _list_node_differences(model_name, distortions, input_image_amount,
		accumulation_method, percentage_mode, output_mode, model_manager,
		distortion_manager)
	
	return http_util.Respond(request, response, 'application/json')

def node_difference_route(request, model_manager, distortion_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'layer', 'distortion', 'inputImageAmount']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	# Extract all parameters
	model_name = request.args.get('model')
	layer = request.args.get('layer')
	distortion_name = request.args.get('distortion')
	input_image_amount = int(request.args.get('inputImageAmount'))
	
	node_difference = _get_node_difference(model_name, layer, distortion_name,
		input_image_amount, model_manager, distortion_manager);
		
	response = {
		'input': {
			'model': model_name,
			'layer': layer,
			'distortion': distortion_name,
			'inputImageAmount': input_image_amount
		},
		'activationDifference': node_difference
	}
	
	return http_util.Respond(request, response, 'application/json')

def node_difference_list_meta_route(request, model_manager, distortion_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request,
		['model', 'inputImageAmount', 'accumulationMethod', 'percentageMode']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	# Extract all parameters
	model_name = request.args.get('model')
	input_image_amount = int(request.args.get('inputImageAmount'))
	accumulation_method = request.args.get('accumulationMethod')
	percentage_mode = request.args.get('percentageMode')
	output_mode = 'mapping'
	
	# Check parameter validity
	if percentage_mode not in ['relative', 'absolute']:
		return http_util.Respond(
			request,
			'The output mode \"{}\" is invalid. Possible values are \"relative\" ' \
			'and \"absolute\".'.format(percentage_mode),
			'text/plain',
			code=400
		)
	
	# Retrieve node differences for all available distortions
	differences = []
	
	for distortion in distortion_manager.get_distortion_modules():
		differences.append(
			_list_node_differences(model_name, [distortion], input_image_amount,
				accumulation_method, percentage_mode, output_mode, model_manager,
				distortion_manager)
		)
	
	# Sum up some meta information
	value_range = {
		'minimum': math.inf,
		'maximum': -math.inf
	}
	
	# Find the value range for all distortions
	for difference in differences:
		current_range = difference['meta']['range']
		
		if current_range['minimum'] < value_range['minimum']:
			value_range['minimum'] = current_range['minimum']
		
		if current_range['maximum'] > value_range['maximum']:
			value_range['maximum'] = current_range['maximum']
	
	response = {
		'range': value_range
	}
	
	return http_util.Respond(request, response, 'application/json')

def _list_node_differences(model_name, distortions, input_image_amount,
	accumulation_method, percentage_mode, output_mode, model_manager,
	distortion_manager):
	_model = model_manager.get_model_modules()[model_name]
	low_level_nodes = _model._activation_tensors.keys()
	
	# Retrieve node activation differences of all low-level nodes for all 
	# distortion methods
	activation_differences = {}
	
	for node in low_level_nodes:
		node_activation_differences = [_get_node_difference(model_name, \
			node, distortion, input_image_amount, model_manager, distortion_manager) \
			for distortion in distortions]
		activation_differences[node] = \
			sum(node_activation_differences) / len(node_activation_differences)
	
	# Find the highest and lowest activation difference to be able to express 
	# every other one as a percentage
	minimum_activation_difference = min(activation_differences.values())
	maximum_activation_difference = max(activation_differences.values())
	
	# Build a graph from the low level nodes
	graph_activations = {'children': {}}
	
	for node in low_level_nodes:
		current_branch = graph_activations
		
		for branch in node.split('/'):
			if branch not in current_branch['children']:
				current_branch['children'][branch] = {'children': {}}
			
			current_branch = current_branch['children'][branch]
	
	# Create a simple dictionary for node path to value mappings
	node_values = {}
	
	# Recursively fill in all higher-level nodes from bottom to top
	def traverse_subgraph(root, path=''):
		sliced_path = path[1:]
		
		if len(root['children'].keys()) == 0:
			node_value = activation_differences[sliced_path]
		else:
			values = [traverse_subgraph(node, path='{}/{}'.format(path, name)) \
				for name, node in root['children'].items()]
			node_value = _accumulate_activation_difference(values, \
				accumulation_method)
		
		if len(sliced_path) > 0:
			if percentage_mode == 'relative':
				percentual_value = (node_value - minimum_activation_difference) / \
					(maximum_activation_difference -  minimum_activation_difference)
			elif percentage_mode == 'absolute':
				percentual_value = node_value / maximum_activation_difference
			
			root['path'] = sliced_path
			root['values'] = {
				'absolute': node_value,
				'percentual': percentual_value
			}
			
			node_values[sliced_path] = {
				'absolute': node_value,
				'percentual': percentual_value
			}
		
		return node_value
	
	traverse_subgraph(graph_activations)
	
	# Choose the right output depending on the output mode
	if output_mode == 'mapping':
		result = node_values
	elif output_mode == 'graph':
		result = graph_activations
	
	# Add some additional meta data
	response = {
		'meta': {
			'range': {
				'minimum': minimum_activation_difference,
				'maximum': maximum_activation_difference
			},
			'input': {
				'model': model_name,
				'distortions': distortions,
				'inputImageAmount': input_image_amount,
				'accumulationMethod': accumulation_method,
				'percentageMode': percentage_mode
			}
		},
		'data': result
	}
	
	return response

def _accumulate_activation_difference(differences, accumulation_method):
	if accumulation_method == 'minimum':
		return min(differences)
	elif accumulation_method == 'maximum':
		return max(differences)
	elif accumulation_method == 'average':
		return sum(differences) / len(differences)

data_type = 'node_difference'

def _get_node_difference(model_name, layer, distortion_name, input_image_amount,
	model_manager, distortion_manager):
	key_tuple = (model_name, layer, distortion_name, input_image_amount)
	
	if DataCache().has_data(data_type, key_tuple):
		return DataCache().get_data(data_type, key_tuple)
	else:
		_model = model_manager.get_model_modules()[model_name]
		
		# Pick random input images
		input_images = [
			_model._dataset.images[randrange(0, len(_model._dataset.images))] \
			for i in range(0, input_image_amount)
		]
		
		# Create a list that will contain all activation difference values
		activation_differences = []
		
		for input_image in input_images:
			# Calculate the activation tensor norm for the original input image
			original_meta_data = {
				'run_type': 'node_activation',
				'layer': layer,
				'image': input_image['index']
			}
			
			original_result = _model.run(original_meta_data);
			
			# Calculate the activation tensor norm for the distorted input image
			distorted_meta_data = {
				'run_type': 'node_activation',
				'layer': layer
			}
			
			distorted_meta_data['input_image_data'] = distortion_manager \
				.distortion_modules[distortion_name].distort(
					_model._dataset.load_image(input_image['index']),
					amount=1, mode='non-repeatable-randomized'
				)[0]
			
			distorted_result = _model.run(distorted_meta_data);
			
			# Calculate the tensor difference
			difference = cosine_similarity(
				[original_result.flatten()],
				[distorted_result.flatten()]
			)[0][0]
			
			# Normalize the output to be between 0 and 100
			difference = np.clip(difference, -1, 1)
			difference = (difference + 1) / 2
			difference *= 100
			
			activation_differences.append(difference)
		
		# Calculate the average of the activation differences
		result = sum(activation_differences) / (len(activation_differences) * 1.0)
		
		DataCache().set_data(data_type, key_tuple, result)
		
		return result
