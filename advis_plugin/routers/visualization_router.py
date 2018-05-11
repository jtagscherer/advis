from tensorboard.backend import http_util
from advis_plugin import argutil, imgutil

import numpy as np

# Data caches for faster access
_layer_visualization_cache = {}

def _get_layer_visualization(model_manager, 
	model, layer, image_index, distortion=None):
	
	key_tuple = (model, layer, image_index, distortion)
	
	if key_tuple in _layer_visualization_cache:
		return _layer_visualization_cache[key_tuple]
	
	_model = model_manager.get_model_modules()[model]
	result = None
	
	if distortion == None:
		meta_data = {
			'run_type': 'single_activation_visualization',
			'layer': layer,
			'image': image_index
		}
		
		result = _model.run(meta_data)
	else:
		meta_data = {
			'run_type': 'distorted_activation_visualization',
			'layer': layer,
			'image': image_index,
			'distortion': distortion
		}
		
		result = _model.run(meta_data)
	
	# Cache the result for later use
	_layer_visualization_cache[key_tuple] = result
	
	return result

def layer_meta_route(request, model_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'layer', 'imageIndex']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	# Now that we are sure all necessary arguments are available, extract them 
	# from the request
	model_name = request.args.get('model')
	layer_name = request.args.get('layer')
	image_index = int(request.args.get('imageIndex'))
	
	# If a distortion should be applied, extract its name
	if 'distortion' in request.args:
		distortion_name = request.args.get('distortion')
		
		if 'imageAmount' not in request.args:
			return http_util.Respond(
				request,
				'In order to retrieve an activation visualization of distorted '
				+ 'images you have to specify the amount of distorted images to '
				+ 'create using the \"imageAmount\" parameter.',
				'text/plain',
				code=400
			)
		else:
			distorted_image_amount = int(request.args.get('imageAmount'))
			distortion = (distortion_name, distorted_image_amount)
	else:
		distortion = None
	
	result = _get_layer_visualization(
		model_manager, model_name, layer_name, image_index, distortion=distortion
	)
	
	# After the model has run, construct meta information using the tensor data
	if isinstance(result, np.ndarray):
		response = {'unitCount': result.shape[0]}
	else:
		response = {'unitCount': 0}
	
	return http_util.Respond(request, response, 'application/json')

def layer_image_route(request, model_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'layer', 'unitIndex', 'imageIndex']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	# Now that we are sure all necessary arguments are available, extract them 
	# from the request
	model_name = request.args.get('model')
	layer_name = request.args.get('layer')
	unit_index = int(request.args.get('unitIndex'))
	image_index = int(request.args.get('imageIndex'))
	
	# If a distortion should be applied, extract its name
	if 'distortion' in request.args:
		distortion_name = request.args.get('distortion')
		
		if 'imageAmount' not in request.args:
			return http_util.Respond(
				request,
				'In order to retrieve an activation visualization of distorted '
				+ 'images you have to specify the amount of distorted images to '
				+ 'create using the \"imageAmount\" parameter.',
				'text/plain',
				code=400
			)
		else:
			distorted_image_amount = int(request.args.get('imageAmount'))
			distortion = (distortion_name, distorted_image_amount)
	else:
		distortion = None
	
	result = _get_layer_visualization(
		model_manager, model_name, layer_name, image_index, distortion=distortion
	)
	
	# Check the index value for validity
	if isinstance(result, np.ndarray) and unit_index >= 0 and \
		unit_index < len(result):
		# Fetch the image summary tensor corresponding to the request's values
		response = result[unit_index]
	else:
		# Something has gone wrong, return a placeholder
		response = imgutil.get_placeholder_image()
	
	# Return the image data with proper headers set
	return http_util.Respond(request, response, 'image/png')
