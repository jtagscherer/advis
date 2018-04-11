from skimage.transform import rotate

def get_display_name():
	return 'Rotate'

def get_parameters():
	return [
		{
			'name': 'rotation_range',
			'display_name': 'Rotation Range',
			'type': 'range',
			'constraints': {
				'min': -180,
				'max': 180
			},
			'default': {
				'lower': -45,
				'upper': 45
			}
		}
	]

def distort(image, configuration):
	return rotate(image, configuration['rotation_range'], mode='symmetric')
