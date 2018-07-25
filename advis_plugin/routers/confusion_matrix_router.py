from tensorboard.backend import http_util
from advis_plugin.util import argutil
from advis_plugin.util.cache import DataCache
from advis_plugin.routers import prediction_router

import math
import copy

def _get_images_of_category(dataset, category_id):
	images = []
	
	for image in dataset.images:
		if image['categoryId'] == category_id + 1:
			images.append(image)
	
	return images

def _predict_image(model, image, distortion, model_manager, distortion_manager,
	prediction_dictionary):
	if distortion is not None:
		_distortion = distortion.name
	else:
		_distortion = None
	
	prediction = prediction_router._get_single_prediction(
		model.name, image['index'], _distortion, None, None, model_manager,
		distortion_manager
	)['predictions'][0]
	
	prediction_key = str(prediction['categoryId'])
	
	if prediction_key in prediction_dictionary:
		prediction_dictionary[prediction_key] += 1
	else:
		prediction_dictionary[prediction_key] = 1

def _find_node_by_category(root, category_id, result=None):
	if 'category' in root and int(root['category']) == int(category_id):
		result = root
	else:
		if 'children' in root and root['children'] is not None:
			for child in root['children']:
				result = _find_node_by_category(child, category_id, result=result)
	
	return result

def _find_all_leaves(root, result=[]):
	stack = [root]
	leaves = []
	
	while stack:
		node = stack.pop()
		
		if 'category' in node:
			leaves.append(node)
		
		if 'children' in node and node['children'] is not None:
			for child in node['children']:
				stack.append(child)
	
	return leaves

def _find_node_by_name(root, name, result=None):
	if 'name' in root and root['name'] == name:
		result = root
	else:
		if 'children' in root and root['children'] is not None:
			for child in root['children']:
				result = _find_node_by_name(child, name, result=result)
	
	return result

hierarchical_data_type = 'hierarchical_node_predictions'

def _get_hierarchical_node_predictions(model, distortion, model_manager,
	distortion_manager):
	key_tuple = (model.name, distortion.name)
	
	if DataCache().has_data(hierarchical_data_type, key_tuple):
		return DataCache().get_data(hierarchical_data_type, key_tuple)
	
	dataset = model._dataset
	category_hierarchy = dataset.category_hierarchy.copy()
	
	for category_index, category_name in enumerate(dataset.categories):
		original_predictions = {}
		distorted_predictions = {}
		
		images = _get_images_of_category(dataset, category_index)
		
		for image in images:
			_predict_image(
				model, image, None, model_manager, distortion_manager,
				original_predictions
			)
			
			_predict_image(
				model, image, distortion, model_manager, distortion_manager,
				distorted_predictions
			)
		
		category_node = _find_node_by_category(
			category_hierarchy[0], category_index
		)
		
		if category_node is None:
			raise Exception('The category with ID \"{}\" and name \"{}\" does not ' \
				'have a node in the hierarchy.'.format(category_index, category_name))
		
		category_node['predictions'] = {
			'original': original_predictions,
			'distorted': distorted_predictions
		}
	
	DataCache().set_data(hierarchical_data_type, key_tuple, category_hierarchy)
	
	return category_hierarchy

def _find_position_in_hierarchical_list(hierarchical_list, categoryIndex):
	for item_index, item in enumerate(hierarchical_list):
		if item['category'] == categoryIndex:
			return item_index
	
	return 0

listed_data_type = 'listed_node_predictions'

def _get_listed_node_predictions(model_name, distortion_name, model_manager,
	distortion_manager, sort_by, input_mode):
	# `sort_by` can be either, ascending, descending or index
	# `input_mode` can be either original or distorted
	
	key_tuple = (model_name, distortion_name, sort_by, input_mode)
	
	if DataCache().has_data(listed_data_type, key_tuple):
		return DataCache().get_data(listed_data_type, key_tuple)
	
	model = model_manager.get_model_modules()[model_name]
	dataset = model._dataset
	
	hierarchical_list = _find_all_leaves(dataset.category_hierarchy[0])[::-1]
	
	images = copy.deepcopy(dataset.images)
	
	# Add prediction certainties to each image
	for image in images:
		# Make the model predict the input image
		original_predictions = prediction_router._get_single_prediction(
			model_name, int(image['index']), None, None, None, model_manager,
			distortion_manager, prediction_amount=None
		)		
		distorted_predictions = prediction_router._get_single_prediction(
			model_name, int(image['index']), distortion_name, None, None,
			model_manager, distortion_manager, prediction_amount=None
		)
		
		image['hierarchicalCategoryId'] = _find_position_in_hierarchical_list(
			hierarchical_list, image['categoryId']
		)
		
		# Append predicted image categories to the image
		if (input_mode == 'original'):
			image['prediction'] = {
				'list': original_predictions['predictions'][0]['categoryId'],
				'hierarchical': _find_position_in_hierarchical_list(hierarchical_list,
					original_predictions['predictions'][0]['categoryId'])
			}
		elif (input_mode == 'distorted'):
			image['prediction'] = {
				'list': distorted_predictions['predictions'][0]['categoryId'],
				'hierarchical': _find_position_in_hierarchical_list(hierarchical_list,
					distorted_predictions['predictions'][0]['categoryId'])
			}
		
		# Retrieve the certainty of the ground-truth category from the predictions
		original_certainty = _get_prediction_certainty(
			original_predictions['predictions'], int(image['categoryId'])
		)
		distorted_certainty = _get_prediction_certainty(
			distorted_predictions['predictions'], int(image['categoryId'])
		)
		
		# Add the data to each image
		certainty = {}
		certainty['original'] = original_certainty
		certainty['distorted'] = distorted_certainty
		certainty['difference'] = distorted_certainty - original_certainty
		
		image['certainty'] = certainty
	
	# Finally, sort the list of images
	if sort_by == 'ascending':
		images = sorted(
			images, key=lambda image: image['certainty']['difference']
		)
	elif sort_by == 'descending':
		images = sorted(
			images, key=lambda image: image['certainty']['difference'],
			reverse=True
		)
	elif sort_by == 'index':
		images = sorted(
			images, key=lambda image: image['index']
		)
	
	DataCache().set_data(listed_data_type, key_tuple, images)
	
	return images

def _get_node_path_by_category(root, category_id):
	if not root:
		return []
	if 'category' in root and int(root['category']) == int(category_id):
		return [root['name']]
	
	if root['children'] is not None:
		for child in root['children']:
			result = _get_node_path_by_category(child, category_id)
			
			if result:
				return [root['name']] + result

def _category_is_a(hierarchy, category_id, superset):
	try:
		path = _get_node_path_by_category(hierarchy[0], category_id)
		return superset in path
	except:
		return False

def _get_empty_matrix(nodes, key='name'):
	labels = [node[key] for node in nodes]
	
	matrix = {}
	
	for actual in labels:
		matrix[actual] = {}
		
		for predicted in labels:
			matrix[actual][predicted] = 0
			
	return matrix

def _calculate_precision_and_recall(matrix):
	precision = []
	recall = []
	
	# Convert the matrix dictionary to a multi-dimensional array
	values = []
	
	for actual_label in matrix:
		row = []
		for predicted_label in matrix[actual_label]:
			row.append(matrix[actual_label][predicted_label])
		values.append(row)
	
	# Calculate the recall values
	for x in range(0, len(values)):
		true_positive = values[x][x]
		all_positive = 0
		
		for y in range(0, len(values[0])):
			all_positive += values[x][y]
		
		if all_positive == 0:
			recall.append(None)
		else:
			recall.append(true_positive / all_positive)
	
	# Calculate the precision values
	for x in range(0, len(values)):
		true_positive = values[x][x]
		all_positive = 0
		
		for y in range(0, len(values[0])):
			all_positive += values[y][x]
		
		if all_positive == 0:
			precision.append(None)
		else:
			precision.append(true_positive / all_positive)
	
	return precision, recall

def confusion_matrix_full_route(request, model_manager, distortion_manager):
	# First of all, retrieve all parameters
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'distortion', 'mode']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	model_name = request.args.get('model')
	distortion_name = request.args.get('distortion')
	mode = request.args.get('mode')
	
	model = model_manager.get_model_modules()[model_name]
	dataset = model._dataset
	distortion = distortion_manager.distortion_modules[distortion_name]
	
	# Make the model predict all input images as well as distorted versions and 
	# store them in the category hierarchy
	hierarchy = _get_hierarchical_node_predictions(
		model, distortion, model_manager, distortion_manager
	)
	
	nodes = _find_all_leaves(hierarchy[0])[::-1]
	
	original_confusion_matrix = _get_empty_matrix(nodes, key='category')
	distorted_confusion_matrix = _get_empty_matrix(nodes, key='category')
	
	# Fill up confusion matrices depending on the predictions of all images 
	# within each category that have been made by the model
	original_images = _get_listed_node_predictions(model_name, distortion_name,
		model_manager, distortion_manager, 'index', 'original')
	distorted_images = _get_listed_node_predictions(model_name, distortion_name,
		model_manager, distortion_manager, 'index', 'distorted')
	
	for original_image in original_images:
		actual_category = original_image['categoryId']
		original_confusion_matrix[actual_category] \
			[original_image['prediction']['list']] += 1
	
	for distorted_image in distorted_images:
		actual_category = distorted_image['categoryId']
		distorted_confusion_matrix[actual_category] \
			[distorted_image['prediction']['list']] += 1
	
	if mode == 'original':
		matrix = original_confusion_matrix
		precision, recall = _calculate_precision_and_recall(matrix)
	elif mode == 'distorted':
		matrix = distorted_confusion_matrix
		precision, recall = _calculate_precision_and_recall(matrix)
	elif mode == 'difference':
		difference_confusion_matrix = _get_empty_matrix(nodes, key='category')
		
		# Calculate the difference between each element in both matrices
		for actual_label in difference_confusion_matrix:
			for predicted_label in difference_confusion_matrix[actual_label]:
				difference_confusion_matrix[actual_label][predicted_label] = \
					distorted_confusion_matrix[actual_label][predicted_label] \
					- original_confusion_matrix[actual_label][predicted_label]
		
		matrix = difference_confusion_matrix
		
		# Calculate the precision and recall differences
		original_precision, original_recall = _calculate_precision_and_recall(
			original_confusion_matrix
		)
		distorted_precision, distorted_recall = _calculate_precision_and_recall(
			distorted_confusion_matrix
		)
		
		precision = [i - j if i is not None and j is not None else None \
			for i, j in zip(distorted_precision, original_precision)]
		recall = [i - j if i is not None and j is not None else None \
			for i, j in zip(distorted_recall, original_recall)]
	
	matrix_labels = [str(key) for key in matrix.keys()]
	
	# Find the minimum and maximum values within the matrix
	value_range = {
		'minimum': math.inf,
		'maximum': -math.inf
	}
	
	for row in matrix.values():
		for value in row.values():
			if value < value_range['minimum']:
				value_range['minimum'] = value
			
			if value > value_range['maximum']:
				value_range['maximum'] = value
	
	response = {
		'confusionMatrix': {
			'range': value_range,
			'labels': matrix_labels,
			'matrix': matrix
		},
		'precision': precision,
		'recall': recall
	}
	
	return http_util.Respond(request, response, 'application/json')

def confusion_matrix_superset_route(request, model_manager, distortion_manager):
	# First of all, retrieve all parameters
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'distortion', 'mode']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	model_name = request.args.get('model')
	distortion_name = request.args.get('distortion')
	mode = request.args.get('mode')
	
	model = model_manager.get_model_modules()[model_name]
	dataset = model._dataset
	distortion = distortion_manager.distortion_modules[distortion_name]
	
	if 'superset' in request.args:
		superset_name = request.args.get('superset').replace('_', ' ')
	else:
		superset_name = dataset.category_hierarchy[0]['name']
	
	# Make the model predict all input images as well as distorted versions and 
	# store them in the category hierarchy
	hierarchy = _get_hierarchical_node_predictions(
		model, distortion, model_manager, distortion_manager
	)
	
	superset_node = _find_node_by_name(hierarchy[0], superset_name)
	direct_children = superset_node['children']
	
	original_confusion_matrix = _get_empty_matrix(direct_children)
	distorted_confusion_matrix = _get_empty_matrix(direct_children)
	
	leaves = _find_all_leaves(superset_node)
	
	# From the prediction data, build two confusion matrices, one for original 
	# input images and one for distorted input images
	for leaf in leaves:
		category = int(leaf['category'])
		
		actual_label = None
		for child in direct_children:
			if _category_is_a(hierarchy, category, child['name']):
				actual_label = child['name']
		
		original_predictions = leaf['predictions']['original']
		for key in original_predictions.keys():
			for child in direct_children:
				predicted_label = child['name']
				if _category_is_a(hierarchy, int(key), predicted_label):
					original_confusion_matrix[actual_label][predicted_label] += 1
		
		distorted_predictions = leaf['predictions']['distorted']
		for key in distorted_predictions.keys():
			for child in direct_children:
				predicted_label = child['name']
				if _category_is_a(hierarchy, int(key), predicted_label):
					distorted_confusion_matrix[actual_label][predicted_label] += 1
	
	# Format the output matrix depending on the chosen mode
	matrix = None
	precision = None
	recall = None
	
	if mode == 'original':
		matrix = original_confusion_matrix
		precision, recall = _calculate_precision_and_recall(matrix)
	elif mode == 'distorted':
		matrix = distorted_confusion_matrix
		precision, recall = _calculate_precision_and_recall(matrix)
	elif mode == 'difference':
		difference_confusion_matrix = _get_empty_matrix(direct_children)
		
		# Calculate the difference between each element in both matrices
		for actual_label in difference_confusion_matrix:
			for predicted_label in difference_confusion_matrix[actual_label]:
				difference_confusion_matrix[actual_label][predicted_label] = \
					distorted_confusion_matrix[actual_label][predicted_label] \
					- original_confusion_matrix[actual_label][predicted_label]
		
		matrix = difference_confusion_matrix
		
		# Calculate the precision and recall differences
		original_precision, original_recall = _calculate_precision_and_recall(
			original_confusion_matrix
		)
		distorted_precision, distorted_recall = _calculate_precision_and_recall(
			distorted_confusion_matrix
		)
		
		precision = [i - j if i is not None and j is not None else None \
			for i, j in zip(distorted_precision, original_precision)]
		recall = [i - j if i is not None and j is not None else None \
			for i, j in zip(distorted_recall, original_recall)]
	
	# Collect the amount of direct children of children of this superset
	children = {}
	
	for child in direct_children:
		if 'children' in child and child['children'] is not None:
			children[child['name']] = len(child['children'])
		else:
			children[child['name']] = 0
	
	response = {
		'input': {
			'superset': superset_name
		},
		'confusionMatrix': matrix,
		'precision': precision,
		'recall': recall,
		'children': children
	}
	
	return http_util.Respond(request, response, 'application/json')

def _get_prediction_certainty(predictions, category_id):
	for prediction in predictions:
		if int(prediction['categoryId']) == int(category_id):
			return float(prediction['certainty'])
	
	return 0.0

def confusion_images_superset_route(request, model_manager, distortion_manager):
	# First of all, retrieve all parameters
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'distortion', 'superset', 'sort']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	model_name = request.args.get('model')
	distortion_name = request.args.get('distortion')
	superset_name = request.args.get('superset')
	sort_by = request.args.get('sort')
	
	model = model_manager.get_model_modules()[model_name]
	dataset = model._dataset
	category_hierarchy = dataset.category_hierarchy.copy()[0]
	
	# Get all unique categories within the superset
	superset_node = _find_node_by_name(category_hierarchy, superset_name)
	
	if superset_node is None:
		return http_util.Respond(
			request,
			'The superset \"{}\" you defined is not present within the model\'s ' \
			'dataset \"{}\".'.format(superset_name, dataset.name),
			'text/plain',
			code=400
		)
	
	categories = _find_all_leaves(superset_node)
	
	# Create a list of all input images within all categories in the superset
	input_images = []
	
	for node in categories:
		input_images.extend(_get_images_of_category(dataset, int(node['category'])))
	
	# Add prediction certainties to each image
	for image in input_images:
		# Make the model predict both the original and the distorted input image
		original_predictions = prediction_router._get_single_prediction(
			model_name, int(image['index']), None, None, None, model_manager,
			distortion_manager, prediction_amount=None
		)		
		distorted_predictions = prediction_router._get_single_prediction(
			model_name, int(image['index']), distortion_name, None, None,
			model_manager, distortion_manager, prediction_amount=None
		)
		
		# Retrieve the certainty of the ground-truth category from the predictions
		original_certainty = _get_prediction_certainty(
			original_predictions['predictions'], int(image['categoryId'])
		)
		distorted_certainty = _get_prediction_certainty(
			distorted_predictions['predictions'], int(image['categoryId'])
		)
		
		# Add the data to each image
		certainty = {}
		certainty['original'] = original_certainty
		certainty['distorted'] = distorted_certainty
		certainty['difference'] = distorted_certainty - original_certainty
		
		image['certainty'] = certainty
	
	# Finally, sort the list of images
	if sort_by == 'ascending':
		input_images = sorted(
			input_images, key=lambda image: image['certainty']['difference']
		)
	elif sort_by == 'descending':
		input_images = sorted(
			input_images, key=lambda image: image['certainty']['difference'],
			reverse=True
		)
	elif sort_by == 'index':
		input_images = sorted(
			input_images, key=lambda image: image['index']
		)
	
	return http_util.Respond(request, input_images, 'application/json')

def confusion_images_subset_route(request, model_manager, distortion_manager):
	# First of all, retrieve all parameters
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'distortion', 'sort', 'inputMode', 
		'actualStart', 'actualEnd', 'predictedStart', 'predictedEnd']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	model_name = request.args.get('model')
	distortion_name = request.args.get('distortion')
	sort_by = request.args.get('sort')
	input_mode = request.args.get('inputMode')
	
	actual_start = int(request.args.get('actualStart'))
	actual_end = int(request.args.get('actualEnd'))
	predicted_start = int(request.args.get('predictedStart'))
	predicted_end = int(request.args.get('predictedEnd'))
	
	all_images = _get_listed_node_predictions(model_name, distortion_name,
		model_manager, distortion_manager, sort_by, input_mode)
	
	# Only keep images that fall into our constraints
	filtered_images = [image for image in all_images \
		if image['hierarchicalCategoryId'] >= actual_start \
		and image['hierarchicalCategoryId'] <= actual_end \
		and image['prediction']['hierarchical'] >= predicted_start \
		and image['prediction']['hierarchical'] <= predicted_end]
	
	# Add category names
	model = model_manager.get_model_modules()[model_name]
	categories = model._dataset.categories
	
	for image in filtered_images:
		image['prediction']['name'] = categories[image['prediction']['list']]
	
	return http_util.Respond(request, filtered_images, 'application/json')
