from os import path
from enum import Enum

from models import inception

class Model(Enum):
	'''An enumeration of all models used in the plugin demo'''
	INCEPTION_V3 = 1

def get_checkpoint_file(model):
	"""Retrieves a checkpoint file for a given model. This can be used to set up
	a pre-trained model for demo purposes.

	Arguments:
		model: An enumeration value that references a specific model used in the
			plugin demo.

	Returns:
		A path to the checkpoint file of the desired model.
	"""
	
	path_base = path.dirname(path.dirname(path.dirname(__file__)))
	model_base = 'bazel-advis/external'
	
	print('PATH: {}'.format(path_base))
	
	if model is Model.INCEPTION_V3:
		model_path = 'model_inception_v3/inception_v3.ckpt'

	model_path = path.join(model_base, model_path)

	return path.join(path_base, model_path)

def get_model_name(model):
	"""Given a specific model, return a human-readable name.

	Arguments:
		model: An enumeration value that references a specific model used in the
		plugin demo.

	Returns:
		A human-readable name of the model.
	"""
	
	return {
		Model.INCEPTION_V3: 'InceptionV3'
	}[model]

def run_model(model, input, writer):
	"""Given a specific model, input data and a file writer, run the model on the 
	input data and record its summaries.

	Arguments:
		model: An enumeration value that references a specific model used in the
		plugin demo.
		input: The model's input data.
		writer: A `tf.summary.FileWriter` for recording summary data.
	"""
	
	checkpoint_file = get_checkpoint_file(model)
	
	if model is Model.INCEPTION_V3:
		inception.run(input, writer, checkpoint_file)
	else:
		raise KeyError('Cannot run the model {} since it is invalid'.format(model))
