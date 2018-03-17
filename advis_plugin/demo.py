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

	image_size = inception.inception_v3.default_image_size
	color_channels = 3
	num_classes = 1001

	with tf.Graph().as_default():
		url = 'https://upload.wikimedia.org/wikipedia/commons/7/70/EnglishCockerSpaniel_simon.jpg'
		image_string = urllib.urlopen(url).read()
		image = tf.image.decode_jpeg(image_string, channels=color_channels)
		processed_image = preprocess_image(image, image_size, image_size)
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
				np_image, probabilities = sess.run([image, probabilities])
				probabilities = probabilities[0, 0:]
				sorted_inds = [i[0] for i in sorted(enumerate(-probabilities), key=lambda x:x[1])]

	print('Inception Predictions: {}'.format(sorted_inds))

	writer.close()

def preprocess_image(image, height, width,
                        central_fraction=0.875, scope=None):
  """Prepare one image for evaluation.
  If height and width are specified it would output an image with that size by
  applying resize_bilinear.
  If central_fraction is specified it would crop the central fraction of the
  input image.
  Args:
    image: 3-D Tensor of image. If dtype is tf.float32 then the range should be
      [0, 1], otherwise it would converted to tf.float32 assuming that the range
      is [0, MAX], where MAX is largest positive representable number for
      int(8/16/32) data type (see `tf.image.convert_image_dtype` for details).
    height: integer
    width: integer
    central_fraction: Optional Float, fraction of the image to crop.
    scope: Optional scope for name_scope.
  Returns:
    3-D float Tensor of prepared image.
  """
  with tf.name_scope(scope, 'eval_image', [image, height, width]):
    if image.dtype != tf.float32:
      image = tf.image.convert_image_dtype(image, dtype=tf.float32)
    # Crop the central region of the image with an area containing 87.5% of
    # the original image.
    if central_fraction:
      image = tf.image.central_crop(image, central_fraction=central_fraction)

    if height and width:
      # Resize the image to the specified height and width.
      image = tf.expand_dims(image, 0)
      image = tf.image.resize_bilinear(image, [height, width],
                                       align_corners=False)
      image = tf.squeeze(image, [0])
    image = tf.subtract(image, 0.5)
    image = tf.multiply(image, 2.0)
    return image

def main(argv):
	print('Saving output to {}.'.format(LOGDIR))
	run(LOGDIR, 'Test Run', 'If you see this, our plugin is working!')
	print('Done. Output saved to {}.'.format(LOGDIR))

if __name__ == '__main__':
	tf.app.run()
