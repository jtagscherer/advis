"""
Utility methods for dealing with command line parameters.
"""

import os

def check_directory_validity(parser, arg):
  if not os.path.exists(arg):
    try:
      os.makedirs(arg)
    except Exception as error:
      print('Could not create the specified directory: {}'.format(error))

  if not os.path.isdir(arg):
    parser.error('The directory {} does not exist!'.format(arg))
  else:
    return arg
