from tensorboard.backend import http_util
from advis_plugin.util import argutil
from advis_plugin.util.visualizations import Visualizations

import numpy as np

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
	
	result = Visualizations().get_layer_visualization(
		model_manager, model_name, layer_name, image_index, distortion=distortion
	)
	
	# After the model has run, construct meta information using the tensor data
	if isinstance(result, np.ndarray):
		response = {'unitCount': result.shape[0]}
	else:
		response = {'unitCount': 0}
	
	return http_util.Respond(request, response, 'application/json')
