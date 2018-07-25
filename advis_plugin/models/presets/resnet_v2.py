from os.path import join

def get_display_name():
	return 'ResNet V2'

def get_version():
	return 1.0

def get_checkpoint_directory():
	return {
		'type': 'preset',
		'directory': join('resnet_v2', 'resnet_v2_checkpoint')
	}

def get_dataset():
	return 'ilsvrc_2012'

def get_input_image_size():
	return 224

def get_input_node():
	return 'input'

def get_output_node():
	return 'Softmax'

def annotate_node(node):
	return 'resnet_v2' in node.name \
	 	and node.op in ['Conv2D', 'Relu', 'MaxPool', 'AvgPool', 'ConcatV2']
