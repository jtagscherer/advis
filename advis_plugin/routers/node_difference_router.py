from tensorboard.backend import http_util
from advis_plugin.util import argutil

from random import randrange
import numpy as np

# Caches for computation results
_node_difference_cache = {}

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
	
	key_tuple = (model_name, layer, distortion_name, input_image_amount)
	
	if key_tuple in _node_difference_cache:
		response = _node_difference_cache[key_tuple]
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
				.distortion_modules[request.args.get('distortion')].distort(
					_model._dataset.load_image(input_image['index']),
					amount=1, mode='non-repeatable-randomized'
				)[0]
			
			distorted_result = _model.run(distorted_meta_data);
			
			# Calculate the tensor difference
			difference = np.linalg.norm(original_result - distorted_result)
			
			activation_differences.append(difference)
		
		# Calculate the average of the activation differences
		average_activation_difference = \
			sum(activation_differences) / (len(activation_differences) * 1.0)
		
		response = {
			'input': {
				'model': model_name,
				'layer': layer,
				'distortion': distortion_name,
				'inputImageAmount': input_image_amount
			},
			'activationDifference': average_activation_difference
		}
		
		_node_difference_cache[key_tuple] = response
	
	return http_util.Respond(request, response, 'application/json')
