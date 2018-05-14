from skimage.transform import warp, AffineTransform

def get_display_name():
	return 'Skew'

def get_parameters():
	return [
		{
			'name': 'skew_range',
			'display_name': 'Skew Range',
			'type': 'range',
			'constraints': {
				'min': -1,
				'max': 1
			},
			'default': {
				'lower': -0.5,
				'upper': 0.5
			}
		}
	]

def distort(image, configuration):
	transformation = AffineTransform(shear=configuration['skew_range'])
	return warp(image, inverse_map=transformation, mode='symmetric')

def get_icon():
	return 'M8,2 L8,4 L16,4 L16,2 L22,2 L22,8 L20,8 L20,16 L22,16 L22,22 ' \
		+ 'L16,22 L16,20 L8,20 L8,22 L2,22 L2,16 L4,16 L4,8 L2,8 L2,2 L8,2 Z ' \
		+ 'M16,8 L16,6 L8,6 L8,8 L6,8 L6,16 L8,16 L8,18 L16,18 L16,16 L18,16 ' \
		+ 'L18,8 L16,8 Z M4,4 L4,6 L6,6 L6,4 L4,4 Z M18,4 L18,6 L20,6 L20,4 ' \
		+ 'L18,4 Z M4,18 L4,20 L6,20 L6,18 L4,18 Z M18,18 L18,20 L20,20 L20,18 ' \
		+ 'L18,18 Z'
