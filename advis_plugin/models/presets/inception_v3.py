import tensorflow as tf
from tensorflow.python.ops import control_flow_ops
from tensorflow.contrib.slim.python.slim.nets import inception
slim = tf.contrib.slim

from advis_plugin import layer_summary

def get_display_name():
	return 'Inception V3'

def get_checkpoint_file():
	return 'model_inception_v3/inception_v3.ckpt'

def run(input, writer, checkpoint_path):
	color_channels = 3
	num_classes = 1001
	
	# Make a batch of only one image by inserting a new dimension
	input_images = tf.expand_dims(input, 0)

	# Create the model, use the default arg scope to configure the batch norm
	# parameters.
	with slim.arg_scope(inception.inception_v3_arg_scope()):
		logits, _ = inception.inception_v3(input_images,
			num_classes=num_classes, is_training=False)
		probabilities = tf.nn.softmax(logits)

		init_fn = slim.assign_from_checkpoint_fn(
			checkpoint_path,
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

				if n.op in ['Conv2D', 'Relu', 'MaxPool', 'AvgPool',
					'ConcatV2', 'Identity']:
					summary_op = layer_summary.op(
						name='ActivationVisualization',
						parent_node_name=n.name,
						data=graph.get_tensor_by_name('{}:0'.format(n.name))
					)
			
			# Run the session and log all output data
			summary = sess.run(tf.summary.merge_all())
			writer.add_summary(summary)

def preprocess_input(image):
	central_fraction = 0.875
	scope = None
	
	image_size = inception.inception_v3.default_image_size

	with tf.name_scope(scope, 'eval_image', [image, image_size, image_size]):
		if image.dtype != tf.float32:
			image = tf.image.convert_image_dtype(image, dtype=tf.float32)
			# Crop the central region of the image with an area containing 87.5% of
			# the original image.
			if central_fraction:
				image = tf.image.central_crop(image, central_fraction=central_fraction)

		# Resize the image to the specified height and width.
		image = tf.expand_dims(image, 0)
		image = tf.image.resize_bilinear(image, [image_size, image_size],
			align_corners=False)
		image = tf.squeeze(image, [0])

		image = tf.subtract(image, 0.5)
		image = tf.multiply(image, 2.0)

		return image
