import tensorflow as tf
from tensorflow.python.ops import control_flow_ops
from tensorflow.contrib.slim.python.slim.nets import inception
slim = tf.contrib.slim

from models import models
from advis_plugin import layer_summary

color_channels = 3
num_classes = 1001

def run(input, writer):
	"""Run a pre-trained Inception model on input data.

  Arguments:
		input: The input image for the Inception model.
		writer: A file writer that will be used to log the graph and summaries.
  """

	processed_image = models.preprocess_image(input, models.Model.INCEPTION_V3)
	processed_images = tf.expand_dims(processed_image, 0)

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
