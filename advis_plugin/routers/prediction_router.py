from tensorboard.backend import http_util
from advis_plugin.util import argutil
from advis_plugin.util.cache import DataCache

from random import randrange
import copy

import warnings
import numpy as np
from sklearn.metrics import f1_score, precision_score, recall_score

data_type_single_prediction = 'single_prediction'
data_type_prediction_accuracy = 'prediction_accuracy'

import tensorflow as tf

def _get_single_prediction(model, image_index, distortion, distortion_index,
	distortion_amount, model_manager, distortion_manager, prediction_amount=5,
	only_category=None, cache_data=True):
	if type(distortion_index).__module__ == np.__name__:
		original_distortion_index = distortion_index.item()
	else:
		original_distortion_index = distortion_index
	
	if distortion is not None:
		_distortion = distortion_manager.distortion_modules[distortion]
	
		# If the chosen distortion introduces no actual random changes because it 
		# has no parameters that can be randomly configured, we can simply use the 
		# first distortion index.
		if _distortion.is_invariant():
			distortion_index = 0
	
	key_tuple = (model, image_index, distortion, distortion_index, \
		distortion_amount)
	
	if DataCache().has_data(data_type_single_prediction, key_tuple):
		response = DataCache().get_data(data_type_single_prediction, key_tuple)
	else:
		_model = model_manager.get_model_modules()[model]
		
		meta_data = {
			'run_type': 'prediction',
			'image': image_index
		}
		
		configuration = None
		
		if distortion is not None:
			if distortion_amount is not None:
				meta_data['input_image_data'], configuration = _distortion.distort(
					_model._dataset.load_image(image_index),
					amount=distortion_amount, distortion_index=distortion_index,
					mode='single-sequential'
				)
			else:
				meta_data['input_image_data'], configuration = _distortion.distort(
					_model._dataset.load_image(image_index),
					amount=1, distortion_index=0,
					mode='single-randomized'
				)
		
		response = _model.run(meta_data)
		
		if distortion is not None and configuration is not None:
			# Enrich the configuration with further parameter information
			_configuration = []
			for configuration_key, configuration_value in configuration.items():
				for parameter_name, parameter in _distortion._parameters.items():
					if configuration_key == parameter_name:
						_configuration.append({
							'name': configuration_key,
							'displayName': parameter.display_name,
							'type': parameter.type.name.lower(),
							'value': configuration_value
						})
			
			# Append information about the configuration to the response
			response['input']['distortion'] = {
				'name': distortion,
				'configuration': _configuration
			}
			
			if original_distortion_index is not None \
				and distortion_amount is not None:
				response['input']['distortion']['distortionIndex'] \
					= original_distortion_index
				response['input']['distortion']['distortionAmount'] = distortion_amount
		
		if cache_data:
			DataCache().set_data(data_type_single_prediction, key_tuple, response)
	
	# Copy the response to avoid corrupting the cache
	_response = copy.deepcopy(response)
	
	# Remove all categories other than a single one if so desired
	if only_category is not None:
		single_prediction = None
		for prediction in _response['predictions']:
			if prediction['categoryId'] == only_category:
				single_prediction = prediction
				break
		_response['predictions'] = [single_prediction]
	
	# Limit the amount of predictions if so desired
	if prediction_amount is not None:
		_response['predictions'] = _response['predictions'][:prediction_amount]
	
	return _response

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
		'accuracy': _calculate_accuracy(predictions),
		'metrics': _calculate_metrics(predictions)
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
	
	if 'distortionAmount' in request.args:
		distortion_amount = int(request.args['distortionAmount'])
	else:
		distortion_amount = None
	
	if 'distortionIndex' in request.args:
		distortion_index = int(request.args['distortionIndex'])
	else:
		distortion_index = 0
	
	if distortion_amount is not None:
		distortion_index = np.clip(distortion_index, 0, distortion_amount)
	
	if 'predictionAmount' in request.args:
		prediction_amount = int(request.args['predictionAmount'])
	else:
		prediction_amount = 5
	if prediction_amount == -1:
		prediction_amount = None
	
	if 'onlyCategory' in request.args:
		only_category = int(request.args['onlyCategory'])
	else:
		only_category = None
	
	result = _get_single_prediction(
		request.args.get('model'),
		int(request.args.get('imageIndex')),
		distortion,
		distortion_index,
		distortion_amount,
		model_manager,
		distortion_manager,
		prediction_amount=prediction_amount,
		only_category=only_category
	)
	
	return http_util.Respond(request, result, 'application/json')

def average_prediction_route(request, model_manager, distortion_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'imageIndex', 'distortion', 'distortionAmount']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	model_name = request.args.get('model')
	input_image_index = int(request.args.get('imageIndex'))
	distortion_name = request.args.get('distortion')
	distortion_amount = int(request.args.get('distortionAmount'))
	
	# Retrieve predictions for all distorted images
	predictions = []
	
	for distortion_index in range(0, distortion_amount):
		predictions.append(_get_single_prediction(
			model_name, input_image_index, distortion_name, distortion_index,
			distortion_amount, model_manager, distortion_manager,
			prediction_amount=None, cache_data=False
		))
	
	# Collect all single predictions
	category_certainties = {}
	
	for prediction in predictions:
		for category in prediction['predictions']:
			category_id = int(category['categoryId'])
			
			if category_id not in category_certainties:
				category_certainties[category_id] = {
					'certainty': category['certainty'],
					'valueAmount': 1,
					'categoryName': category['categoryName']
				}
			else:
				certainty = category_certainties[category_id]
				certainty['certainty'] += category['certainty']
				certainty['valueAmount'] += 1
	
	# Compile the list of certainties back into a prediction list by averaging them
	average_predictions = []
	
	for category_id, certainty in category_certainties.items():
		average_predictions.append({
			'categoryId': category_id,
			'categoryName': certainty['categoryName'],
			'certainty': certainty['certainty'] / float(certainty['valueAmount'])
		})
	
	# Order the average predictions by certainty
	average_predictions = sorted(
		average_predictions,
		key=lambda category: category['certainty'],
		reverse=True
	)
	
	input_information = predictions[0]['input']
	input_information['distortionAmount'] = distortion_amount
	
	response = {
		'input': input_information,
		'predictions': average_predictions
	}
	
	return http_util.Respond(request, response, 'application/json')

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
			
			if rank > 5:
				continue
	
	# Calculate the accuracy as the quotient of correct guesses and the total 
	# amount of predictions
	accuracy = {
		'top1': float(top_1_hits / prediction_count),
		'top5': float(top_5_hits / prediction_count)
	}
	
	return accuracy

def _calculate_metrics(predictions):
	# Bring ground truth labels and predictions into the right form
	sample_labels = np.zeros(len(predictions))
	sample_predictions = np.zeros(len(predictions))
	
	for prediction_index, prediction in enumerate(predictions):
		sample_labels[prediction_index] = prediction['input']['categoryId']
		sample_predictions[prediction_index] \
			= prediction['predictions'][0]['categoryId']
	
	f1 = precision = recall = 0.0
	
	with warnings.catch_warnings():
		# Finally, calculate the F1 score
		warnings.simplefilter('ignore')
		
		f1 = f1_score(sample_labels, sample_predictions, average='weighted')
		precision = precision_score(sample_labels, sample_predictions,
			average='weighted')
		recall = recall_score(sample_labels, sample_predictions, average='weighted')
		
	return {
		'f1': f1,
		'precision': precision,
		'recall': recall
	}
	