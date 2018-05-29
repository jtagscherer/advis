from tensorboard.backend import http_util
from advis_plugin.util import argutil, imgutil
from advis_plugin.util.visualizations import Visualizations

import numpy as np

def single_layer_image_route(request, model_manager):
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
	
	result = Visualizations().get_layer_visualization(
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
