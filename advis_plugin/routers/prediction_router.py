from tensorboard.backend import http_util
from advis_plugin.util import argutil

from random import randrange

# Caches for prediction results
_single_prediction_cache = {}
_prediction_accuracy_cache = {}

def single_prediction_route(request, model_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'imageIndex']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	key_tuple = (request.args.get('model'), request.args.get('imageIndex'))
	
	if key_tuple in _single_prediction_cache:
		response = _single_prediction_cache[key_tuple]
	else:
		model_name = request.args.get('model')
		_model = model_manager.get_model_modules()[model_name]
		
		meta_data = {
			'run_type': 'prediction',
			'image': int(request.args.get('imageIndex'))
		}
		
		response = _model.run(meta_data)
		_single_prediction_cache[key_tuple] = response
	
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
	
	key_tuple = (model_name, input_image_amount, distortion_name)
	
	if key_tuple in _prediction_accuracy_cache:
		response = _prediction_accuracy_cache[key_tuple]
	else:
		_model = model_manager.get_model_modules()[model_name]
		
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
			if 'distortion' in request.args:
				meta_data['input_image_data'] = distortion_manager \
					.distortion_modules[request.args.get('distortion')].distort(
						_model._dataset.load_image(input_image['index']),
						amount=1, mode='non-repeatable-randomized'
					)[0]
			
			predictions.append(_model.run(meta_data))
		
		# Compile some information about the input data
		input_meta_data = {
			'imageAmount': input_image_amount
		}
		
		if 'distortion' in request.args:
			input_meta_data['distortion'] = request.args.get('distortion')
		
		# Return all valuable information
		response = {
			'model': {
				'name': _model.name,
				'displayName': _model.display_name
			},
			'input': input_meta_data,
			'accuracy': _calculate_accuracy(predictions)
		}
		_prediction_accuracy_cache[key_tuple] = response
	
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
