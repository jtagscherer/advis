from skimage.transform import resize

def get_display_name():
	return 'Crop'

def get_type():
	return 'Preset'

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
	return resize(cropped_image, (original_height, original_width),
		mode='constant', anti_aliasing=True)

def get_icon():
	return 'M7,17 L7,1 L5,1 L5,5 L1,5 L1,7 L5,7 L5,17 C5,18.1045695 ' \
		+ '5.8954305,19 7,19 L17,19 L17,23 L19,23 L19,19 L23,19 L23,17 L7,17 Z ' \
		+ 'M17,15 L19,15 L19,7 C19,5.89 18.1,5 17,5 L9,5 L9,7 L17,7 L17,15 Z'
