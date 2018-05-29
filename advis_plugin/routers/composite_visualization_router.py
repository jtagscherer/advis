from tensorboard.backend import http_util
from advis_plugin.util import argutil, imgutil
from advis_plugin.util.visualizations import Visualizations

import numpy as np
from math import floor, ceil

# Static configuration data
COMPOSITION_PADDING = 1

# Data caches for faster access
_composite_meta_cache = {}

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
	width = int(request.args.get('width'))
	height = int(request.args.get('height'))
	
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
	
	return http_util.Respond(request, response, 'application/json')

def _get_composition_meta_data(model_manager, model_name, layer_name, \
	image_index, distortion, width, height, padding):
	key_tuple = (model_name, layer_name, image_index, distortion, width, height, \
		padding)
	
	# Return cached meta information if we have already generated it before
	if key_tuple in _composite_meta_cache:
		return _composite_meta_cache[key_tuple]
	
	# Retrieve the resulting array of unit visualizations
	result = Visualizations().get_layer_visualization(
		model_manager, model_name, layer_name, image_index, distortion=distortion
	)
	
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
			'name': distortion_name,
			'imageAmount': distorted_image_amount
		}
	
	# Cache the result for later use
	_composite_meta_cache[key_tuple] = response
	
	return response

def _optimize_tile_size(tile_amount, width, height, padding=0):
	tile_size = 1 + (padding * 2)
	
	# Slowly increase the tile size and wrap tiles into as many rows as needed 
	# until the container overflows
	while True:
		amount_of_rows = ceil((tile_size * tile_amount) / width)
		amount_of_columns = ceil(tile_amount / amount_of_rows)
		
		if amount_of_rows * tile_size > height \
			or amount_of_columns * tile_size > width:
			break
		
		tile_size += 1
		
	tile_size = tile_size - 1
	
	return {
		'tileSize': tile_size - (padding * 2),
		'padding': padding,
		'rows': amount_of_rows,
		'columns': amount_of_columns,
		'width': tile_size * amount_of_columns,
		'height': tile_size * amount_of_rows,
	}
