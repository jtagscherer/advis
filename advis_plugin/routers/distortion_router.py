from tensorboard.backend import http_util
from advis_plugin.util import argutil
from advis_plugin.util.cache import DataCache

from PIL import Image
from io import BytesIO
import numpy as np
import json

def distortions_route(request, distortion_manager):
	distortions = []
	
	for name, distortion in distortion_manager.get_distortion_modules().items():
		parameters = [{
			'name': parameter.name,
			'displayName': parameter.display_name,
			'type': parameter.type.name.lower(),
			'constraints': parameter.constraints,
			'options': parameter.options,
			'value': parameter._value
		} for name, parameter in distortion._parameters.items()]
		
		distortions.append({
			'name': name,
			'displayName': distortion.display_name,
			'type': distortion.type,
			'parameters': parameters,
			'icon': distortion.icon
		})
	
	return http_util.Respond(request, distortions, 'application/json')

def distortions_single_route(request, distortion_manager, dataset_manager):
	missing_arguments = argutil.check_missing_arguments(
		request, ['distortion', 'dataset', 'imageIndex']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	distortion = request.args.get('distortion')
	dataset = request.args.get('dataset')
	image_index = int(request.args.get('imageIndex'))
	
	if 'distortionIndex' in request.args:
		distortion_index = int(request.args.get('distortionIndex'))
	else:
		distortion_index = 0
	
	if 'parameters' in request.args:
		parameters = request.args.get('parameters')
	else:
		parameters = None
	
	# If a distortion amount is supplied, we will use the sequential 
	# interpolation mode
	distortion_amount = None
	if 'distortionAmount' in request.args:
		distortion_amount = int(request.args['distortionAmount'])
		distortion_index = np.clip(distortion_index, 0, distortion_amount)
	
	# Retrieve the input image
	_dataset = dataset_manager.get_dataset_modules()[dataset]
	input_image = _dataset.load_image(image_index, output='array')
	
	# Distort the image
	_distortion = distortion_manager.get_distortion_modules()[distortion]
	
	if distortion_amount is not None:
		distorted_image, _ = _distortion.distort(
			input_image,
			amount=distortion_amount, mode='single-sequential',
			distortion_index=distortion_index, custom_parameters=parameters
		)
	else:
		distorted_image, _ = _distortion.distort(
			input_image,
			amount=(distortion_index + 1), mode='single-randomized',
			custom_parameters=parameters, distortion_index=distortion_index
		)
	
	# Output the distorted image as a byte array
	image = Image.fromarray((distorted_image * 255).astype('uint8'), 'RGB')
	
	with BytesIO() as byte_array:
		image.save(byte_array, 'PNG')
		response = byte_array.getvalue()
	
	return http_util.Respond(request, response, 'image/png')

def distortions_update_route(request, distortion_manager):
	missing_arguments = argutil.check_missing_arguments(
		request, ['distortions']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	_distortions = request.args.get('distortions')
	distortions = json.loads(_distortions)
	
	for distortion in distortions:
		_distortion = distortion_manager \
			.get_distortion_modules()[distortion['name']]
		
		# Update all parameter values
		for parameter in distortion['parameters']:
			_distortion.set_parameter_value(parameter['name'], parameter['value'])
		
		# Remove old invalid cache data
		def fourth_distortion(key): return key[3] == distortion['name']
		def third_distortion(key): return key[2] == distortion['name']
		
		DataCache().remove_cached_data('composite_visualization_meta',
			fourth_distortion)
		DataCache().remove_cached_data('composite_visualization_composition',
			fourth_distortion)
		DataCache().remove_cached_data('layer_visualization', fourth_distortion)
		DataCache().remove_cached_data('node_difference', third_distortion)
		DataCache().remove_cached_data('single_prediction', third_distortion)
		DataCache().remove_cached_data('prediction_accuracy', third_distortion)
	
	return http_util.Respond(request, [], 'application/json')
	