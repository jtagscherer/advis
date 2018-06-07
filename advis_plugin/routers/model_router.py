from tensorboard.backend import http_util
from advis_plugin.util import argutil
from advis_plugin.util.cache import DataCache

data_type = 'graph_structure'

def _get_graph_structure(model_manager, model, mode):
	key_tuple = (model, mode)
	
	if DataCache().has_data(data_type, key_tuple):
		return DataCache().get_data(data_type, key_tuple)
	
	_model = model_manager.get_model_modules()[model]
	
	if mode == 'full':
		result = _model.full_graph_structure
	elif mode == 'simplified':
		result = _model.simplified_graph_structure
	
	DataCache().set_data(data_type, key_tuple, result)
	
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
		request, ['model', 'mode']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	model_name = request.args.get('model')
	mode = request.args.get('mode')
	
	if mode not in ['full', 'simplified']:
		return http_util.Respond(
			request,
			'The requested graph route must be either \"full\" or \"simplified\", ' \
			 + ' but was \"{}\".'.format(mode),
			'text/plain',
			code=400
		)
	
	result = _get_graph_structure(model_manager, model_name, mode)
	
	response = {'graph': result}
	
	return http_util.Respond(request, response, 'application/json')
