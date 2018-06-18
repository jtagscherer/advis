from os.path import join

def get_display_name():
	return 'Inception V3'

def get_version():
	return 1.0

def get_checkpoint_directory():
	return {
		'type': 'preset',
		'directory': join('inception_v3', 'inception_v3_checkpoint')
	}

def get_dataset():
	return 'nips_2017'

def get_input_image_size():
	return 299

def get_output_node():
	return 'Softmax'

def annotate_node(node):
	return node.op in ['Conv2D', 'Relu', 'MaxPool', 'AvgPool', 'ConcatV2']
