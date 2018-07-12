from skimage.util import random_noise

def get_display_name():
	return 'Noise'

def get_type():
	return 'Preset'

def get_parameters():
	return [
		{
			'name': 'noise_amount',
			'display_name': 'Noise Amount',
			'type': 'constant',
			'constraints': {
				'min': 0,
				'max': 1,
				'step': 0.1
			},
			'default': 0.1
		}
	]

def distort(image, configuration):
	return random_noise(image, var=configuration['noise_amount'])

def get_icon():
	return 'M3,8.4 C3,8.4 3,3 8.4,3 C12,3 12.45,6.15 15.15,6.15 C18.75,6.15 ' \
		+ '18.75,3 18.75,3 L21,3 C21,3 21,8.4 15.6,8.4 C12,8.4 10.65,5.25 ' \
		+ '8.85,5.25 C5.25,5.25 5.25,8.4 5.25,8.4 L3,8.4 Z M3,14.7 C3,14.7 ' \
		+ '3,9.3 8.4,9.3 C12,9.3 12.45,12.45 15.15,12.45 C18.75,12.45 18.75,9.3 ' \
		+ '18.75,9.3 L21,9.3 C21,9.3 21,14.7 15.6,14.7 C12,14.7 10.65,11.55 ' \
		+ '8.85,11.55 C5.25,11.55 5.25,14.7 5.25,14.7 L3,14.7 Z M3,21 C3,21 ' \
		+ '3,15.6 8.4,15.6 C12,15.6 12.45,18.75 15.15,18.75 C18.75,18.75 ' \
		+ '18.75,15.6 18.75,15.6 L21,15.6 C21,15.6 21,21 15.6,21 C12,21 ' \
		+ '10.65,17.85 8.85,17.85 C5.25,17.85 5.25,21 5.25,21 L3,21 Z'
