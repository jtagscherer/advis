from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os.path

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

import summary as advis_summary
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

	tf.reset_default_graph()

	input_placeholder = tf.placeholder(tf.string)
	summary_op = advis_summary.op('test_op', input_placeholder)
	writer = tf.summary.FileWriter(os.path.join(logdir, run_name))
	session = tf.Session()
	summary = session.run(summary_op, feed_dict={input_placeholder: data})
	writer.add_summary(summary)

	"""
	TEST: Set up and run the Inception model to test our infrastructure.
	"""

	color_channels = 3
	num_classes = 1001

	with tf.Graph().as_default():
		url = 'https://upload.wikimedia.org/wikipedia/commons/7/70/EnglishCockerSpaniel_simon.jpg'
		image_string = urllib.urlopen(url).read()
		image = tf.image.decode_jpeg(image_string, channels=color_channels)

		processed_image = models.preprocess_image(image, models.Model.INCEPTION_V3)
		processed_images  = tf.expand_dims(processed_image, 0)

		image_summary = tf.summary.image('Test Image Summary', processed_images)

		# Create the model, use the default arg scope to configure the batch norm parameters.
		with slim.arg_scope(inception.inception_v3_arg_scope()):
			logits, _ = inception.inception_v3(processed_images, num_classes=num_classes, is_training=False)
			probabilities = tf.nn.softmax(logits)
			result_summary = tf.summary.histogram('Predictions', probabilities)

			init_fn = slim.assign_from_checkpoint_fn(
				models.get_checkpoint_file(models.Model.INCEPTION_V3),
				slim.get_model_variables('InceptionV3')
			)

			with tf.Session() as sess:
				init_fn(sess)
				writer.add_graph(tf.get_default_graph())
				np_image, np_results = sess.run([image_summary, result_summary])
				writer.add_summary(np_image)
				writer.add_summary(np_results)

	writer.close()

def main(argv):
	print('Saving output to {}.'.format(LOGDIR))
	run(LOGDIR, 'Test Run', 'If you see this, our plugin is working!')
	print('Done. Output saved to {}.'.format(LOGDIR))

if __name__ == '__main__':
	tf.app.run()
