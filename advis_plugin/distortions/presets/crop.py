from skimage.transform import resize

def get_display_name():
	return 'Crop'

def get_parameters():
	return [
		{
			'name': 'zoom_factor',
			'display_name': 'Zoom Factor',
			'type': 'constant',
			'constraints': {
				'min': 1,
				'max': 10
			},
			'default': 2
		},
		{
			'name': 'vertical_crop_range',
			'display_name': 'Vertical Crop Range',
			'type': 'range',
			'constraints': {
				'min': 0,
				'max': 1
			},
			'default': {
				'lower': 0,
				'upper': 1
			}
		},
		{
			'name': 'horizontal_crop_range',
			'display_name': 'Horizontal Crop Range',
			'type': 'range',
			'constraints': {
				'min': 0,
				'max': 1
			},
			'default': {
				'lower': 0,
				'upper': 1
			}
		}
	]

def distort(image, configuration):
	original_height, original_width, _ = image.shape
	
	# Crop the image accordingly
	cropped_width = int(original_width / configuration['zoom_factor'])
	cropped_height = int(original_height / configuration['zoom_factor'])
	
	left = int(configuration['vertical_crop_range'] \
	 	* (original_width - cropped_width))
	top = int(configuration['horizontal_crop_range'] \
	 	* (original_height - cropped_height))
	
	cropped_image = image[top : top + cropped_height, left : left + cropped_width]
	
	# Resize the cropped image to its original size
	return resize(cropped_image, (original_height, original_width))
