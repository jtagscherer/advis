from skimage.transform import rotate

def get_display_name():
	return 'Rotate'

def get_type():
	return 'Preset'

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

def get_icon():
	return 'M12,18 C8.6862915,18 6,15.3137085 6,12 C6,11 6.25,10.03 6.7,9.2 ' \
		+ 'L5.24,7.74 C4.46,8.97 4,10.43 4,12 C4,16.418278 7.581722,20 12,20 ' \
		+ 'L12,23 L16,19 L12,15 L12,18 Z M12,4 L12,1 L8,5 L12,9 L12,6 ' \
		+ 'C15.3137085,6 18,8.6862915 18,12 C18,13 17.75,13.97 17.3,14.8 ' \
		+ 'L18.76,16.26 C19.54,15.03 20,13.57 20,12 C20,7.581722 16.418278,4 12,4 Z'
