from tensorboard.backend import http_util
from advis_plugin.util import argutil, imgutil
from advis_plugin.util.visualizations import Visualizations
from advis_plugin.util.cache import DataCache

import numpy as np
from math import floor, ceil

from PIL import Image
from io import BytesIO

# Static configuration data
COMPOSITION_PADDING = 1

data_type_meta = 'composite_visualization_meta'
data_type_composition = 'composite_visualization_composition'

def layer_image_route(request, model_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'layer', 'imageIndex', 'width', 'height']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	# Now that we are sure all necessary arguments are available, extract them 
	# from the request
	model_name = request.args.get('model')
	layer_name = request.args.get('layer')
	image_index = int(request.args.get('imageIndex'))
	width = max(int(request.args.get('width')), 1)
	height = max(int(request.args.get('height')), 1)
	
	# If a distortion should be applied, extract its name
	if 'distortion' in request.args:
		distortion_name = request.args.get('distortion')
		
		if 'imageAmount' not in request.args:
			return http_util.Respond(
				request,
				'In order to retrieve an activation visualization of distorted '
				+ 'images you have to specify the amount of distorted images to '
				+ 'create using the \"imageAmount\" parameter.',
				'text/plain',
				code=400
			)
		else:
			distorted_image_amount = int(request.args.get('imageAmount'))
			distortion = (distortion_name, distorted_image_amount)
	else:
		distortion = None
	
	key_tuple = (model_name, layer_name, image_index, distortion, width, height, \
		COMPOSITION_PADDING)
	
	if DataCache().has_data(data_type_composition, key_tuple):
		return http_util.Respond(
			request,
			DataCache().get_data(data_type_composition, key_tuple),
			'image/png'
		)
	
	# Fetch the unit images
	tile_images = Visualizations().get_layer_visualization(
		model_manager, model_name, layer_name, image_index, distortion=distortion
	)
	
	if not isinstance(tile_images, np.ndarray):
		return http_util.Respond(
			request,
			imgutil.get_placeholder_image(),
			'image/png'
		)
	
	# Fetch meta information on how the images should be stitched together
	meta = _get_composition_meta_data(
		model_manager, model_name, layer_name, image_index, distortion,
		width, height, COMPOSITION_PADDING
	)
	
	configuration = meta['configuration']
	
	# Create an empty canvas for the composition
	composition = Image.new('RGB',
		(configuration['width'], configuration['height']), 'white')
	
	# Copy each individual tile into the right position on the composition
	for tile in meta['tileMap']:
		bounds = tile['bounds']
		image_tile = Image.open(BytesIO(tile_images[tile['index']]))
		
		composition.paste(
			image_tile.resize((configuration['tileSize'], configuration['tileSize'])),
			(bounds['left'], bounds['top'], bounds['right'], bounds['bottom'])
		)
	
	with BytesIO() as byte_array:
		composition.save(byte_array, 'PNG')
		response = byte_array.getvalue()
	
	DataCache().set_data(data_type_composition, key_tuple, response)
	
	return http_util.Respond(request, response, 'image/png')

def layer_meta_route(request, model_manager):
	# Check for missing arguments and possibly return an error
	missing_arguments = argutil.check_missing_arguments(
		request, ['model', 'layer', 'imageIndex', 'width', 'height']
	)
	
	if missing_arguments != None:
		return missing_arguments
	
	# Now that we are sure all necessary arguments are available, extract them 
	# from the request
	model_name = request.args.get('model')
	layer_name = request.args.get('layer')
	image_index = int(request.args.get('imageIndex'))
	width = max(int(request.args.get('width')), 1)
	height = max(int(request.args.get('height')), 1)
	
	# If a distortion should be applied, extract its name
	if 'distortion' in request.args:
		distortion_name = request.args.get('distortion')
		
		if 'imageAmount' not in request.args:
			return http_util.Respond(
				request,
				'In order to retrieve an activation visualization of distorted '
				+ 'images you have to specify the amount of distorted images to '
				+ 'create using the \"imageAmount\" parameter.',
				'text/plain',
				code=400
			)
		else:
			distorted_image_amount = int(request.args.get('imageAmount'))
			distortion = (distortion_name, distorted_image_amount)
	else:
		distortion = None
	
	response = _get_composition_meta_data(
		model_manager, model_name, layer_name, image_index, distortion,
		width, height, COMPOSITION_PADDING
	)
	
	if response == None:
		response = {}
	
	return http_util.Respond(request, response, 'application/json')

def _get_composition_meta_data(model_manager, model_name, layer_name, \
	image_index, distortion, width, height, padding):
	key_tuple = (model_name, layer_name, image_index, distortion, width, height, \
		padding)
	
	# Return cached meta information if we have already generated it before
	if DataCache().has_data(data_type_meta, key_tuple):
		return DataCache().get_data(data_type_meta, key_tuple)
	
	# Retrieve the resulting array of unit visualizations
	result = Visualizations().get_layer_visualization(
		model_manager, model_name, layer_name, image_index, distortion=distortion
	)
	
	if not isinstance(result, np.ndarray):
		return;
	
	# Calculate the optimal tile size
	tile_amount = len(result)
	composition = _optimize_tile_size(tile_amount, width, height, padding=padding)
	
	# Create a dictionary with all units and their bounds in the composite image
	tile_map = []
	tile_size = composition['tileSize']
	
	for tile_index in range(0, tile_amount):
		row = floor(tile_index / composition['columns'])
		column = tile_index % composition['columns']
		
		tile_map.append({
			'index': tile_index,
			'row': row,
			'column': column,
			'bounds': {
				'left': (2 * padding + tile_size) * column + padding,
				'right': (2 * padding + tile_size) * column + padding + tile_size,
				'top': (2 * padding + tile_size) * row + padding,
				'bottom': (2 * padding + tile_size) * row + padding + tile_size
			}
		});
	
	response = {
		'configuration': composition,
		'model': model_name,
		'layer': layer_name,
		'imageIndex': image_index,
		'tileMap': tile_map
	}
	
	if distortion != None:
		response['distortion'] = {
			'name': distortion[0],
			'imageAmount': distortion[1]
		}
	
	# Cache the result for later use
	DataCache().set_data(data_type_meta, key_tuple, response)
	
	return response

def _optimize_tile_size(tile_amount, width, height, padding=0):
	tile_size = 1 + (padding * 2)
	
	last_amount_of_rows = ceil((tile_size * tile_amount) / width)
	last_amount_of_columns = ceil(tile_amount / last_amount_of_rows)
	last_tile_size = tile_size
	
	# Slowly increase the tile size and wrap tiles into as many rows as needed 
	# until the container overflows
	while True:
		amount_of_rows = ceil((tile_size * tile_amount) / width)
		amount_of_columns = ceil(tile_amount / amount_of_rows)
		
		if amount_of_rows * tile_size > height:
			break
		
		if amount_of_columns * tile_size <= width:
			last_amount_of_rows = amount_of_rows
			last_amount_of_columns = amount_of_columns
			last_tile_size = tile_size
		
		tile_size += 1
	
	return {
		'tileSize': last_tile_size - (padding * 2),
		'padding': padding,
		'rows': last_amount_of_rows,
		'columns': last_amount_of_columns,
		'width': last_tile_size * last_amount_of_columns,
		'height': last_tile_size * last_amount_of_rows,
	}
