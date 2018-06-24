from os.path import join

def get_display_name():
	return 'Inception 5h'

def get_version():
	return 1.0

def get_checkpoint_directory():
	return {
		'type': 'preset',
		'directory': join('inception_5h', 'inception_5h_checkpoint')
	}

def get_dataset():
	return 'nips_2017'

def get_input_image_size():
	return 224

def get_input_node():
	return 'image_input'

def get_output_node():
	return 'processed_output'

def annotate_node(node):
	return node.op in ['Conv2D', 'Relu', 'MaxPool', 'AvgPool', 'ConcatV2'] \
		and node.name not in ['nn0', 'nn1']
