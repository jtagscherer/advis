from skimage.util import random_noise

def get_display_name():
	return 'Noise'

def get_parameters():
	return [
		{
			'name': 'noise_amount',
			'display_name': 'Noise Amount',
			'type': 'constant',
			'constraints': {
				'min': 0,
				'max': 1
			},
			'default': 0.1
		}
	]

def distort(image, configuration):
	return random_noise(image, var=configuration['noise_amount'])
