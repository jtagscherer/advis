import tensorflow as tf
from tensorflow.python.ops import control_flow_ops
from tensorflow.contrib.slim.python.slim.nets import inception
slim = tf.contrib.slim

from advis_plugin import layer_summary

color_channels = 3
num_classes = 1001

def run(input, writer, checkpoint_file):
	"""Run a pre-trained Inception model on input data.

  Arguments:
		input: The input image for the Inception model.
		writer: A file writer that will be used to log the graph and summaries.
		checkpoint_file: Path to the checkpoint file for this pre-trained model.
  """

	processed_image = preprocess_image(input)
	
	# Make a batch of only one image by inserting a new dimension
	processed_images = tf.expand_dims(processed_image, 0)

	# Create the model, use the default arg scope to configure the batch norm
	# parameters.
	with slim.arg_scope(inception.inception_v3_arg_scope()):
		logits, _ = inception.inception_v3(processed_images,
			num_classes=num_classes, is_training=False)
		probabilities = tf.nn.softmax(logits)

		init_fn = slim.assign_from_checkpoint_fn(
			checkpoint_file,
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

def preprocess_image(image, central_fraction=0.875, scope=None):
  """Prepare one image for evaluation.
  If height and width are specified it would output an image with that size by
  applying resize_bilinear.
  If central_fraction is specified it would crop the central fraction of the
  input image.
	
  Arguments:
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
