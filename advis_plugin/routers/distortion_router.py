from tensorboard.backend import http_util

def distortions_route(request, distortion_manager):
	response = [{
		'name': name,
		'displayName': distortion.display_name,
		'parameters': list(distortion._parameters.keys())
	} for name, distortion in distortion_manager.get_distortion_modules().items()]
	
	return http_util.Respond(request, response, 'application/json')
	