from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os.path
import time

import argparse
import argutil

try:
	import urllib2 as urllib
except ImportError:
	import urllib.request as urllib

import tensorflow as tf
from models import models

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

def run(logdir, model, verbose=True):
	"""Run a model and generate summary data that can be shown in our plugin.

  Arguments:
		logdir: The directory where data will be written.
		run_name: A file writer that will be used to log the graph and summaries.
		verbose: True if additional data such as the time taken to run a model 
			should be written to the terminal.
  """
	
	model_name = models.get_model_name(model)
	
	# Measure performance by keeping track of the time
	starting_time = int(round(time.time()))
	
	# Set up a writer for our summary data, using the model name as the run name
	writer = tf.summary.FileWriter(os.path.join(logdir, model_name))
	
	with tf.Graph().as_default():
		# Load a test image
		url = 'https://upload.wikimedia.org/wikipedia/commons/9/93/Golden_Retriever_Carlos_%2810581910556%29.jpg'
		image_string = urllib.urlopen(url).read()
		image = tf.image.decode_jpeg(image_string, channels=3)
		
		# Run the model on our input data
		models.run_model(model=model, input=image, writer=writer)

	writer.close()
	
	ending_time = int(round(time.time()))
	
	if verbose:
		print('Running the model \"{}\" took {} seconds.'.format(model_name,
			ending_time - starting_time))

def main(argv):
	for model in list(models.Model):
		run(LOGDIR, model)
	
	print('All models have been run. Output saved to {}.'.format(LOGDIR))

if __name__ == '__main__':
	tf.app.run()
