from os.path import join

def get_display_name():
	return 'VGG 19'

def get_version():
	return 1.0

def get_checkpoint_directory():
	return {
		'type': 'preset',
		'directory': join('vgg_19', 'vgg_19_checkpoint')
	}

def get_dataset():
	return 'ilsvrc_2012'

def get_input_image_size():
	return 224

def get_input_node():
	return 'input'

def get_output_node():
	return 'Result'

def annotate_node(node):
	return 'eval_image' not in node.name and node.name != 'Result' \
	 	and node.op in ['Conv2D', 'Relu', 'MaxPool', 'AvgPool', 'ConcatV2']
