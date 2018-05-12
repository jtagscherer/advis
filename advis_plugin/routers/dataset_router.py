from tensorboard.backend import http_util
from advis_plugin import argutil, imgutil

def datasets_route(request, dataset_manager):
	response = [{
		'name': name,
		'displayName': dataset.display_name,
		'imageCount': len(dataset.images)
	} for name, dataset in dataset_manager.get_dataset_modules().items()]
	
	return http_util.Respond(request, response, 'application/json')

def datasets_images_list_route(request, dataset_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['dataset']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	dataset_name = request.args.get('dataset')
	
	images = dataset_manager.get_dataset_modules()[dataset_name].images
	response = [{
		'index': index,
		'id': image['id'],
		'categoryId': image['categoryId'],
		'categoryName': image['categoryName']
	} for index, image in enumerate(images)]
	
	return http_util.Respond(request, response, 'application/json')

def datasets_images_image_route(request, dataset_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['dataset']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	# We always need the name of the desired dataset
	dataset_name = request.args.get('dataset')
	dataset = dataset_manager.get_dataset_modules()[dataset_name]
	
	# On top, we either need the desired image's index or ID
	if 'index' in request.args:
		image_index = int(request.args.get('index'))
		
		if image_index >= 0 and image_index < len(dataset.images):
			response = dataset.load_image(image_index, output='bytes')
		else:
			response = imgutil.get_placeholder_image()
	elif 'id' in request.args:
		image_id = request.args.get('id')
		image_index = None
		
		for index, image in enumerate(dataset.images):
			if image['id'] == image_id:
				image_index = index
				break
		
		if image_index != None:
			response = dataset.load_image(image_index, output='bytes')
		else:
			response = imgutil.get_placeholder_image()
	else:
		# No image has been specified, return a placeholder
		response = imgutil.get_placeholder_image()
	
	# Return the image data with proper headers set
	return http_util.Respond(request, response, 'image/png')
