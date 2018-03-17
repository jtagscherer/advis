from os import path
from enum import Enum

class Model(Enum):
  '''An enumeration of all models used in the plugin demo'''
  INCEPTION_V3 = 1

def get_checkpoint_file(model):
  """Retrieves a checkpoint file for a given model. This can be used to set up
  a pre-trained model for demo purposes.

  Args:
    model: An enumeration value that references a specific model used in the
      plugin demo.

  Returns:
    A path to the checkpoint file of the desired model.
  """

  model_base = 'external'

  if model is Model.INCEPTION_V3:
    model_path = 'model_inception_v3/inception-v3/model.ckpt-157585'

  model_path = path.join(model_base, model_path)

  return path.join(path.dirname(path.dirname(__file__)), model_path)
