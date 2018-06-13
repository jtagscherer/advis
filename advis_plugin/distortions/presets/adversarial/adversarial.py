from __future__ import division

import numpy as np
import scipy.ndimage

import os
from os.path import join, dirname, realpath

def _load_perturbation_array():
	path = join(join(dirname(realpath(__file__)), 'data'),
		'universal_perturbation.npy')
	return np.load(path) / 255

# Load the perturbation array and store it
perturbation_array = _load_perturbation_array()[0]

# Create a cache for scaled perturbation arrays
perturbation_cache = {}

def _get_cached_perturbation(size):
	if size in perturbation_cache:
		return perturbation_cache[size]
	else:
		# Resize the perturbation array to the desired size
		zoom_factor = size / perturbation_array.shape[0]
		interpolation_order = 3
		
		red = perturbation_array[:, :, 0]
		green = perturbation_array[:, :, 1]
		blue = perturbation_array[:, :, 2]
		
		red = scipy.ndimage.zoom(red, zoom_factor, order=interpolation_order)
		green = scipy.ndimage.zoom(green, zoom_factor, order=interpolation_order)
		blue = scipy.ndimage.zoom(blue, zoom_factor, order=interpolation_order)
		
		result = np.stack([red, green, blue], axis=2)
		
		perturbation_cache[size] = result
		return result

def get_display_name():
	return 'Adversarial'

def get_parameters():
	return []

def distort(image, configuration):
	image_size = image.shape[0]
	return np.clip(image + _get_cached_perturbation(image_size), 0, 1)

def get_icon():
	return 'M11,2 L11,4.07 C7.38,4.53 4.53,7.38 4.07,11 L2,11 L2,13 L4.07,13 ' \
		+ 'C4.53,16.62 7.38,19.47 11,19.93 L11,22 L13,22 L13,19.93 C16.62,19.47 ' \
		+ '19.47,16.62 19.93,13 L22,13 L22,11 L19.93,11 C19.47,7.38 16.62,4.53 ' \
		+ '13,4.07 L13,2 L11,2 Z M11,6.08 L11,8 L13,8 L13,6.09 C15.5,6.5 ' \
		+ '17.5,8.5 17.92,11 L16,11 L16,13 L17.91,13 C17.5,15.5 15.5,17.5 ' \
		+ '13,17.92 L13,16 L11,16 L11,17.91 C8.5,17.5 6.5,15.5 6.08,13 L8,13 ' \
		+ 'L8,11 L6.09,11 C6.5,8.5 8.5,6.5 11,6.08 Z M12,11 C11.4477153,11 ' \
		+ '11,11.4477153 11,12 C11,12.5522847 11.4477153,13 12,13 ' \
		+ 'C12.5522847,13 13,12.5522847 13,12 C13,11.4477153 12.5522847,11 12,11 Z'
