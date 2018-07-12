from __future__ import division

import tensorflow as tf
from os.path import join, dirname, realpath

parent_directory = dirname(realpath(__file__))

exec(open(join(parent_directory, 'transform.py')).read())
exec(open(join(parent_directory, 'style_transfer_runner.py')).read())

def get_display_name():
	return 'Style Transfer'

def get_type():
	return 'Preset'

def get_parameters():
	return [
		{
			'name': 'style',
			'display_name': 'Style',
			'type': 'enum',
			'options': [
				{
					'name': 'la_muse',
					'displayName': 'La Muse (Pablo Picasso)'
				},
				{
					'name': 'rain_princess',
					'displayName': 'Rain Princess (Leonid Afremov)'
				},
				{
					'name': 'shipwreck',
					'displayName': 'The Shipwreck (J. M. W. Turner)'
				},
				{
					'name': 'the_scream',
					'displayName': 'The Scream (Edvard Munch)'
				},
				{
					'name': 'udnie',
					'displayName': 'Udnie (Francis Picabia)'
				},
				{
					'name': 'wave',
					'displayName': 'The Great Wave off Kanagawa (Katsushika Hokusai)'
				}
			],
			'default': 'wave'
		}
	]

_style_transfer_runners = {}

def _get_style_transfer_runner(image_size, style):
	key_tuple = (image_size, style)
	
	if key_tuple in _style_transfer_runners:
		return _style_transfer_runners[key_tuple]
	
	model_path = join(join(parent_directory, 'data'), '{}.ckpt'.format(style))
	
	# Create a new session
	soft_config = tf.ConfigProto(allow_soft_placement=True)
	soft_config.gpu_options.allow_growth = True
	_session = tf.Session(config=soft_config)
	
	runner = StyleTransferRunner(
		session=_session,
		model_path=model_path,
		image_size=image_size
	)
	
	_style_transfer_runners[key_tuple] = runner
	return runner

def distort(image, configuration):
	image = image * 255
	
	image_size = image.shape[0]
	
	output_image = _get_style_transfer_runner(
		image_size, 
		configuration['style']['name']
	).run(image)
	
	return output_image[0:image_size, 0:image_size, :] / 255

def get_icon():
	return 'M12.0063401,2 C11.7423606,2 11.4730436,2.10210169 ' \
		+ '11.2707694,2.30437587 L7.98604717,5.58909403 L4.00380053,5.58909403 ' \
		+ 'C2.95653473,5.58909403 2,6.53294512 2,7.58021677 L2,19.590365 ' \
		+ 'C2,20.6376366 2.95653473,21.5814877 4.00380053,21.5814877 ' \
		+ 'L19.9961995,21.5814877 C21.0434653,21.5814877 22,20.6376366 ' \
		+ '22,19.590365 L22,7.58021677 C22,6.53294512 21.0434653,5.58909403 ' \
		+ '19.9961995,5.58909403 L16.0139528,5.58909403 L12.7292306,2.30437587 ' \
		+ 'C12.5269564,2.10210169 12.2703196,2 12.0063401,2 Z ' \
		+ 'M12.0051709,3.45635481 L14.138725,5.60042372 L9.86109961,5.60042372 ' \
		+ 'L12.0051709,3.45635481 Z M3.73738907,7.52948745 ' \
		+ 'L20.2751215,7.52948745 L20.2751215,19.6410943 L3.73738907,19.6410943 ' \
		+ 'L3.73738907,7.52948745 Z M6.9967452,8.58211937 C5.94945016,8.58211937 ' \
		+ '4.99293882,9.53863364 4.99293882,10.5859246 C4.99293882,11.6332161 ' \
		+ '5.94945016,12.5897298 6.9967452,12.5897298 C8.04403439,12.5897298 ' \
		+ '9.00055158,11.6332196 9.00055158,10.5859246 C9.00055158,9.53863364 ' \
		+ '8.04403439,8.58211937 6.9967452,8.58211937 Z M18.9942057,10.5859246 ' \
		+ 'L14.9992789,14.5808519 L12.9954725,12.5897298 L6.9967452,18.5884624 ' \
		+ 'L18.9942057,18.5884624 L18.9942057,10.5859246 Z'
