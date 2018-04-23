from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os.path
import time

import argparse
import argutil

import tensorflow as tf

from models import models
from data import demo_data

# Set up command line parameters, used to set the output directory
parser = argparse.ArgumentParser(description='Create demo data to ' \
	'showcase the visualization capabilities of Advis.')

parser.add_argument(
	'--logdir',
	help='Directory where log files containing demo data will be written.',
	metavar='DIR', type=lambda x: argutil.check_directory_validity(parser, x),
	required=True
)

args = parser.parse_args()

# Directory into which to write TensorBoard data.
LOGDIR = args.logdir

model_manager = models.ModelManager(LOGDIR)

def run(logdir, model_name, verbose=True):
	"""Run a model and generate summary data that can be shown in our plugin.

  Arguments:
		logdir: The directory where data will be written.
		verbose: True if additional data such as the time taken to run a model 
			should be written to the terminal.
  """
	
	model = model_manager.get_model_modules()[model_name]
	
	# Measure performance by keeping track of the time
	starting_time = int(round(time.time()))
	
	# Set up a writer for our summary data, using the model name as the run name
	writer = tf.summary.FileWriter(os.path.join(logdir, model_name))
	
	with tf.Graph().as_default():
		# Retrieve a test image
		image = demo_data.get_demo_image()
		
		# Run the model on our input data
		model.run(image)

	writer.close()
	
	ending_time = int(round(time.time()))
	
	if verbose:
		print('Running the model \"{}\" took {} seconds.'.format(model.display_name,
			ending_time - starting_time))

def main(argv):
	run(LOGDIR, 'inception_v3')
	
	print('All models have been run. Output saved to {}.'.format(LOGDIR))

if __name__ == '__main__':
	tf.app.run()
