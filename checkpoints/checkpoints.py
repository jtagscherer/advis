from os import path

def get_checkpoint_directory(path_ending):
	return path.join(path.dirname(__file__), path_ending)
