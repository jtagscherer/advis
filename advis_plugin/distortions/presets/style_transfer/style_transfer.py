import tensorflow as tf

def get_display_name():
	return 'Style Transfer'

def get_parameters():
	return [
		{
			'name': 'style',
			'display_name': 'Style',
			'type': 'enum',
			'options': {
				'la_muse': {
					'display_name': 'La Muse (Pablo Picasso)'
				},
				'rain_princess': {
					'display_name': 'Rain Princess (Leonid Afremov)'
				},
				'shipwreck': {
					'display_name': 'The Shipwreck (J. M. W. Turner)'
				},
				'the_scream': {
					'display_name': 'The Scream (Edvard Munch)'
				},
				'udnie': {
					'display_name': 'Udnie (Francis Picabia)'
				},
				'wave': {
					'display_name': 'The Great Wave off Kanagawa (Katsushika Hokusai)'
				}
			},
			'default': 'wave'
		}
	]

def distort(image, configuration):
	tf.logging.warn(configuration)
	return image

def get_icon():
	# TODO: Add a nice icon
	return 'M11,2 L11,4.07 C7.38,4.53 4.53,7.38 4.07,11 L2,11 L2,13 L4.07,13 ' \
		+ 'C4.53,16.62 7.38,19.47 11,19.93 L11,22 L13,22 L13,19.93 C16.62,19.47 ' \
		+ '19.47,16.62 19.93,13 L22,13 L22,11 L19.93,11 C19.47,7.38 16.62,4.53 ' \
		+ '13,4.07 L13,2 L11,2 Z M11,6.08 L11,8 L13,8 L13,6.09 C15.5,6.5 ' \
		+ '17.5,8.5 17.92,11 L16,11 L16,13 L17.91,13 C17.5,15.5 15.5,17.5 ' \
		+ '13,17.92 L13,16 L11,16 L11,17.91 C8.5,17.5 6.5,15.5 6.08,13 L8,13 ' \
		+ 'L8,11 L6.09,11 C6.5,8.5 8.5,6.5 11,6.08 Z M12,11 C11.4477153,11 ' \
		+ '11,11.4477153 11,12 C11,12.5522847 11.4477153,13 12,13 ' \
		+ 'C12.5522847,13 13,12.5522847 13,12 C13,11.4477153 12.5522847,11 12,11 Z'
