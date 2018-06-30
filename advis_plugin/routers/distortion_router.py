from tensorboard.backend import http_util
from advis_plugin.util import argutil

from PIL import Image
from io import BytesIO

def distortions_route(request, distortion_manager):
	if 'distortion' in request.args:
		distortion_name = request.args.get('distortion')
		distortion = distortion_manager.get_distortion_modules()[distortion_name]
		
		parameters = [{
			'name': parameter.name,
			'displayName': parameter.display_name,
			'type': parameter.type.name.lower(),
			'constraints': parameter.constraints,
			'options': parameter.options,
			'value': parameter._value
		} for name, parameter in distortion._parameters.items()]
		
		response = {
			'name': distortion.name,
			'displayName': distortion.display_name,
			'type': distortion.type,
			'parameters': parameters
		}
	else:
		response = [{
			'name': name,
			'displayName': distortion.display_name,
			'type': distortion.type,
			'parameters': list(distortion._parameters.keys()),
			'icon': distortion.icon
		} for name, distortion in distortion_manager \
			.get_distortion_modules().items()]
	
	return http_util.Respond(request, response, 'application/json')

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
	
	# Retrieve the input image
	_dataset = dataset_manager.get_dataset_modules()[dataset]
	input_image = _dataset.load_image(image_index, output='array')
	
	# Distort the image
	_distortion = distortion_manager.get_distortion_modules()[distortion]
	distorted_image = _distortion.distort(
		input_image,
		amount=(distortion_index + 1), mode='randomized'
	)[distortion_index]
	
	# Output the distorted image as a byte array
	image = Image.fromarray((distorted_image * 255).astype('uint8'), 'RGB')
	
	with BytesIO() as byte_array:
		image.save(byte_array, 'PNG')
		response = byte_array.getvalue()
	
	return http_util.Respond(request, response, 'image/png')
	