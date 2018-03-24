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
from tensorflow.python.ops import control_flow_ops
from tensorflow.contrib.slim.python.slim.nets import inception
slim = tf.contrib.slim

import layer_summary
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

# Directory into which to write tensorboard data.
LOGDIR = args.logdir

def run(logdir, run_name, data):
	"""Run a session and write some test data that will be shown in our plugin."""
	
	# TODO: Pass a model array parameter instead of data and use it to run all 
	# models and summarize their outputs.
	
	writer = tf.summary.FileWriter(os.path.join(logdir, run_name))

	"""
	TEST: Set up and run the Inception model to test our infrastructure.
	"""

	color_channels = 3
	num_classes = 1001

	with tf.Graph().as_default():
		# Measure performance by keeping track of the time
		starting_time = int(round(time.time()))
		
		# Load a test image
		url = 'https://upload.wikimedia.org/wikipedia/commons/9/93/Golden_Retriever_Carlos_%2810581910556%29.jpg'
		image_string = urllib.urlopen(url).read()
		image = tf.image.decode_jpeg(image_string, channels=color_channels)

		processed_image = models.preprocess_image(image, models.Model.INCEPTION_V3)
		processed_images  = tf.expand_dims(processed_image, 0)

		# Create the model, use the default arg scope to configure the batch norm parameters.
		with slim.arg_scope(inception.inception_v3_arg_scope()):
			logits, _ = inception.inception_v3(processed_images, num_classes=num_classes, is_training=False)
			probabilities = tf.nn.softmax(logits)

			init_fn = slim.assign_from_checkpoint_fn(
				models.get_checkpoint_file(models.Model.INCEPTION_V3),
				slim.get_model_variables('InceptionV3')
			)

			with tf.Session() as sess:
				init_fn(sess)
				graph = tf.get_default_graph()
				nodes = graph.as_graph_def().node
				
				# Write the graph structure before we add any of our summaries
				writer.add_graph(graph)
				
				# Annotate all interesting nodes with layer summaries
				for n in nodes:
					if 'InceptionV3' not in n.name or 'save' in n.name or \
						'weights' in n.name or 'biases' in n.name or 'BatchNorm' in n.name:
						continue

					if n.op in ['Conv2D', 'Relu', 'MaxPool', 'AvgPool', 'ConcatV2', 'Identity']:
						summary_op = layer_summary.op(
							name='ActivationVisualization',
							parent_node_name=n.name,
							data=graph.get_tensor_by_name('{}:0'.format(n.name))
						)
				
				# Run the session and log all output data
				summary = sess.run(tf.summary.merge_all())
				writer.add_summary(summary)

	writer.close()
	
	ending_time = int(round(time.time()))
	print('Session took {} seconds.'.format(ending_time - starting_time))

def main(argv):
	print('Saving output to {}.'.format(LOGDIR))
	run(LOGDIR, 'Test Run', 'If you see this, our plugin is working!')
	print('Done. Output saved to {}.'.format(LOGDIR))

if __name__ == '__main__':
	tf.app.run()
