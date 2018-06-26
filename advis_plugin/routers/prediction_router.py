from tensorboard.backend import http_util
from advis_plugin.util import argutil
from advis_plugin.util.cache import DataCache

from random import randrange

data_type_single_prediction = 'single_prediction'
data_type_prediction_accuracy = 'prediction_accuracy'

def _get_single_prediction(model, image_index, distortion,
	model_manager, distortion_manager, prediction_amount=5):
	key_tuple = (model, image_index, distortion)
	
	if DataCache().has_data(data_type_single_prediction, key_tuple):
		return DataCache().get_data(data_type_single_prediction, key_tuple)
	
	_model = model_manager.get_model_modules()[model]
	
	meta_data = {
		'run_type': 'prediction',
		'image': image_index
	}
	
	if distortion is not None:
		meta_data['input_image_data'] = distortion_manager \
			.distortion_modules[distortion].distort(
				_model._dataset.load_image(image_index),
				amount=1, mode='non-repeatable-randomized'
			)[0]
	
	response = _model.run(meta_data)
	
	if prediction_amount is not None:
		response['predictions'] = response['predictions'][:prediction_amount]
	
	DataCache().set_data(data_type_single_prediction, key_tuple, response)
	
	return response

def _get_accuracy_prediction(model, distortion, input_image_amount,
	model_manager, distortion_manager):
	key_tuple = (model, input_image_amount, distortion)
	
	if DataCache().has_data(data_type_prediction_accuracy, key_tuple):
		return DataCache().get_data(data_type_prediction_accuracy, key_tuple)
		
	_model = model_manager.get_model_modules()[model]
	
	# Pick random input images
	input_images = [
		_model._dataset.images[randrange(0, len(_model._dataset.images))] \
		for i in range(0, input_image_amount)
	]
	
	# Create a list that will contain all prediction results
	predictions = []
	
	# Predict accuracies for all input images and distortions
	for input_image in input_images:
		meta_data = {
			'run_type': 'prediction',
			'image': input_image['index']
		}
		
		# If a distortion has been supplied, apply it to the input image
		if distortion != None:
			meta_data['input_image_data'] = distortion_manager \
				.distortion_modules[distortion].distort(
					_model._dataset.load_image(input_image['index']),
					amount=1, mode='non-repeatable-randomized'
				)[0]
		
		predictions.append(_model.run(meta_data))
	
	# Compile some information about the input data
	input_meta_data = {
		'imageAmount': input_image_amount
	}
	
	if distortion != None:
		input_meta_data['distortion'] = distortion
	
	# Return all valuable information
	result = {
		'model': {
			'name': _model.name,
			'displayName': _model.display_name
		},
		'input': input_meta_data,
		'accuracy': _calculate_accuracy(predictions)
	}
	
	DataCache().set_data(data_type_prediction_accuracy, key_tuple, result)
	return result

def single_prediction_route(request, model_manager, distortion_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'imageIndex']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	if 'distortion' in request.args:
		distortion = request.args['distortion']
	else:
		distortion = None
	
	result = _get_single_prediction(
		request.args.get('model'),
		int(request.args.get('imageIndex')),
		distortion,
		model_manager,
		distortion_manager
	)
	
	return http_util.Respond(request, result, 'application/json')

def accuracy_prediction_route(request, model_manager, distortion_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'inputImageAmount']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	# Extract all parameters
	model_name = request.args.get('model')
	input_image_amount = int(request.args.get('inputImageAmount'))
	
	distortion_name = None
	if 'distortion' in request.args:
		distortion_name = request.args.get('distortion')
	
	response = _get_accuracy_prediction(model_name, distortion_name,
		input_image_amount, model_manager, distortion_manager)
	
	return http_util.Respond(request, response, 'application/json')

def _calculate_accuracy(predictions):
	prediction_count = float(len(predictions))
	
	top_1_hits = 0
	top_5_hits = 0
	
	# Count all instances where the right class was in the top 1 or top 5 
	# predictions
	for prediction in predictions:
		ground_truth_category = prediction['input']['categoryId']
		
		for rank, guess in enumerate(prediction['predictions']):
			if guess['categoryId'] == ground_truth_category:
				if rank == 0:
					top_1_hits += 1
				
				if rank < 5:
					top_5_hits += 1
				
				break
			
			
	
	# Calculate the accuracy as the quotient of correct guesses and the total 
	# amount of predictions
	accuracy = {
		'top1': float(top_1_hits / prediction_count),
		'top5': float(top_5_hits / prediction_count)
	}
	
	return accuracy
