from tensorboard.backend import http_util
from advis_plugin import argutil

def single_prediction_route(request, model_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'imageIndex']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	model_name = request.args.get('model')
	_model = model_manager.get_model_modules()[model_name]
	
	meta_data = {
		'run_type': 'prediction',
		'image': int(request.args.get('imageIndex'))
	}
	
	response = _model.run(meta_data)
	
	return http_util.Respond(request, response, 'application/json')
