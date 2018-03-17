from os import path
from enum import Enum

from models import preprocessing

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
    model_path = 'model_inception_v3/inception_v3.ckpt'

  model_path = path.join(model_base, model_path)

  return path.join(path.dirname(path.dirname(__file__)), model_path)

def preprocess_image(image, model):
  """Different standard models require different input formats. Given image data
  and a model, this function formats the image such that it can be processed by
  this specific model.

  Args:
    image: The input image.
    model: An enumeration value that references a specific model.

  Returns:
    The preprocessed input image that may now be passed to the model.
  """

  if model is Model.INCEPTION_V3:
    return preprocessing.preprocess_image_inception(image)
