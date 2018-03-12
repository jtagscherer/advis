from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os

from tensorboard import default
from tensorboard import program
import tensorflow as tf

from advis_plugin import plugin

if __name__ == '__main__':
	plugins = default.get_plugins() + [plugin.AdvisPlugin]
	assets = os.path.join(tf.resource_loader.get_data_files_path(), '../assets.zip')
	program.main(plugins, lambda: open(assets, 'rb'))
