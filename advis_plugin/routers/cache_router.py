import time
import tensorflow as tf
from tensorboard.backend import http_util

from advis_plugin.util import argutil
from advis_plugin.util.cache import DataCache

_progress = {
	'status': 'Idle',
	'progress': 0,
	'total': 0
}

_verbose = False

def cache_progress_route(request):
	global _progress
	
	if _progress['total'] > 0:
		percentage = int(round((_progress['progress']	/ _progress['total']) * 100))
	else:
		percentage = 100
	
	response = {
		'status': _progress['status'],
		'progress': {
			'current': _progress['progress'],
			'total': _progress['total'],
			'percentage': percentage
		}
	}
	
	return http_util.Respond(request, response, 'application/json')

def cache_route(request, routers, managers):
	missing_arguments = argutil.check_missing_arguments(
		request, ['modelAccuracy', 'nodeActivation']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	model_accuracy = int(request.args.get('modelAccuracy'))
	node_activation = int(request.args.get('nodeActivation'))
	
	global _verbose
	if 'verbose' in request.args:
		_verbose = request.args['verbose']
	else:
		_verbose = False
	
	# Disable immediate caching
	DataCache().disable_caching()
	
	start_time = time.time()
	_start_progress(_get_total_steps(managers))
	
	# Cache all graph structures
	_cache_graph_structures(routers, managers)
	DataCache().persist_cache()
	
	# Cache all single predictions
	_cache_single_predictions(routers, managers)
	DataCache().persist_cache()
	
	# Cache all prediction accuracies
	_cache_prediction_accuracy(routers, managers, model_accuracy)
	DataCache().persist_cache()
	
	# Cache all node differences
	_cache_node_differences(routers, managers, node_activation)
	DataCache().persist_cache()
	
	# Cache all node differences
	_cache_confusion_matrices(routers, managers)
	DataCache().persist_cache()
	
	# Re-enable caching
	DataCache().enable_caching()
	
	if _verbose:
		tf.logging.warn('Caching completed!')
	
	end_time = time.time()
	_stop_progress()
	
	response = {
		'runtime': int(round(end_time - start_time))
	}
	
	return http_util.Respond(request, response, 'application/json')

def _cache_graph_structures(routers, managers):
	model_router = routers['model']
	model_manager = managers['model']
	
	for model in model_manager.get_model_modules():
		model_router._get_graph_structure(model_manager, model, 'full')
		model_router._get_graph_structure(model_manager, model, 'simplified')
		
		_update_progress('Caching graph structures…')

def _cache_single_predictions(routers, managers):
	prediction_router = routers['prediction']
	model_manager = managers['model']
	distortion_manager = managers['distortion']
	model_modules = model_manager.get_model_modules()
	
	for model in model_modules:
		_model = model_modules[model]
		
		for image_index in range(0, len(_model._dataset.images)):
			prediction_router._get_single_prediction(
				model, image_index, None, None, None, model_manager, \
				distortion_manager, prediction_amount=None
			)
			
			for distortion in distortion_manager.get_distortion_modules():
				prediction_router._get_single_prediction(
					model, image_index, distortion, None, None, model_manager, \
					distortion_manager, prediction_amount=None
				)
			
			_update_progress('Caching single predictions…')

def _cache_prediction_accuracy(routers, managers, input_image_amount):
	prediction_router = routers['prediction']
	model_manager = managers['model']
	distortion_manager = managers['distortion']
	model_modules = model_manager.get_model_modules()
	
	for model in model_modules:
		_model = model_modules[model]
		
		prediction_router._get_accuracy_prediction(
			model, None, input_image_amount, model_manager, distortion_manager
		)
		
		for distortion in distortion_manager.get_distortion_modules():
			prediction_router._get_accuracy_prediction(
				model, distortion, input_image_amount, model_manager, distortion_manager
			)
			
			_update_progress('Caching prediction accuracies…')

def _cache_node_differences(routers, managers, input_image_amount):
	node_difference_router = routers['nodeDifference']
	model_manager = managers['model']
	distortion_manager = managers['distortion']
	model_modules = model_manager.get_model_modules()
	
	for model in model_modules:
		_model = model_modules[model]
		model_display_name = _model.display_name
		
		layer_index = 0
		layer_amount = len(_model._activation_tensors)
		
		for layer in _model._activation_tensors:
			for distortion in distortion_manager.get_distortion_modules():
				node_difference_router._get_node_difference(
					model, layer, distortion, input_image_amount, model_manager,
					distortion_manager
				)
			
			layer_index += 1
			
			_update_progress('Caching node differences: ' \
				'Model \"{}\", Layer {} out of {}…'.format(model_display_name,
				layer_index, layer_amount))
		
		DataCache().persist_cache()

def _cache_confusion_matrices(routers, managers):
	confusion_matrix_router = routers['confusionMatrix']
	model_manager = managers['model']
	distortion_manager = managers['distortion']
	
	model_modules = model_manager.get_model_modules()
	distortion_modules = distortion_manager.get_distortion_modules()
	
	for model in model_modules:
		_model = model_modules[model]
		
		for distortion in distortion_modules:
			_distortion = distortion_modules[distortion]
			
			confusion_matrix_router._get_hierarchical_node_predictions(
				_model, _distortion, model_manager, distortion_manager
			)
			
			for sort_by in ['ascending', 'descending', 'index']:
				for input_mode in ['original', 'distorted']:
					confusion_matrix_router._get_listed_node_predictions(
						model, distortion, model_manager, distortion_manager,
						sort_by, input_mode
					)
			
			_update_progress('Caching confusion matrices…')

def _get_total_steps(managers):
	model_manager = managers['model']
	distortion_manager = managers['distortion']
	model_modules = model_manager.get_model_modules()
	distortion_modules = distortion_manager.get_distortion_modules()
	
	total_steps = 0
	
	# Add steps for caching graph structures
	total_steps += len(model_modules)
	
	# Add steps for caching single predictions
	for model in model_modules:
		total_steps += len(model_modules[model]._dataset.images)
	
	# Add steps for caching prediction accuracies
	total_steps += len(model_modules)	* len(distortion_modules)
	
	# Add steps for caching node differences
	for model in model_modules:
		total_steps += len(model_modules[model]._activation_tensors)
	
	# Add steps for caching confusion matrices
	total_steps += len(model_modules) * len(distortion_modules)
	
	return total_steps

def _start_progress(total):
	global _progress
	_progress = {
		'status': 'Working',
		'progress': 0,
		'total': total
	}

def _stop_progress():
	global _progress
	_progress = {
		'status': 'Idle',
		'progress': 0,
		'total': 0
	}

def _update_progress(status, verbose=False):
	global _progress
	global _verbose
	
	_progress['status'] = status
	_progress['progress'] += 1
	
	if _verbose:
		progress_string = '{}%: {}'.format(int(round((_progress['progress'] \
			/ _progress['total']) * 100)), _progress['status'])
		tf.logging.warn(progress_string)
