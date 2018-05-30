from tensorboard.backend import http_util
from advis_plugin.util import argutil

# Data caches for faster access
_graph_structure_cache = {}

def _get_graph_structure(model, model_manager):
	if model in _graph_structure_cache:
		return _graph_structure_cache[model]
	
	_model = model_manager.get_model_modules()[model]
	result = _model.graph_structure
	
	_graph_structure_cache[model] = result
	return result

def models_route(request, model_manager):
	response = []
	
	for name, model in model_manager.get_model_modules().items():
		response.append({
			'name': name,
			'displayName': model.display_name,
			'dataset': model._dataset.name,
			'version': model.version
		})
	
	return http_util.Respond(request, response, 'application/json')

def graphs_route(request, model_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	model_name = request.args.get('model')
	
	result = _get_graph_structure(model_name, model_manager)
	
	response = {'graph': result}
	
	return http_util.Respond(request, response, 'application/json')
