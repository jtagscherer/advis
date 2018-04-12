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
