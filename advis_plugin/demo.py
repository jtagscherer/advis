from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os.path

import argparse
import argutil

import tensorflow as tf

import summary as advis_summary

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

	summary_op = advis_summary.op("test_op", input_placeholder)

	writer = tf.summary.FileWriter(os.path.join(logdir, run_name))

	session = tf.Session()

	summary = session.run(summary_op, feed_dict={input_placeholder: data})
	writer.add_summary(summary)

	writer.close()

def main(argv):
	print('Saving output to %s.' % LOGDIR)
	run(LOGDIR, "Test Run", "If you see this, our plugin is working!")
	print('Done. Output saved to %s.' % LOGDIR)

if __name__ == '__main__':
	tf.app.run()
