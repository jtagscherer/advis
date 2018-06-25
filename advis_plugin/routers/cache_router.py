import time
import tensorflow as tf
from tensorboard.backend import http_util

from advis_plugin.util import argutil
from advis_plugin.util.cache import DataCache

def cache_route(request, routers, managers):
	missing_arguments = argutil.check_missing_arguments(
		request, ['modelAccuracy', 'nodeActivation']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	model_accuracy = int(request.args.get('modelAccuracy'))
	node_activation = int(request.args.get('nodeActivation'))
	
	# Disable immediate caching
	DataCache().disable_caching()
	
	start_time = time.time()
	
	# Cache all graph structures
	tf.logging.warn('Caching graph structures...')
	_cache_graph_structures(routers, managers)
	DataCache().persist_cache()
	
	# Cache all single predictions
	tf.logging.warn('Caching single predictions...')
	_cache_single_predictions(routers, managers)
	DataCache().persist_cache()
	
	# Cache all prediction accuracies
	tf.logging.warn('Caching prediction accuracies...')
	_cache_prediction_accuracy(routers, managers, model_accuracy)
	DataCache().persist_cache()
	
	# Cache all node differences
	tf.logging.warn('Caching node differences...')
	_cache_node_differences(routers, managers, node_activation)
	DataCache().persist_cache()
	
	# Cache all node differences
	tf.logging.warn('Caching confusion matrices...')
	_cache_confusion_matrices(routers, managers)
	DataCache().persist_cache()
	
	# Re-enable caching
	DataCache().enable_caching()
	
	tf.logging.warn('Caching completed!')
	end_time = time.time()
	
	return http_util.Respond(
		request,
		'Caching completed. Time taken: {} s.' \
			.format(int(round(end_time - start_time))),
		'text/plain'
	)

def _cache_graph_structures(routers, managers):
	model_router = routers['model']
	model_manager = managers['model']
	
	model_amount = len(model_manager.get_model_modules())
	current_model_index = 0
	
	for model in model_manager.get_model_modules():
		model_router._get_graph_structure(model_manager, model, 'full')
		model_router._get_graph_structure(model_manager, model, 'simplified')
		
		current_model_index += 1
		_print_progress('(1/5)', current_model_index, model_amount)

def _cache_single_predictions(routers, managers):
	prediction_router = routers['prediction']
	model_manager = managers['model']
	distortion_manager = managers['distortion']
	model_modules = model_manager.get_model_modules()
	
	image_amount = 0
	for model in model_modules:
		image_amount += len(model_modules[model]._dataset.images)
	
	current_image_index = 0
	
	for model in model_modules:
		_model = model_modules[model]
		
		for image_index in range(0, len(_model._dataset.images)):
			prediction_router._get_single_prediction(
				model, image_index, None, model_manager, distortion_manager
			)
			
			for distortion in distortion_manager.get_distortion_modules():
				prediction_router._get_single_prediction(
					model, image_index, distortion, model_manager, distortion_manager
				)
		
			current_image_index += 1
			_print_progress('(2/5)', current_image_index, image_amount)

def _cache_prediction_accuracy(routers, managers, input_image_amount):
	prediction_router = routers['prediction']
	model_manager = managers['model']
	distortion_manager = managers['distortion']
	model_modules = model_manager.get_model_modules()
	
	step_amount = len(model_modules) \
		* len(distortion_manager.get_distortion_modules())
	current_step_index = 0
	
	for model in model_modules:
		_model = model_modules[model]
		
		for distortion in distortion_manager.get_distortion_modules():
			prediction_router._get_accuracy_prediction(
				model, distortion, input_image_amount, model_manager, distortion_manager
			)
		
			current_step_index += 1
			_print_progress('(3/5)', current_step_index, step_amount)

def _cache_node_differences(routers, managers, input_image_amount):
	node_difference_router = routers['nodeDifference']
	model_manager = managers['model']
	distortion_manager = managers['distortion']
	model_modules = model_manager.get_model_modules()
	
	step_amount = 0
	for model in model_modules:
		step_amount += len(model_modules[model]._activation_tensors)
	
	current_step_index = 0
	
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
			
			DataCache().persist_cache()
			current_step_index += 1
			layer_index += 1
			_print_progress('(4/5)', current_step_index, step_amount,
				'{}, Layer {} out of {}'.format(model_display_name, layer_index,
				layer_amount))

def _cache_confusion_matrices(routers, managers):
	confusion_matrix_router = routers['confusionMatrix']
	model_manager = managers['model']
	distortion_manager = managers['distortion']
	
	model_modules = model_manager.get_model_modules()
	distortion_modules = distortion_manager.get_distortion_modules()
	
	step_amount = len(model_modules) \
		* len(distortion_manager.get_distortion_modules())
	current_step_index = 0
	
	for model in model_modules:
		_model = model_modules[model]
		
		for distortion in distortion_modules:
			_distortion = distortion_modules[distortion]
			
			confusion_matrix_router._get_hierarchical_node_predictions(
				_model, _distortion, model_manager, distortion_manager
			)
		
			current_step_index += 1
			_print_progress('(5/5)', current_step_index, step_amount)

def _print_progress(prefix, current, length, suffix=None):
	progress_string = '{}: {}%'.format(prefix,
		int(round((current / length) * 100)))
	
	if suffix is not None:
		progress_string += ' ({})'.format(suffix)
	
	tf.logging.warn(progress_string)
