def get_display_name():
	return 'Inception V3'

def get_version():
	return 1.0

def get_checkpoint_directory():
	return {
		'type': 'preset',
		'directory': 'inception_v3/inception_v3_checkpoint'
	}

def get_dataset():
	return 'nips_2017'

def annotate_node(node):
	return node.op in ['Conv2D', 'Relu', 'MaxPool', 'AvgPool', 'ConcatV2']
