import tensorflow as tf

class StyleTransferRunner:
	def __init__(self, session, model_path, image_size):
		self.sess = session
		self.image_size = image_size
		self.model_path = model_path
		self.transform = Transform()
		self._build_graph()
		self._load_model()

	def _build_graph(self):
		# Graph input
		self.x = tf.placeholder(
		tf.float32,
			shape=(self.image_size, self.image_size, 3),
			name='input'
		)
		self.xi = tf.expand_dims(self.x, 0)
		
		# Result image
		self.y_hat = self.transform.net(self.xi / 255.0)
		self.y_hat = tf.squeeze(self.y_hat)
		self.y_hat = tf.clip_by_value(self.y_hat, 0., 255.)
	
	def _load_model(self):
		# Initialize parameters
		self.sess.run(tf.global_variables_initializer())
		
		# Load pre-trained model
		saver = tf.train.Saver()
		saver.restore(self.sess, self.model_path)

	def run(self, input_image):
		return self.sess.run(self.y_hat, feed_dict={self.x: input_image})
